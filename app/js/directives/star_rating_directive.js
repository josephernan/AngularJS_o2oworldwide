app.directive( "starRating", function () {
  return {
    restrict: "A",
    scope: {
      _ratingValue: "=ngModel",
      max: "=?", //optional: default is 5
      onRatingSelected: "&?",
      readonly: "=?",
      ratingBind: "=?",
      countReviews: "=?"
    },
    templateUrl: function ( scope, elem, attrs ) {
      // TODO: scope.type is coming in undefined which is odd...
      // console.log( scope.type );
      // if ( scope.type === undefined ) {
      //   scope.type = 'default';
      // }

      return 'views/partials/ui/star_rating/default.html';
    },
    link: function ( scope, elem, attrs ) {
      scope.ratingValue = scope._ratingValue;
      if ( scope.max === undefined ) {
        scope.max = 5;
      }

      if ( scope.countReviews === undefined ) {
        scope.countReviews = 0;
      }

      if ( scope.countReviews === 0 || scope.countReviews === undefined ) {
        scope.ratingValue = 5;
      }

      /* used in watch below but also as init function */
      function updateStars() {
        scope.stars = [];
        for ( var i = 0; i < scope.max; i++ ) {
          scope.stars.push( {
            filled: i < scope.ratingValue
          } );
        }
      }

      /* local scope function --- see ng-click above */
      scope.toggle = function ( index ) {
        if ( scope.readonly === undefined || scope.readonly === false ) {
          scope.ratingValue = index + 1;
          scope.onRatingSelected( {
            rating: index + 1
          } );
          updateStars();
        }
      };

      /* will only add a watch if the attribute rating-bind  */
      if ( scope.ratingBind !== undefined && scope.ratingBind ) {
        scope.$watch( "ratingValue", function ( oldVal, newVal ) {
          if ( newVal && newVal !== oldVal ) {
            updateStars();
          }
        } );
      }

      updateStars();

    }
  };
} );
