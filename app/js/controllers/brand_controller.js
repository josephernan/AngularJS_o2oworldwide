/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  "BrandController", [
    "$scope",

    function ( $scope, locale ) {
      "use strict";

      $scope.brand_loading = 1;
      $scope.brand = {name: $scope.$stateParams.brand_name};

      if ('brand_id' in $scope.$stateParams) {
        $scope.$store.get_brand($scope.$stateParams.brand_id)
          .then(function(brand) {
            $scope.brand = brand;
            $scope.brand_loading = 2;
          });
      } else {
        $scope.$notify.error('Error: Did not reconize the order_id.');
        $scope.$state.go( "root.account" );
      }

      $scope.filters = function(product) {
        return product.brand.id === $scope.brand.id;
      };
} ] );
