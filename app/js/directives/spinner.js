app.directive('spinner', function () {
    return {
      templateUrl: 'views/partials/ui/spinner.html',
      restrict: 'AE',
      replace: true,
      link: function ($scope, element, attrs, parentCtrl) {
      },
      scope: {
        size: '&',
      }
    };

  }
);
