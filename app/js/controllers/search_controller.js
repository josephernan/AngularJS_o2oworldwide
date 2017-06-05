/*global app*/

app.controller(
  'SearchController', [
    '$scope',
    'sharedProperties',
    '$q',

    function ( $scope, sharedProperties, $q, $store ) {
      'use strict';

      $scope._filtered_brands = [];

      // pagination controls
      $scope.maxSize = 6;
    	$scope.currentPage = 1;
    	$scope.totalItems = $scope.$store.products.length;
    	$scope.itemsPerPage = 15; // items per page
    	$scope.noOfPages = 0;

      $scope.search_query = null;

      // nice init function
      var init = function () {
        var shared_property = sharedProperties.getProperty('search_query');
        $scope.search_query = shared_property || $scope.$state.params.query;
        $scope.current_search_query = $scope.search_query.toLowerCase();

        // Set the sharedProperties value so if the user opens the top nav search
        //    bar the correct value will be in it
        if (!shared_property) {
          sharedProperties.setProperty('search_query', $scope.search_query);
        }

        $scope.sort_by_label = '';

        $scope.$translate('filter.search.sort_options.sort_by')
          .then(function(sort_by) {
            return $scope.$translate('filter.search.sort_options.relevance')
              .then(function(relevance) {
                focus('root.search_products');
                return $scope.sort_by_label = sort_by + ': ' + relevance;
              })
          });

        $scope.sort = {
          'attribute': 'relevance',
          'reverse': false
        };
      };

      init();

      // triggered by the top nav search bar if the user is on this search page
      $scope.$on('search_initiated', function(event, search_query) {
        $scope.search_query = search_query;
      });

      $scope.get_currency_char = function () {
        return ($scope.lang.current() !== 'en') ? '¥' : '$';
      };

      // the sort button has been pressed
      $scope.sort_by = function ($event, attribute, reverse) {
        $scope.sort = {
          'attribute': attribute,
          'reverse': !!reverse
        };

        if (attribute == 'relevance') {
          return $scope.$translate('filter.search.sort_options.sort_by')
            .then(function (sort_by) {
              return $scope.sort_by_label = sort_by + ': ' + $event.currentTarget.innerHTML;
            })
        }

        $scope.currentPage = 1
        return $scope.sort_by_label = $event.currentTarget.innerHTML;
      };

      var _get_search_hash = function() {
        var str =
          //
          $scope.search_query = $scope.search_query
            .trim()
            .replace(/\s\s+/g, ' ');

        str = str.toLowerCase();

        if (Array.prototype.reduce){
            return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0);
        }

        var hash = 0;
        if (this.length === 0) return hash;
        for (var i = 0; i < this.length; i++) {
            var character  = str.charCodeAt(i);
            hash  = ((hash<<5)-hash)+character;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
      };

      var _filter_matching_brands = function (_search_query) {
        return $q(function(resolve, reject) {
          $scope._filtered_brands = [];

          // if there's nothing searched for, return all the brands
          if (_.isEmpty(_search_query)) {
            return resolve($scope._filtered_brands = $scope.$store.brands);
          }

          return resolve($scope._filtered_brands = _.filter($scope.$store.brands, function(b) {
            return b.name.toLowerCase().indexOf(_search_query) > -1
          }));
        });
      };

      var _filter_matching_products = function (_search_query) {
        return $q(function(resolve, reject) {
          var langs = $scope.lang.available();

          // clear out the filtered products - start off fresh
          $scope._filtered_products = [];

          // filter the matching brands here so that they're avaible for the products
          //    that don't match directly
          _filter_matching_brands(_search_query)
            .then(function() {
              if (!_search_query || (typeof _search_query === "string" && _search_query.length === 0) ) {
                return resolve($scope._filtered_products = $scope.$store.products);
              }

              $scope._filtered_products = _.uniq(
                _.filter($scope.$store.products, function(product) {
                  if (_.includes($scope._filtered_products, product)) {
                    return true;
                  }

                  if (_.includes(product.name.toLowerCase(), _search_query)) {
                    return true;
                  }

                  if ('lang' in product) {
                    for (var lang_i in langs) {
                      if (!!_.get(product.lang[langs[lang_i]], 'name') && _.includes(product.lang[langs[lang_i]].name.toLowerCase(), _search_query)) {
                        return true;
                      }
                    }
                  }

                  // search brands - they've already been filtered at the beggining of
                  //   the function
                  if (!_.isEmpty($scope._filtered_brands)) {
                    for (var brand_i in $scope._filtered_brands) {
                      if (product.brand.id == $scope._filtered_brands[brand_i].id) {
                        return true;
                      }
                    }
                  }
                })
              );

              // // go through each product
              // for (var prod_i in $scope.$store.products) {
              //   product = $scope.$store.products[prod_i];
              //
              // }

              return resolve($scope._filtered_products = _.uniq($scope._filtered_products));
            });
        });
      };

      // These two are not meant to be accessed directly, but are contained on the
      //    $scope to prevent scoping problems (ironically ;P )
      $scope._filtered_products = [];
      $scope._filtered_brands = [];

      $scope.filter_hash = '';

      /**
      * An optimized search function - optimized so that it only re-builds the _filtered_products
      *   array if the has of the search terms has changed.
      */
      $scope.search_products = function () {
        var current_search_hash = _get_search_hash();
        // disreguard any puncuation, spaces...etc. as well as case insensitive
        var _search_query = $scope.search_query.toLowerCase();

        if (current_search_hash !== $scope.filter_hash) {
          // Change the URL without reloading the view :)
          $scope.$state.go('root.search', {query:_search_query}, {notify:false, reload:false, location:'replace'});
          sharedProperties.setProperty('search_query', _search_query);

          _filter_matching_products(_search_query)
            .then(function() {
              $scope.filter_hash = current_search_hash;
              $scope.totalItems = $scope._filtered_products.length;
            });

          // console.log('search_products');
          // console.log($scope._filtered_products);
          // console.log($scope._filtered_brands);


        }

        return $scope._filtered_products;
      };

      $scope.search_brands = function () {
        // var current_search_hash = _get_search_hash();
        // var _search_query = $scope.search_query.toLowerCase();
        //
        // if (current_search_hash !== $scope.filter_hash) {
        //   // Note: since we're updating $scope.filter_hash, we're running the
        //   //    _filteR_matching_**product**s() function to update the products
        //   //    as well as brands (it filters the brands internaly).
        //   _filter_matching_products(_search_query);
        //
        //   // console.log('search_brands');
        //   // console.log($scope._filtered_products);
        //   // console.log($scope._filtered_brands);
        //
        //   $scope.filter_hash = current_search_hash;
        // }

        return $scope._filtered_brands;
      };

      // brand
      // $scope.brand_meta = function(brand, key) {
      //   // console.log(brand);
      //   var langs = $scope.lang.available();
      //
      //   for (var i in langs) {
      //     var lang = langs[i];
      //     if ( ('meta' in brand) && (lang in brand.meta) && (key in brand.meta[lang]) && brand.meta[lang][key] !== '') {
      //       return brand.meta[lang][key];
      //     }
      //   }
      //
      //   if (key in brand) {
      //     return brand[key];
      //   }
      //
      //   return '';
      // };

      $scope.set_search_query = function(str) {
        $('.search-form-container').removeClass('is-empty');
        $scope.search_query = str;
      };

    }
  ]
);
