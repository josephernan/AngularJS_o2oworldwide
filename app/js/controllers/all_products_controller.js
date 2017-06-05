/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'AllProductsController', [
    '$scope',
    'products',
    'yuan_conversion_rate',

    function ( $scope, products, yuan_conversion_rate ) {
      'use strict';

      $scope.products = products;

    } ] );
