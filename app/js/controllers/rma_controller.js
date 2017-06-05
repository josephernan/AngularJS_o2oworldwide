/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'RMAController', [
    '$scope',
    '$q',
    'RMAService',

    function ( $scope, $q, RMAService) {
      'use strict';

      if (!$scope.$store.user) {
        $scope.$translate('general.errors.login_required')
          .then(function(str) {
            $scope.$notify.error(str);
            $scope.$state.go('root.login');
          });
      }

      $scope.order_id = _.get($scope.$stateParams, 'order_id');
      $scope.rma = false;

      $scope.info_step = 0;
      $scope.show_info_submit_error = false;

      if (!$scope.rma) {
        RMAService.create($scope.order_id, {
            review: ($scope.$state.current.name !== 'root.rma')
          })
          .catch(function(err_str) {
            switch(err_str) {
              case 'rma.order_status_ineligible':
                return $scope.$translate('rma.order_status_ineligible')
                  .then(function(t_str) {
                    $scope.$notify.error(t_str);
                    $scope.$state.go('root.account.order', {order_id: $scope.order_id});
                  });
            }
          })
          .then(function(rma_service) {
            // if we're not viewing the status page, and there's an ID on the RMA,
            //     we will redirect them to the Status Page—they are not aloud
            //     to edit the RMA after submission.
            if ($scope.$state.current.name !== 'root.rma.status') {
              if (_.get(rma_service.data, 'order.id') && !!_.get(rma_service.data, 'id')) {
                return $scope.$translate('rma.existing_rma_found')
                  .then(function(str) {
                    $scope.$notify.info(str);
                    $scope.$state.go('root.rma.status');
                  });
              } else {
                if ($scope.$state.current.name == 'root.rma.info' && _.size(rma_service.items()) < 1) {
                  $scope.$translate('rma.errors.no_rma_items_selected')
                    .then(function(t_str){
                      $scope.$notify.error(t_str);
                      $scope.$state.go('root.rma', {order_id: $scope.order_id})
                    });
                }
              }
            } else { // state === root.rma.status
              if (!_.get(rma_service.data, 'id')) {
                $scope.$translate('rma.errors.could_not_find_existing')
                  .then(function(t_str){
                    $scope.$notify.error(t_str);
                    $scope.$state.go('root.rma', {order_id: $scope.order_id})
                  });
              }
            }

            $scope.rma = rma_service;
          });
      }

      $scope.submit = function(rma_form) {
        $scope.$broadcast( '$validate' );
        $scope.$broadcast( 'show-errors-check-validity' );

        if ( rma_form.$valid ) {
          $scope.rma.save()
            .then(function() {
              $scope.$state.go('root.rma.info', {order_id: $scope.order_id});
            })
            .catch(function(str) {
              $scope.$translate(str)
                .then(function(t_str) {
                  $scope.$notify.error(t_str);
                });
            });
        } else {
          console.log('INVALAD');
        }
      };

      $scope.info_submit = function(info_step) {
        if (info_step === 2) {
          // $scope.$notify.error("Sorry, RMA Requests are currently disabled.");
          $scope.rma.send()
            .then(function(result) {
              if (!!result) {
                var msg = (_.isString(result)) ? result : 'rma.successfully_submitted_rma';

                return $scope.$translate(msg)
                  .then(function(tstr) {
                    $scope.$notify.success(tstr);
                    $scope.$state.go('root.rma.status', {order_id: $scope.order_id});
                  });
              }

              return $scope.$translate('rma.errors.submit_general')
                .then(function(te_str) {
                  $scope.$notify.error(te_str);
                })
            })
            .catch(function(e_str) {
              $scope.$translate(e_str)
                .then(function(te_str) {
                  $scope.$notify.error(te_str);
                })
            })
        } else {
          $scope.show_info_submit_error = true;
        }
      };
} ] );
