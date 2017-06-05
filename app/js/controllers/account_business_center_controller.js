/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'AccountBusinessCenterController', [
    '$scope',
    'business_center',

    function ( $scope, business_center ) {
      'use strict';

      $scope.business_center = business_center;
      console.log(business_center);

      $scope.brand = false;
      if ('brand_id' in $scope.$stateParams) {
        for (var i in business_center.brands) {
          if (business_center.brands[i].id == $scope.$stateParams.brand_id) {
            $scope.brand = business_center.brands[i];
          }
        }
      }

      $scope.in_group = function(group_name) {
        if (!!$scope.$store.user) {
          return ($scope.$store.user.group_names.indexOf(group_name) != -1);
        }
        return false;
      };

      $scope.category_name = function () {
        var clang = $scope.lang.current().substring(0, 2);

        if (clang in $scope.category.lang) {
          return $scope.category.lang[clang];
        } else {
          return $scope.category.lang[Object.keys($scope.category.lang)[0]];
        }
      };

      $scope.count_brand_products = function(brand) {
        return Object.keys(brand.products).length;
      };

      $scope.get_product_image = function(product_id) {
        var product = false;
        for (var i in $scope.$store.products) {
          if ($scope.$store.products[i].id == product_id) {
            product = $scope.$store.products[i];
            break;
          }
        }

        if (!product) {
          return '';
        }

        return product.images[0];
      };

      $scope.get_product_attr = function (product_id, attr) {
        var product = false;
        for (var i in $scope.$store.products) {
          if ($scope.$store.products[i].id == product_id) {
            product = $scope.$store.products[i];
            break;
          }
        }

        if (!product) {
          return '';
        }

        var clang = $scope.lang.current().substring(0, 2);

        if ( ('lang' in product) && (clang in product.lang) && (attr in product.lang[clang]) ) {
          return product.lang[clang][attr];
        }

        if (attr in product) {
          return product[attr];
        }

        return '';
      };

      // $scope.brand_meta = function(key, brand) {
      //   if (!brand) {
      //     return '';
      //   }
      //
      //   if (!$scope.brand_loading) {
      //     var langs = $scope.lang.available();
      //     for (var i in langs) {
      //       var lang = langs[i];
      //       if ((lang in brand.meta) && (key in brand.meta[lang]) && brand.meta[lang][key] !== '') {
      //         return brand.meta[lang][key];
      //       }
      //     }
      //   }
      //   return '';
      // };
    }
  ]
);
