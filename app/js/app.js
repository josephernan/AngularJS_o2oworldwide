/*global angular*/
/*
   Created: 02/02/2016 By Henry
*/

var __version_number = 5.6

var _is_mobile_app = function () {
  return (typeof cordova !== 'undefined' || typeof PhoneGap !== 'undefined' || typeof phonegap !== 'undefined') && /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent)
}

var console = console || {
  log: function (msg) {
    /* make IE happy */
  }
}

// determine if there is a language specified via GET params
var ___get_params_regex = /[?&]([^=#]+)=([^&#]*)/g,
    __get_params = {},
    __get_params_match;
while(__get_params_match = ___get_params_regex.exec(window.location.href)) {
    __get_params[__get_params_match[1]] = __get_params_match[2];
}
delete __get_params_match;

$(function () {
  // Android Stock Browser fix
  var nua = navigator.userAgent
  var isAndroid = (nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1 && nua.indexOf('Chrome') === -1)
  if (isAndroid) {
    $('select.form-control').removeClass('form-control').css('width', '100%')
  }

  // IE 'fix'
  if (nua.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement('style')
    msViewportStyle.appendChild(
      document.createTextNode(
        '@-ms-viewport{width:auto!important}'
      )
    )
    document.querySelector('head').appendChild(msViewportStyle)
  }
})

var app = angular.module('o2o_store', [
  'angularMoment',
  'angular-loading-bar',
  'ngSanitize',
  'ngAnimate',
  'ngResource',
  'ngRetina',
  'ui.router',
  'ui.bootstrap',
  'pascalprecht.translate',
  'LocalStorageModule',
  'ngCookies',
  'ui.bootstrap.showErrors',
  'datatables',
  'datatables.bootstrap',
  'ngCart',
  'oc.lazyLoad',
  'jlareau.pnotify',
  'infinite-scroll'
])
  .constant('APP_CONFIG', {
    'available_languages': {
      'en': 'en',
      'zh': 'zh-hans'
    }
  })
  .config(
    [
      'APP_CONFIG',
      '$stateProvider',
      '$urlRouterProvider',
      '$translateProvider',
      'cfpLoadingBarProvider',
      'localStorageServiceProvider',
      'notificationServiceProvider',
      'showErrorsConfigProvider',
      'uibPaginationConfig',
      'ngRetinaProvider',

      function (
        APP_CONFIG,
        $stateProvider,
        $urlRouterProvider,
        $translateProvider,
        cfpLoadingBarProvider,
        localStorageServiceProvider,
        notificationServiceProvider,
        showErrorsConfigProvider,
        uibPaginationConfig,
        ngRetinaProvider
      ) {

        // display the loading bar all the time :)
        cfpLoadingBarProvider.latencyThreshold = 0
        cfpLoadingBarProvider.includeSpinner = true
        // cfpLoadingBarProvider.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>'
        cfpLoadingBarProvider.spinnerTemplate = '<div id="loading-bar-spinner" style="top:auto;bottom:10px;"><svg style="height:15px;width:15px;z-index:2000;" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle></svg></div>'

        showErrorsConfigProvider.showSuccess(true);

        uibPaginationConfig.previousText="‹";
        uibPaginationConfig.nextText="›";
        uibPaginationConfig.firstText="«";
        uibPaginationConfig.lastText="»";

        ngRetinaProvider.setInfix('_2x');
        ngRetinaProvider.setFadeInWhenLoaded(true);

        // if a language was passed via URL
        var _req_lang = _.get(__get_params, 'force_lang') || _.get(__get_params, 'lang') || false;
          _pref_lang_fnc = ( _req_lang && _.get(APP_CONFIG.available_languages, _req_lang.substr(0, 2)))
          ? function() {v
            console.log('Language Preferred (语言首选): ' + _.get(APP_CONFIG.available_languages, _req_lang.substr(0, 2)) + ' (' + _req_lang + ')');
            return _.get(APP_CONFIG.available_languages, _req_lang.substr(0, 2));
          }
          : null;

        $translateProvider
          .useLoader('$translatePartialLoader', {
            urlTemplate: 'assets/json/translate/{part}/{lang}.json'
          })
          .registerAvailableLanguageKeys(['en', 'zh-hans'], {
            'en_*': 'en',
            'en-*': 'en',
            'zh-CN': 'zh-hans',
            'zh_*': 'zh-hans',
            'zh-*': 'zh-hans',
          })

          // .useMessageFormatInterpolation()
          // .fallbackLanguage( 'en' ) // disabled due to bug in angular-translate 2.9.2
          .useLocalStorage()
          // enabling console logging for missing langs
          .useMissingTranslationHandlerLog()
          // using 'escaped' protects somewhat against XSS attacks
          .useSanitizeValueStrategy('escaped')
          .useLoaderCache(true)
          .uniformLanguageTag('bcp47')
          .determinePreferredLanguage(_pref_lang_fnc);

        localStorageServiceProvider
          .setPrefix('o2o.store')
          .setNotify(true, true)

        notificationServiceProvider
          .setDefaults({
            styling: 'fontawesome'
          })
          //
          //   // Configure a stack named 'bottom_left' that append a call
          .setStack('bottom_left', 'stack-bottomleft', {
            dir1: 'up',
            dir2: 'left',
            firstpos1: 25,
            firstpos2: 25
          })
          //
          //   // Configure a stack named 'top_left' that append a call 'stack-topleft'
          //   .setStack( 'top_left', 'stack-topleft', {
          //     dir1: 'down',
          //     dir2: 'right',
          //     push: 'top'
          //   } )
            .setDefaultStack('bottom_left')

        // If we move to a custom localstorage cache service this will be helpful:
        // $translateProvider.useLoaderCache( true )
        // $translateProvider.useLoaderCache('yourSpecialCacheService')

        $stateProvider
          .state('root', {
            url: '',
            abstract: true,
            views: {
              'header': {
                templateUrl: 'views/partials/ui/header.html',
                controller: 'HeaderController'
              }
            },
            resolve: {
              $store: [ 'storeService', function (storeService) {
                return storeService.get_store();
              } ],
              locale: [ '$translatePartialLoader', '$translate', '$q', function ($translatePartialLoader, $translate) {
                $translatePartialLoader
                  .addPart('general')
                  .addPart('countries_zones')
                // We have to include this refresh, because at this root state
                // app.run has not yet setup automatic refreshing.
                return $translate.refresh()
              } ],
            }
          })

          .state('root.home', {
            url: '/',
            views: {
              '@': {
                templateUrl: 'views/partials/store/store.html',
                // templateUrl: 'views/partials/store/store.html',
                controller: 'StoreController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader.addPart('store')
              } ]
            }
          })

          .state('root.login', {
            url: '/login',
            views: {
              '@': {
                templateUrl: 'views/partials/ui/login.html',
                controller: 'LoginController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader.addPart('login')
              } ]
            }
          })
          .state('root.logout', {
            url: '/logout',
            views: {
              '@': {
                templateUrl: 'views/partials/ui/login.html',
                controller: 'LoginController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader.addPart('login')
              } ]
            }
          })
          .state('root.signup', {
            url: '/signup',
            views: {
              '@': {
                templateUrl: 'views/partials/signup/customer.html',
                controller: 'LoginController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader.addPart('signup')
              } ]
            }
          })
          .state('root.signup.social_marketer', {
            url: '/social_marketer',
            views: {
              '@': {
                templateUrl: 'views/partials/signup/social_marketer.html',
                controller: 'LoginController'
              }
            }
          })

          .state('root.product', {
            url: '/product/:sku',
            views: {
              '@': {
                templateUrl: 'views/partials/store/product.html',
                controller: 'ProductController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader.addPart('product')
              } ],
              product: [ '$stateParams', 'storeService', function ($stateParams, storeService) {
                return storeService.get_product({sku: $stateParams.sku})
              } ]
            }
          })

          .state('root.product.slug', {
            url: '/:slug'
          })

          .state('root.checkout', {
            url: '/checkout',
            views: {
              '@': {
                templateUrl: 'views/partials/checkout/index.html',
                controller: 'CheckoutController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader
                  .addPart('checkout')
                  .addPart('order_status')
              } ]
            }
          })

          .state('root.checkout.info', {
            url: '/info',
            views: {
              '@': {
                templateUrl: 'views/partials/checkout/info.html',
                controller: 'CheckoutController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader
                  .addPart('checkout')
                  .addPart('order_status')
              } ]
            }
          })

          .state('root.checkout.complete', {
            url: '/complete/:order_id',
            views: {
              '@': {
                templateUrl: 'views/partials/checkout/complete.html',
                controller: 'CheckoutController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader
                  .addPart('checkout')
                  .addPart('order_status')
              } ]
            }
          })

          .state('root.rma', {
            url: '/return-center/{order_id}',
            views: {
              '@': {
                templateUrl: 'views/partials/rma/index.html',
                controller: 'RMAController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader
                  .addPart('rma');
              } ]
            }
          })
          .state('root.rma.info', {
            url: '/info',
            views: {
              '@': {
                templateUrl: 'views/partials/rma/info.html',
                controller: 'RMAController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader
                  .addPart('rma');
              } ]
            }
          })
          .state('root.rma.status', {
            url: '/status',
            views: {
              '@': {
                templateUrl: 'views/partials/rma/status.html',
                controller: 'RMAController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader
                  .addPart('rma');
              } ]
            }
          })

          .state('root.filter', {
            url: '/filter/:type/:filter_id',
            views: {
              '@': {
                templateUrl: 'views/partials/filter/filter.html',
                controller: 'FilterController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader.addPart('filter')
              } ]
            }
          })

          .state('root.search', {
            url: '/search/:query',
            views: {
              '@': {
                templateUrl: 'views/partials/filter/search.html',
                controller: 'SearchController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader.addPart('filter');
              } ]
            }
          })

          .state('root.account', {
            url: '/account',
            views: {
              '@': {
                templateUrl: 'views/partials/account/index.html',
                controller: 'AccountController',
                resolve: {
                  account_locale: [ '$translatePartialLoader', '$translate', function ($translatePartialLoader, $translate) {
                    $translatePartialLoader
                      .addPart('account')
                      .addPart('checkout')
                      .addPart('order_status');

                    return $translate.refresh();
                  } ]
                }
              },
              'sidebar@root.account': {
                templateUrl: 'views/partials/account/sidebar.html'
              },
              'content@root.account': {
                templateUrl: 'views/partials/account/account.html'
              }
            }
          })
          .state('root.account.my_orders', {
            url: '/my-orders',
            views: {
              'content@root.account': {
                templateUrl: 'views/partials/account/my_orders.html',
                controller: 'AccountController'
              },
              resolve: {
                locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                  return $translatePartialLoader
                    .addPart('account')
                    .addPart('checkout')
                    .addPart('order_status')
                } ]
              }
            }
          })
          .state('root.account.customer_orders', {
            url: '/customer-orders',
            views: {
              'content@root.account': {
                templateUrl: 'views/partials/account/social_marketer/customers_orders.html',
                controller: 'AccountController',
              },
              resolve: {
                locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                  return $translatePartialLoader
                    .addPart('account')
                    .addPart('checkout')
                    .addPart('order_status')
                } ]
              }
            }
          })
          .state('root.account.commissions', {
            url: '/commissions',
            views: {
              'content@root.account': {
                templateUrl: 'views/partials/account/social_marketer/index_commissions.html',
                controller: 'AccountController'
              },
              resolve: {
              }
            }
          })
          .state('root.account.order', {
            url: '/order/:order_id',
            views: {
              'content@root.account': {
                templateUrl: 'views/partials/account/order.html',
                controller: 'CheckoutController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader
                  .addPart('account')
                  .addPart('checkout')
                  .addPart('order_status')
              } ]
            }
          })
          // .state('root.account.business_center', {
          //   url: '/business-center',
          //   views: {
          //     'content@root.account': {
          //       templateUrl: 'views/partials/account/business_center/index.html',
          //       controller: 'AccountBusinessCenterController',
          //       resolve: {
          //         business_center: [ 'storeService', function (storeService) {
          //           return storeService.get_business_center()
          //         } ]
          //       }
          //     },
          //     resolve: {
          //       locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
          //         return $translatePartialLoader
          //                 .addPart('account')
          //                 .addPart('filter')
          //       } ]
          //     }
          //   }
          // })
          // .state('root.account.business_center.manage_brand', {
          //   url: '/manage-brand/:brand_id',
          //   views: {
          //     'content@root.account': {
          //       templateUrl: 'views/partials/account/business_center/manage_brand.html',
          //       controller: 'AccountBusinessCenterController',
          //       resolve: {
          //         business_center: [ 'storeService', function (storeService) {
          //           return storeService.get_business_center()
          //         } ]
          //       }
          //     },
          //     resolve: {
          //       locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
          //         return $translatePartialLoader
          //                 .addPart('account')
          //                 .addPart('filter')
          //       } ]
          //     }
          //   }
          // })
          .state('root.account.replicated_site', {
            url: '/replicated-site',
            views: {
              'content@root.account': {
                templateUrl: 'views/partials/account/social_marketer/replicated_site/summary.html',
                controller: 'ReplicatedSiteBannerController'
              }
            },
            resolve: {
              // locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
              //   return $translatePartialLoader.addPart('filter')
              // } ]
            }
          })
          .state('root.account.replicated_site.customize_banners', {
            url: '/customize-banners',
            views: {
              'content@root.account': {
                templateUrl: 'views/partials/account/social_marketer/replicated_site/customize_banners.html',
                controller: 'ReplicatedSiteBannerController'
              }
            },
            resolve: {
              // locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
              //   return $translatePartialLoader.addPart('filter')
              // } ]
            }
          })
          .state('root.marketer', {
            url: '/account/my-social-marketer',
            views: {
              '@': {
                templateUrl: 'views/partials/socialMarketer.html',
                controller: 'MarketerController'
              },
            }
          })
          .state('root.brand', {
            url: '/brand/:brand_id/:brand_name',
            views: {
              '@': {
                templateUrl: 'views/partials/brand/index.html',
                controller: 'BrandController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader.addPart('other')
              } ]
            }
          })
          .state('root.all_products', {
            url: '/all-products',
            views: {
              '@': {
                templateUrl: 'views/partials/other/all_products.html',
                controller: 'AllProductsController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
                return $translatePartialLoader.addPart('other')
              } ]
            }
          })
          .state( 'root.commissions_table', {
            url: '/commissions-table',
            views: {
              '@': {
                templateUrl: 'views/partials/other/commissions_table.html',
                controller: 'CommissionsController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ( $translatePartialLoader ) {
                return $translatePartialLoader.addPart( 'commissions_table' );
              } ]
            }
          })
          .state('root.toc', {
            url: '/terms-and-conditions',
            views: {
              '@': {
                templateUrl: 'views/partials/other/toc/index.html'
              }
            }
          })

          .state('root.relations', {
            url: '/relations',
            abstract: true
          })

          .state('root.relations.assets', {
            url: '/assets',
            views: {
              '@': {
                templateUrl: 'views/partials/relations/assets.html',
                controller: 'RelationsController'
              }
            }
          })
          .state('root.contact', {
            url: '/contact/:name',
            views: {
              '@': {
                templateUrl: 'views/partials/contact/index.html',
                controller: 'ContactController'
              }
            },
            resolve: {
              locale: [ '$translatePartialLoader', function ( $translatePartialLoader ) {
                return $translatePartialLoader.addPart( 'contact' );
              } ]
            }
          })

        $urlRouterProvider.otherwise('/')
      } ])
  .constant('_', window._)
  .run(
    [
      '$rootScope',
      'APP_CONFIG',
      '$state',
      '$stateParams',
      '$anchorScroll',
      '$translate',
      'storeService',
      '$ocLazyLoad',
      '$timeout',
      'notificationService',
      'localStorageService',

      function (
        $rootScope,
        APP_CONFIG,
        $state,
        $stateParams,
        $anchorScroll,
        $translate,
        storeService,
        $ocLazyLoad,
        $timeout,
        notificationService,
        localStorageService
      ) {
        // Setting up easy language functions - not used a lot, but could come in handy
        var lang = {
          _langs: APP_CONFIG.available_languages,
          available: function (_langKey) {
            var langKey = (typeof _langKey === 'string') ? _langKey.substr(0, 2) : false;

            var available = Object.keys(lang._langs);

            if (langKey) {
              return _.includes(available, langKey);
            }

            return ($rootScope.lang.current().substr(0, 2) == 'en') ? ['en', 'zh'] : ['zh', 'en']
          },
          changeMomentLanguage: function (langKey) {
            langKey = (langKey === undefined) ? lang.current() : langKey
            if (langKey === 'zh-hans') {
              $ocLazyLoad.load({
                files: [ 'assets/js/moment_locale/zh-cn.js' ],
                cache: true,
                timeout: 5000
              })
                .then(function () {
                  moment.locale('zh-cn')
                })
            } else {
              moment.locale('en')
            }
          },
          changeLanguage: function (_langKey) {
            var langKey = _langKey.substring(0, 2);

            if (_.includes(lang.available(), langKey)) {
              this.changeMomentLanguage(_langKey)
              return $translate.use(_langKey)
                .then(function(r) {
                  $('html').attr('lang', _langKey).attr('xml:lang', _langKey);
                  return r;
                })
            }
            return $q.when(false);
          },
          loadModule: function ($event, module) {
            $event.preventDefault()
            $translatePartialLoader.addPart(module)
            $translate.refresh()
          },
          unloadModule: function ($event, module) {
            $event.preventDefault()
            $translatePartialLoader.deletePart(module)
            $translate.refresh()
          },
          current: function () {
            return $translate.proposedLanguage() || $translate.use() || $translate.preferredLanguage()
          }
        }

        // Application wide $scope extending
        angular.extend($rootScope, {
          lang: lang,
          $state: $state,
          $stateParams: $stateParams,
          _: window._,
          $store: storeService,
          $notify: notificationService,
          $translate: $translate,
          dtOptions: {"hasBootstrap":true,"oClasses":{"sPageButtonActive":"active"}}
        })

        var _force_lang = _.get(__get_params, 'force_lang');
        if (_force_lang && _.get(APP_CONFIG.available_languages, _force_lang.substr(0, 2))) {
          console.log('Language Forced (语言强制): ' + _.get(APP_CONFIG.available_languages, _force_lang.substr(0, 2)) + ' (' + _force_lang + ')');
          $translate.use(_.get(APP_CONFIG.available_languages, _force_lang.substr(0, 2)));
        }

        // running this will download (if the language is set to 'zh-cn')
        // the chinese moment locale and set it's lang accordingly
        $rootScope.lang.changeMomentLanguage()

        $('html').attr('lang', lang.current()).attr('xml:lang', lang.current());


        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
          if ($translate && $translate.refresh) {
            $translate.refresh()
          } else {
            console.error('Warning: Translate Failed to refresh')
          }
        })

        // $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, error) {
        //   console.log('current_state')
        //   console.log(localStorageService.get('o2o.current_state'))
        // })


        // Fix for scrolling properly when changing states.
        $rootScope.$previousState = false
        $rootScope.$previousStateParams = false;

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams, error) {
          $rootScope.$previousState = fromState || false;
          $rootScope.$previousStateParams.$params = fromParams || false;
          $anchorScroll();
          // localStorageService.set('o2o.current_state', toState.name + '?' + $.param(toParams))
        });

        // window.onbeforeunload = function (e) {
        //   localStorageService.remove('o2o.current_state')
        // }

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
          console.log('$stateChangeError')
          console.log(error)

          switch ( error ) {
            case 'no-product':
              $state.go('root.home')
              break
          // causes loop and page crash
          // default:
          //   $state.go("root.home")
          }
          if (error === 'no') {
            event.preventDefault()
          // $state.go("login")
          }
        })

        $rootScope.add_commas = function (price) {
          var parts = price.toString().split('.')
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          return parts.join('.')
        }

        $rootScope.get_price_str = function (o2o_price) {
          var price = parseFloat(o2o_price).toFixed(2)
          var currency_char = '$'

          if ($rootScope.lang.current() !== 'en' && $rootScope.$store.yuan_conversion_rate && $rootScope.$store.yuan_conversion_rate > 0) {
            price = parseFloat(Math.round((o2o_price * $rootScope.$store.yuan_conversion_rate) * 100) / 100).toFixed(2)
            currency_char = '¥'
          }

          return currency_char + $rootScope.add_commas(price)
        }

        $rootScope.is_mobile_app = function () {
          return _is_mobile_app()
        }

        $rootScope.get_lang_attr = function (product, key) {
          var clang = $rootScope.lang.current().substring(0, 2)

          if (_.isInteger(product)) {
            product = $store.get_product({id: product});
          }

          if (('lang' in product) && (clang in product.lang) && (key in product.lang[clang])) {
            return product.lang[clang][key]
          }

          if (key in product) {
            return product[key]
          }

          return ''
        }

        $rootScope.add_to_cart = function(product) {
          $rootScope.$cart.addItem(1, product);
          $rootScope.$notify.success('Successfully Added <strong>' + $rootScope.get_lang_attr(product, 'name') + '</strong> to your Cart.');
        };

        // 0  -> default (not loading)
        // 1  -> loading
        // 2 -> finished
        $rootScope.brand_loading = 0

        $rootScope.brand_meta = function (brand_id, key) {
          var brand = false

          if (brand_id && $rootScope.$store.brands && (brand_id in $rootScope.$store.brands)) {
            brand = $rootScope.$store.brands[brand_id]
          }

          if (!brand) {
            return ''
          }

          if ($rootScope.brand_loading !== 1) {
            if (key === 'name') {
              return brand.name
            }

            // lets try to optimize the search... try the current lang
            var current_lang = $rootScope.lang.current()
            if ((current_lang in brand.meta) && (key in brand.meta[current_lang]) && brand.meta[current_lang][key] !== '') {
              return brand.meta[current_lang][key]
            }

            var langs = $rootScope.lang.available()
            for (var i in langs) {
              var lang = langs[i]
              if ((lang in brand.meta) && (key in brand.meta[lang]) && brand.meta[lang][key] !== '') {
                return brand.meta[lang][key]
              }
            }
          }
          return ''
        };
      }
    ])
