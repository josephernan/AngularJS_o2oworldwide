app.factory( 'storeService', [
      '$http',
      '$q',
      '$translate',
      '$location',
      '$state',
      'localStorageService',
      'notificationService',

  function ( $http, $q, $translate, $location, $state, localStorageService, notificationService ) {

    var
      _config = {
        // Manual Override
        disable_local_storage: false,

        // can be set by `$(gulp build:dist)`
        build_point_to_override: '__BUILD_POINT_TO_OVERRIDE__',
        // Enable ONLY *ONE* of the following to pont to a specific site
        local_point_to: ['o2o', 'local'],
        // local_point_to: ['devo2o', 'com'],
        // local_point_to: ['o2oworldwide', 'com'],
        // local_point_to: ['o2ohq', 'com'],

        base_url_config: {
          'protocol' : 'http',
          'subdomain' : 'phoenix',
          'auth' : {
            'user' : 'ludaxx',
            'pass' : 'jaufangjj'
          },
        },

        prefix_and_subdomain: 'http://phoenix.',
        domain_and_tld: '',

        url_subdomain: false,
      },

      _current_lang = function () {
        return $translate.proposedLanguage() || $translate.use();
      },

      // optional url paramater returns a dot after for caching concationation
      _gen_key = function (prefix, sufix) {
        return prefix /* + '.' + _current_lang()*/ + ( (sufix && sufix.length > 0) ? '.' + sufix : '' );
      },

      // accessed mostly for 'products' vs indifidual 'product'
      _ls_get = function (prefix, sufix) {
        if (_config.disable_local_storage) {
          return false;
        }

        var raw = localStorageService.get(_gen_key(prefix, sufix));
        var obj = angular.fromJson(raw);

        if (typeof obj == 'object') {
          return obj;
        }

        return raw;
      },

      // accessed mostly for 'products' vs indifidual 'product'
      _ls_set = function (prefix, sufix, data) {
        if (_config.disable_local_storage) {
          return false;
        }

        return localStorageService.set(_gen_key(prefix, sufix), data);
      },

      _ls_remove = function (prefix, sufix) {
        return localStorageService.remove(_gen_key(prefix, sufix));
      },

      _setup_subdomain = function() {
        if (!_config.url_subdomain && store.marketer && store.marketer.user && 'username' in store.marketer.user) {
          _config.url_subdomain = store.marketer.user.username;
          // console.log('Found Marketer User Username: ' + _config.url_subdomain);
        } else if (!_config.url_subdomain) {
          // Split the URL after removing ('http://')

          var url = $location.host().split('.');

          if (url.length >= 2) {
            if (url[0] == 'www') {
              // remove 'www' from the url
              url.shift();
            }

            if (url.length >= 2) {
              // all of the o2o urls have 'o2o' in therm - then adding a specific
              // case for 'localhost' (for local development)
              if (url[0].indexOf('o2o') === -1 && url[0] !== 'localhost' && url[0] !== 'store') {
                _config.url_subdomain = url[0];
                console.log('Found Marketer Subdomain: \'' + _config.url_subdomain + '\'');
              } else {
                // since we didn't get a subdomain, we'll just set _config.url_subdomain to an empty
                // string so that we don't trigger this loop again
                _config.url_subdomain = '';
                // console.log('No Marketer Subdomain found.');
              }
            }
          }
        }
        // console.log('_config.url_subdomain: ' + _config.url_subdomain);
      },

      _load_orders = function(orders) {
        return $q.all(
          _.each(orders, function(order) {
            return _.set(store.orders, order.id, order);
          })
        );
      },

      _load_customer_orders = function(customer_orders) {
        return $q.all(
          _.each(customer_orders, function(customer_order) {
            return _.set(store.customer_orders, customer_order.id, customer_order);
          })
        );
      },

      _load_countries = function(countries) {
        return $q(function(resolve) {
          if (!_.isEmpty(countries)) _.set(store, 'countries', countries);
          return resolve(store.countries);
        });
      },

      _load_zones = function(zones) {
        return $q(function(resolve) {
          if (!_.isEmpty(zones)) _.set(store, 'zones', zones);
          return resolve(store.zones);
        });
      },

      _load_yuan_conversion_rate = function(yuan_conversion_rate) {
        return $q(function(resolve) {
          if (yuan_conversion_rate > 0)  _.set(store, 'yuan_conversion_rate', yuan_conversion_rate);
          return resolve(store.yuan_conversion_rate);
        });
      },

      _load_commissions_table = function(commissions_table) {
        return $q.all(
          _.map(commissions_table, function (value, key) {
            return _.set(store.commissions_table, key, value);
          })
        );
      },

      _load_brands = function(brands) {
        return $q.all(
          _.map(brands, function(brand) {
            return _.set(store.brands, brand.id, brand);
          })
        );
      },

      _load_products = function(products) {
        return $q(function(resolve) {
          $q.all(_.map(products, function(p) {
             if (!!p) {
               p.price_float = parseFloat(p.price);
               store.products.push(p);
             }
           })).then(function(){
             $q.when(_.set(store, 'products', _.uniqBy(store.products, 'id')))
               .then(function() {
                 resolve(store.products);
               });
           });
        });
      },

      _load_categories = function(categories) {
        return $q.all(_.each(categories, function(category, key) {
            if (_.includes(category, 'tag_id')) {
              return _.set(store.categories, key, category);
            }
            return store.categories[key];
          }));
      },

      _load_user = function(user) {
        // console.log('_load_user');
        return $q(function(resolve) {
          if (!_.isEmpty(user)) {
            // Maintain a backoffice_link - is only set when the user is validated
            //    by the server and logs in.
            if (!('backoffice_link' in user)) {
              if (!!store.user && user.id === store.user.id) {
                user.backoffice_link = store.user.backoffice_link;
              } else {
                user.backoffice_link = false;
              }
            }

            user.is_a = function (str) {
              return store.user.group_names.indexOf(str) !== -1;
            };

            return resolve(store.user = user);
          }

          return resolve(store.user);
        });
      },

      _load_redirect = function(redirect) {
        return $q(function(resolve) {
          if (_.get(redirect, 'should_redirect') == true && !_.isEmpty(redirect.url)) {
            return resolve(store.user.backoffice_link = redirect.url);
          }
          resolve('');
        });
      },

      _load_marketer = function(marketer) {
        // console.log('_load_marketer');
        return $q(function(resolve) {
          store.marketer_products = [];
          store.marketer_featured = [];

          if (!_.isEmpty(marketer)) {
            store.marketer = marketer;

            if (store.marketer.products && !_.isEmpty(store.marketer.products)) {
              for (var p_id in store.marketer.products) {
                if (
                  store.marketer.products[p_id].toc == "1" &&
                  store.marketer.products[p_id].active == "1" &&
                  !_.includes(store.marketer_products, p_id)
                ) {
                  store.marketer_products.push(p_id);

                  if (store.marketer.products[p_id].featured == "1") {
                    store.marketer_featured.push(p_id);
                  }
                }
              }
            }
          }
          resolve(store.marketer);
        });
      },

      _load_business_center = function(business_center, update_exp) {
        return $q(function(resolve) {
          update_exp = (update_exp === undefined) ? true : update_exp;
          var exp = Date.now() + ( 24 * 60 * 60 * 100 );

          _ls_set('business_center', '', business_center);

          if (update_exp) {
            _ls_set('business_center', 'exp', exp);
          }

          store.business_center = business_center;

          return store.business_center;
        });
      },

      _update_store = function(force) {
        // console.log('_update_store');
        return _load_store(store, !!force);
      },

      _load_store = function(data, update_exp) {
        update_exp = (update_exp === undefined) ? true : update_exp;

        var high_priority = [ 'products', 'user', 'marketer' ],
            low_priority = ['orders', 'customer_orders', 'countries', 'zones'],
            data_keys = _.keys(data);

        var _keys_orderd = (update_exp) ? _.uniq(_.concat(high_priority, data_keys, low_priority)) : data_keys;

        return $q.all(
            _.map(
              _keys_orderd,
              function(key) {
                return _load_store_component(key, data);
              }
            )
          ).then(function() {
            _.delay(function() {
              if (!_.isEmpty(data)) {
                _ls_remove('store', 'raw');
                _ls_set('store', 'raw', store);

                if (update_exp) {
                  _ls_remove('store', 'exp');

                  // Store expires every 24hrs
                  var exp = Date.now() + ( 24 * 60 * 60 * 100 );
                  _ls_set('store', 'exp', exp);
                }
              }
            }, 2000);

            store.status = true;

            return store;
          });
      },

      _load_store_component = function(key, data) {

        var switches = {
          user: _load_user,
          orders: _load_orders,
          marketer: _load_marketer,
          customer_orders: _load_customer_orders,
          products: _load_products,
          categories: _load_categories,
          brands: _load_brands,
          yuan_conversion_rate: _load_yuan_conversion_rate,
          commissions_table: _load_commissions_table,
          orders: _load_orders,
          countries: _load_countries,
          zones: _load_zones,
          redirect: _load_redirect
        }

        var func = _.get(switches, key)
        if (!!_.get(data, key) && !!func) {
          return func(data[key])
            .then(function(ret) {
              // console.log(key);
              // console.log(ret);
              return ret;
            });
        }

        return $q.resolve(false);
      };

    // ============================================== BASE STORE ASSETS ============================================= //

    var base_store__user = {
      marketer_featured: [],
      marketer_products: false,

      user: false,
      marketer: {
        user: false,
        about: false,
        products: false
      },

      orders: {},
      customer_orders: {},
      commissions: {
        total_sales: 0.00,
        commission_percentage: 0.00
      },

      business_center: false,
    };

    var base_store = {
      status: false,

      countries:{},
      zones:{},

      products: [],
      categories: {},
      brands: {},

      commissions_table: {},

      yuan_conversion_rate: 1
    };

    // ============================================== INIT FUNCTIONALITY ============================================== //

    var store = angular.merge({}, base_store, base_store__user);

    // =================================================== END INIT =================================================== //

    store.reset = function() {
      // console.log('store.reset');
      // localStorageService.clearAll();
      return $q(function(resolve) {
        _.mapValues(base_store__user, function(v, k) {
          store[k] = v;
        });
        return resolve(store);
      });
    }

    store.verify_version_number = function() {
      var _vn = _ls_get('__version_number', '');

      if (!!_vn && _vn < __version_number) {
        localStorageService.clearAll();
      } else {
        _ls_set('__version_number', '', __version_number);
      }
    }

    store.base_url = function(slug) {
      _setup_subdomain();

      // this logic will only be run once when first used or, if something
      //    went wrong, it will try to recover...
      if (_config.domain_and_tld === '') {
        var __loc_build_url = function (domain) {
          var _bc = _config.base_url_config;
          // Because we [were] running basic HTTP Auth, every request to the server needs to go with the basic auth dataoo
          return _bc.protocol + '://' + /* _bc.auth.user + ':' + _bc.auth.pass + '@' + */ _bc.subdomain + '.' + domain + '/';
        };

        // checking to see if the page has been built with a destination in mind
        if (_config.build_point_to_override !== '' && _config.build_point_to_override.substring(2,0) !== '__') {
          _config.domain_and_tld = __loc_build_url(_config.build_point_to_override);
        } else {
          var split = location.host.split('.');
          if (split.length > 2) { // there's a subdomain... gota remove that
            split = split.slice(-2);
          }

          // if the domain is localhost then it's in development since both
          //    dev and live should point to them selves we don't touch it
          if (_.includes(split[0], 'localhost')) {
            split = _config.local_point_to;
          }

          _config.domain_and_tld = __loc_build_url(split.join('.'));
        }
      }

      return _config.domain_and_tld + ( (!!slug) ? slug : '');
    };

    store.site_url = function(slug) {
      return store.base_url() + ( (!!slug) ? slug : '');
    };

    store.replicated_url = function(username, config) {
      if (username === undefined && store.user && 'username' in store.user) {
        username = store.user.username;
      }

      if (config && ('default_value' in config) && config.default_value) {
        username = username || config.default_value || '';
      }

      // WTF ERROR: base_url() is not a function
      // var base_url = base_url().substr(7);
      var base_url = _config.domain_and_tld.substr(7).replace('phoenix', 'store');
      var replicated_url = ( ( (!!username) ? username + '.' : '' ) + base_url.substr(0, base_url.length - 1)).toLowerCase();

      if (config && 'bold' in config) {
        if (('default_value' in config) && config.default_value) {
          if (config.default_value == username) {
            return replicated_url;
          }
        }

        var split = replicated_url.split('.');
        split[0] = '<strong>' + split[0] + '</strong>';
        replicated_url = split.join('.');
      }

      return replicated_url;
    };

    store.qr_code_url = function() {
      var username = '';
      if (store.user && 'username' in store.user) {
        username = store.user.username;
      }

      return store.site_url('api/qr-code/' + username).toLowerCase();
    };
    // return: phoenix.o2ohq.com/api/store

    store.jsonp_url = function(uri_str, data, get_params) {
      // these must end with '&' so that the 'callback=JSON_CALLBACK' is a well formed url
      var data_str = (data !== undefined && data !== false) ? 'data=' + encodeURIComponent(angular.toJson(data)) + '&' : '';
      var get_params_str = (get_params !== undefined && get_params !== false) ? $.param(get_params) + '&' : '';

      // regex removes trailing and leading slashes
      var ret =  store.base_url() + 'api/' + uri_str.replace(/^\/|\/$/g, '') + '/lang/' + _current_lang() + '/format/jsonp?' + data_str + get_params_str + 'callback=JSON_CALLBACK';
      return ret;
    };

    store.add_order = function(order) {
      if (!!order || ('id' in order) ) {
        store.orders[order.id] = order;
        return _update_store(order);// TODO: _update_store does not take paramaters, error?
      }
    };

    // returns a promise
    store.get_store = function (config) {
      config = (config === undefined) ? false : config;
      var override = (config && 'override' in config && !!config.override);

      return $q(function(resolve, reject) {
          if (!override) {
            if (store.status) {
              return resolve(store);
            }

            var ls_store = _ls_get('store', 'raw');

            if ( !!ls_store && _ls_get('store', 'exp') > Date.now()) {
              return resolve(_load_store(ls_store));
            }
          }

          return resolve(_fetch_store());
        })
        .finally(function() {
          _.delay(function() {
            if (_(store.countries).isEmpty() || _(store.zones).isEmpty()) {
              store.get_countries_and_zones();
            }
          }, 2000);
        });
    };

    var _fetch_store = function() {
      return $http.jsonp( store.jsonp_url('store') )
        .then( function ( resp ) {
          if (
            resp.status == 200 &&
            'data' in resp &&
            'status' in resp.data &&
            'data' in resp.data &&
            resp.data.status) {

              // console.log("store");
              // console.log(resp.data.data);

              return _load_store(resp.data.data);

          } else {
            console.log("(store) HTTP bad response:");
            console.log(resp);

            return false;
          }
        } );
    }

    var _fetch_countries_and_zones = function () {
      // console.log('_fetch_countries_and_zones');
      return $http.jsonp( store.jsonp_url('countries_zones') )
        .then( function ( resp ) {
          if (
            resp.status == 200 &&
            'data' in resp &&
            'status' in resp.data &&
            'data' in resp.data &&
            resp.data.status) {
              return _load_store(resp.data.data, false);

              return {
                countries: store.countries,
                zones: store.zones
              };

          } else {
            console.log("(countries_zones) HTTP bad response:");
            console.log(resp);

            return false;
          }
        } );
    };

    var _fetch_orders = function(order_id) {
      return $q(function(resolve, reject) {
        var params = (typeof order_id === undefined) ? {} : {order_id: order_id };
        $http.jsonp( store.jsonp_url('find_orders', params) )
          .then( function ( resp ) {
            if (
              'data' in resp &&
              'status' in resp.data &&
              resp.data.status &&
              'data' in resp.data &&
              'orders' in resp.data.data
            ) {
              if (!!resp.data.data.orders) {
                return _load_store(resp.data.data)
                  .then(function(data) {
                    _.delay(function() {
                      _update_store(data)
                    }, 2000);

                    return resolve(data.orders);
                  });
              }

              return reject('general.errors.no_order_found_for_id');
            }
          } );
      });
    }

    var _fetch_user_login = function(payload) {
      return $http.jsonp( store.jsonp_url('login', payload) );
    }

    store.get_orders = function(order_id) {
      order_id = (order_id === undefined) ? false : order_id;

      if (!_.isEmpty(store.orders)) {
        return $q(function(resolve){
          if (!!order_id) {
            if (_.has(store.orders, order_id)) {
              return resolve(_.get(store.orders, order_id));
            } else if (_.has(store.customer_orders, order_id)) {
              return resolve(_.get(store.customer_orders, order_id));
            } else {
              return _fetch_orders(order_id);
            }
          }
          return resolve(store.orders);
        });
      }

      return _fetch_orders();
    };

    store.get_customer_orders = function(customer_order_id) {
      customer_order_id = (customer_order_id === undefined) ? false : customer_order_id;

      if (!_.isEmpty(store.customer_orders)) {
        return $q(function(resolve){
          if (!!order_id) {
            if (_.has(store.customer_orders, order_id)) {
              return resolve(_.get(store.customer_orders, order_id));
            }
          }
          return resolve(store.customer_orders);
        });
      }

      return false;
    };

    store.get_brand = function(brand_id) {
      brand_id = (brand_id === undefined) ? false : brand_id;

      if (!_.isEmpty(store.brands)) {
        return $q(function(resolve) {
          if (!!brand_id) {
            return resolve( (_.has(store.brands, brand_id)) ? _.get(store.brands, brand_id) : false );
          }
          return resolve(store.brands);
        });
      }
      return $http.jsonp( store.jsonp_url('brand', brand_id) )
        .then( function ( resp, resolve, reject ) {
          if ('data' in resp) {

            if (!resp.data.status) {
              notificationService.error('Error: ' + resp.data.message);
              return reject(resp.data.message);
            }

            return _load_store(resp.data.data)
              .then(function() {
                if (!!brand_id) {
                  resolve( (_.has(store.brands, brand_id)) ? _.get(store.brands, brand_id) : false );
                }
                return resolve(store.brands);
              });
          }
        } );

      return deferred.promise;
    };

    store.count_orders = function() {
      return (Object.keys(store.orders)).length;
    };

    store.add_orders = function(orders) {
      return $q(function(resolve, reject) {

        if (!_.isArray(orders)) {
          orders = [orders];
        }

        _.map(orders, function(v, k) {
          // not a comprehensive check, but good enough spot checking that
          //     we should be able to drop most mal-formatted
          if (
            !!_.get(v, 'id') &&
            !!_.get(v, 'order_status') &&
            !!_.get(v, 'order_status_id') &&
            !!_.get(v, 'invoice_no') &&
            !!_.get(v, 'total') &&
            _.size(v, 'products') > 0
          ) {
            // do nothing, it's a good order
          } else {
            delete orders[k];
          }
        });

        if (_.size(orders) > 0) {
          return _load_store({orders: orders})
            .then(function(data) {
              _.delay(function() {
                _update_store(data)
              }, 2000);

              return resolve(true);
            })
            .catch(function(e) {
              return reject(e);
            });
        }
      });
    };

    store.get_countries_and_zones = function () {
      return $q(function(resolve) {

        if (!_.isEmpty(store.countries) > 1 && !_.isEmpty(store.zones)) {
          resolve({
            countries: store.countries,
            zones: store.zones
          });
        }

        return _fetch_countries_and_zones();
      });
    };

    store.get_country_by_id = function(country_id, source) {
      return store.get_countries_and_zones()
        .then(function(val, resolve, reject) {
          source = (source === undefined) ? store.countries : source;

          console.log(_.filter(source, _.matches({id: country_id})));

          if (!_.isEmpty(source)) {
            for (var i in source) {
              if (source[i].id == country_id) {
                return resolve(source[i]);
              }
            }
          }
          return reject(false);
        });

    };

    store.get_product = function (req) {
      if (req === undefined) {
        return false;
      }

      return store.get_store()
        .then(function() {
          return _.find(store.products, req);
        });
    }

    store.login = function(form_data, goto_account) {
      goto_account = goto_account || false;

      return $q(function(resolve, reject) {
        _fetch_user_login(form_data)
          .success(function(data) {
            if (_.get(data, 'code') === '401') {
              reject('login.WrongEmailOrPasswd');
            } else if (_.get(data, 'status') && _.get(data, 'code') == 200) {
              store.reset()
                .then(function() {
                  _load_store(data.data)
                    .then(function() {
                      resolve('login.LoggedIntoO2O');
                    });
                });
            } else {
              return reject(data.message);
            }
          })
          .error(function() {
            return reject('login.FailedToConnectServer')
          });
      });
    }

    store.load = function(data) {
      return _load_store(data);
    }

    // Probably working, untested
    // store.register = function() {
    //   return $q(function(resolve, reject) {
    //     $http.jsonp( $scope.$store.jsonp_url('users/register', $scope.info.form_data))
    //       .then(function(resp) {
    //         if (!!_.get(resp, 'data.status') && !!_.get(resp, 'data.data.user') && !!_.get(resp, 'data.data.user.id')) {
    //           return _.get(resp, 'data.data');
    //         }
    //         return reject('general.register.fail');
    //       })
    //       .then(function(data) {
    //         _load_store(data)
    //           .then(function() {
    //             resolve(data.user);
    //           });
    //       })
    //       .error(function() {
    //         return reject('login.FailedToConnectServer')
    //       });
    //   });
    // },

    store.get_marketer_subdomain = function() {
      _setup_subdomain();
      if (store.marketer && store.marketer.user && 'username' in store.marketer.user) {
        return store.marketer.user.username;
      } else if (_config.url_subdomain !== '') {
        return _config.url_subdomain;
      }
      return '';
    };

    store.logout = function() {
      store.user = false;

      return $q(function(resolve, reject) {
        $http.jsonp( store.jsonp_url('logout') )
          .then(store.reset)
          .then(function() {
            return _update_store(true);
          })
          .then(function() {
            if (
              $state.current.name.indexOf('account') > -1 ||
              $state.current.name == 'root.marketer'
            ) {
              return $q.when($state.go('root.home'));
            } else {
              return $q.when($state.reload());
            }
            resolve(true);
          });
      });
    };

    store.get_business_center = function () {
      return $q(function(resolve) {
        if (store.business_center) {
          return resolve(store.business_center);
        }

        var ls_bc = _ls_get('business_center', '');
        if ( !!ls_bc && _ls_get('business_center', 'exp') > Date.now()) {
          return resolve(_load_business_center(ls_bc, false));
        }

        return $http.jsonp( store.jsonp_url('business_center') )
          .then( function ( resp ) {
            if (
              resp.status == 200 &&
              'data' in resp &&
              'status' in resp.data &&
              'data' in resp.data &&
              resp.data.status) {
                return _load_business_center(resp.data.data, true);
            } else {
              return $q.reject(resp);
            }
          } );
      });
    };

    store.is_ls_disabled = function() {
      return config.disable_local_storage;
    }

    return store;

        } ] );
