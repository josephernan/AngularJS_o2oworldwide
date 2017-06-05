app.service( 'modalService', [
  '$modal',
    function ( $modal ) {

    var modalDefaults = {
      backdrop: false,
      keyboard: true,
      modalFade: true,
      templateUrl: 'views/partials/ui/base_modal.html'
    };

    var modalOptions = {
      closeButtonText: 'Close',
      actionButtonText: 'OK',
      header: 'O2O WorldWide',
      body: '[body text]'
    };

    this.showModal = function ( customModalDefaults, customModalOptions ) {
      if ( !customModalDefaults ) customModalDefaults = {};
      customModalDefaults.backdrop = true;
      return this.show( customModalDefaults, customModalOptions );
    };

    this.show = function ( customModalDefaults, customModalOptions ) {
      //Create temp objects to work with since we're in a singleton service
      var tempModalDefaults = {};
      var tempModalOptions = {};

      //Map angular-ui modal custom defaults to modal defaults defined in service
      angular.extend( tempModalDefaults, modalDefaults, customModalDefaults );

      //Map modal.html $scope custom properties to defaults defined in service
      angular.extend( tempModalOptions, modalOptions, customModalOptions );

      if ( !tempModalDefaults.controller ) {
        tempModalDefaults.controller = function ( $scope, $modalInstance ) {
          $scope.modalOptions = tempModalOptions;
          $scope.modalOptions.ok = function ( result ) {
            $modalInstance.close( result );
          };
          $scope.modalOptions.close = function ( result ) {
            $modalInstance.dismiss( 'cancel' );
          };
        };
      }

      return $modal.open( tempModalDefaults ).result;
    };

    this.hide = function() {
      return $model.modal('hide');
    }

    } ] );
