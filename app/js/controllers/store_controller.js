/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'StoreController', [
    '$scope',
    '$store',
    '$q',

    function ( $scope, $store, $q ) {
      'use strict';

      $scope.$q = $q;

      $scope.active = 0;
      $scope.slides = [
        {
          id: 0,
          src: 'assets/images/home/banner2.jpg',
          background: 'rgb(241, 83, 35);'
        },
        {
          id: 1,
          src: 'assets/images/home/banner.jpg',
          background: 'rgb(238, 238, 238);'
        }
      ];

      $scope.products = [];
      $scope.featured_products = [];
      var num_pag = 15;

      // wrapping this into a function for some promise magic
      (function() {
        return $q(function(resolve, reject) {
          if (!!$scope.$store.marketer.user && _.size($scope.$store.marketer_products) > 0 ) {
            resolve($q.all(
              _.map($scope.$store.marketer_products, function (p_id) {
                return $scope.$store.get_product({id: p_id})
              })
            ));
          } else {
            resolve($scope.$store.products);
          }
        })
        .then(function(products) {
          return _.compact(
              _.map(products, function(p) {
              if (_.includes($scope.$store.marketer_featured, p.id)) {
                $scope.featured_products.push(p);
              } else {
                return p;
              }
            })
          );
        })
        .then(function(_products) {
          $scope.pag_products = _.chunk(_products, num_pag);
          $scope.load_more()
        });
      })();

      $scope.load_more = function() {
        if (_.size($scope.pag_products) !== 0) {
          $scope.products = _.concat($scope.products, _.pullAt($scope.pag_products, 0)[0]);
        }
      };
} ] );
