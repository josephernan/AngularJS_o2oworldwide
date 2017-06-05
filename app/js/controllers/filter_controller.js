/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'FilterController', [
    '$scope',

    function ( $scope ) {
      'use strict';

      $scope.category_name = function () {
        var clang = $scope.lang.current().substring(0, 2);

        if (clang in $scope.category.lang) {
          return $scope.category.lang[clang];
        } else {
          return $scope.category.lang[Object.keys($scope.category.lang)[0]];
        }
      };

      if ($scope.$state.current.name === 'root.filter') {
        $scope.tag_id = $scope.$state.params.filter_id;
        $scope.category = $scope.$store.categories[$scope.tag_id];

        $scope.category_name();

        $scope.filtered_products = [];

        for (var i in $scope.$store.products) {
          if ('tags' in $scope.$store.products[i] && $scope.$store.products[i].tags.indexOf($scope.tag_id) !== -1) {
            $scope.filtered_products.push($scope.$store.products[i]);
          }
        }
      } else if ($scope.$state.current.name === 'root.filter') {

      }
    }
  ]
);
