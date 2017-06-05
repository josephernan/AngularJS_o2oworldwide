/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'MarketerController', [
    '$scope',

    function ( $scope ) {
      'use strict';

      if ( !$scope.$store.user ) {
        $scope.$notify.error( "Please help us figure out what you're looking for by logging in. Thanks!" );
        $scope.$state.go( "root.login" );
      }

      if ( !$scope.$store.marketer.user ) {
        $scope.$notify.notice( "You have not been assigned to a Social Marketer. Go purchase something and say hi!" );
        $scope.$state.go( "root.home" );
      }

      $scope.marketer = $scope.$store.marketer.user;
      $scope.about = $scope.$store.marketer.about.content;

      console.log($scope.marketer);
    } ] );
