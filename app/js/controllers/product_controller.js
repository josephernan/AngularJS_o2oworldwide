/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'ProductController', [
    '$scope',
    '$translate',
    '$location',
    'product',

    function ( $scope, $translate, $location, product ) {
      'use strict';

      if ( !product ) {
        // $scope.$state.go( 'root.home' );
      } else {

        // TODO: add slug to URL.
        // if ( !$scope.$stateParams.hasOwnProperty( 'slug' ) ) {
        //   $scope.$stateParams.slug = product.slug;
        //   $location.path = $location.path() + '/' + product.slug;
        // }

        /* calculating the average rating */
        var average = 0.0,
          count = 0;

        if (product.reviews && product.reviews.length > 0 ) {
          for ( var k in product.reviews ) {
            average += product.reviews[ k ].rating;
            count++;
          }

          if ( count > 1 ) {
            average = ( average / count );
          }

        }

        product.rating = {
          average: average,
          count: count
        };

        $scope.product = product;

        $scope.thumbnail = {
          active_index: 0,
          active_image: {}, // defaulted to below
          is_active: function ( index ) {
            return $scope.thumbnail.active_index === index;
          },
          show: function ( index ) {
            if ( index in $scope.product.images ) {
              $scope.thumbnail.active_index = index;
              $scope.thumbnail.active_image = $scope.product.images[ index ];
            }
          }
        };

        $scope.thumbnail.show( 0 );
      }
    } ] );
