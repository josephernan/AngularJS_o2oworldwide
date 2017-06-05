/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'ReplicatedSiteBannerController', [
    '$scope',
    '$http',
    '$uibModal',
    'SMHomepage_Banner',

    function ( $scope, $http, $uibModal, SMHomepage_Banner ) {
      'use strict';

      console.log('ReplicatedSiteBannerController');

      $scope.banners = {};
      $scope.loaded_banners = false;

      $http.jsonp($scope.$store.jsonp_url('sm_homepage/findall'), {type: 'banner'})
        .success(function(banners) {
          _.map(banners, function(banner) {
            var _b = new SMHomepage_Banner(banner);

            if (!!_b.id()) {
              $scope.banners[_b.id()] = _b;
            }
          });
        })
        .finally(function() {
          $scope.loaded_banners = true;
        });

      $scope.banner_modal = function (action, banner) {
        if (action === 'new' && banner === undefined) {
          banner = new SMHomepage_Banner();
        } else if (banner !== undefined && action === 'duplicate') {
          banner = banner.copy();
          banner.name(banner.name() + ' (duplicate)');
        }

        var templateUrl = (action === 'delete')
          ? 'views/partials/account/social_marketer/replicated_site/templates/banner_confirm_delete.html'
          : 'views/partials/account/social_marketer/replicated_site/templates/banner_modal.html'

        var modalInstance = $uibModal.open({
          templateUrl: templateUrl,
          controller: 'ReplicatedSiteBannerModalCtrl',
          size: 'md',
          resolve: {
            banner: function() {
              return banner;
            },
            action: function() {
              return action;
            }
          }
        });

        modalInstance.result.then(function(resolved) {
          if (_.isFunction(resolved.save)) {
            resolved.save()
              .then(function(ret) {
                console.log('ret');
                console.log(ret);
              })
          }
          console.log('resolved');
          console.log(resolved);
        });
      }
    }
  ]
);
app.controller(
  'ReplicatedSiteBannerModalCtrl', [
    '$scope',
    '$uibModalInstance',
    'action',
    'banner',

    function ($scope, $uibModalInstance, action, banner) {
      $scope.banner = banner;
      $scope.action = action;

      $scope.ok = function () {
        $uibModalInstance.close(banner);
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }
  ]
);
