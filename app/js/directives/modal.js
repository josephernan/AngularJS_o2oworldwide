app.directive('modal', function () {
    return {
      template: '<div id={{id}} class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalTitle">' +
          '<div class="modal-dialog modal-{{size}}">' +
            '<div class="modal-content">' +
              '<div ng-if="title && title.length > 0" class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>' +
                '<h4 class="modal-title" id="modalTitle">{{ title }}</h4>' +
              '</div>' +
              '<div class="modal-body" role="document" ng-transclude></div>' +
              // '<div ng-if="close || success" class="modal-footer">' +
              //   '<button ng-if="close || closeText" ng-click="close_cb()" type="button" class="btn btn-default" data-dismiss="modal">{{closeText}}</button>' +
              //   '<button ng-if="success || successText" ng-click="success_cb()" type="button" class="btn btn-primary" ng-bind-html="successText"></button>' +
              // '</div>' +
            '</div>' +
          '</div>' +
        '</div>',
      transclude: true,
      replace:true,
      scope: {
        visible : '@',
        title: '@',
        parentVisibleAttr: '@',
        size: '@',
        id: '@',
        close: '&',
        closeText: '@',
        success: '&',
        successText: '@'
      },

      link: function postLink($scope, element, attrs, parentCtrl) {
        $scope.size = $scope.size.toLowerCase();

        if ($scope.size !== 'lg' && $scope.size !== 'sm') {
          $scope.size = '';
        }

        $scope.success_cb = function() {};
        $scope.close_cb = function() {};

        if ($scope.close !== undefined && $scope.close !== 'false' && $scope.close !== false) {
          if ($scope.closeText === undefined) {
            $scope.closeText = $scope.$root.$translate.instant('general.close');
          }
          if (typeof $scope.close === 'function') {
            $scope.close_cb = $scope.close;
          }
        } else if ($scope.closeText !== undefined) {
          $scope.close = 'true';
        }

        if ($scope.success !== undefined && $scope.success !== 'false' && $scope.success !== false) {
          if ($scope.successText === undefined) {
            $scope.successText = $scope.$root.$translate.instant('general.ok');
          }
          if (typeof $scope.success === 'function') {
            $scope.success_cb = $scope.success;
          }
        } else if ($scope.successText !== undefined) {
          $scope.success = true;
        }

        $(element).modal({show: false});

        attrs.$observe('visible', function(value) {
          value = (value === 'true');

          if (value) {
            $(element).modal('show');
          } else {
            $(element).modal('hide');
          }
        });

        $(element).on('shown.bs.modal', function(){
          $scope.$apply(function() {
            $scope.$parent[$scope.parentVisibleAttr] = true;
            $(element).find("[autofocus]:first").focus();
          });
        });

        $(element).on('hidden.bs.modal', function(){
          $scope.$apply(function() {
            $scope.$parent[$scope.parentVisibleAttr] = false;
          });
        });

        $scope.hide = function() {
          $(element).modal('hide');
        }
      }
    };
  });
