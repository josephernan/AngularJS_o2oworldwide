/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  "CommissionsController", [
    '$scope',

    function ( $scope ) {
      "use strict";

      // console.log('$scope.$store.commissions_table');
      // console.log($scope.$store.commissions_table);

      $scope.get_bounds = function($index, upper_bound) {
        var lower = '1';
        if ($index > 0) {
          lower = $scope.add_commas($scope.$store.commissions_table[$index] +1);
        }

        var upper = $scope.add_commas(upper_bound);
        if ($index+1 == Object.keys($scope.$store.commissions_table).length) {
          return '¥' + lower + '+ ';
        }
        return '¥' + lower + ' - ' + '¥' + upper;
      };

      function _calc_commission () {
        var percentage = 0;
        if ($scope.commissions_table_test_input < 1) {
          return percentage;
        }

        for (percentage in $scope.$store.commissions_table)
        {

          if ($scope.commissions_table_test_input <= $scope.$store.commissions_table[percentage]) {
            return percentage;
          }
        }

        return percentage;
      }

      $scope.commissions_table_test_input = '';
      $scope.commissions_percentage = 0;
      $scope.commission_value = 0.00;

      $scope.calc_commission = function() {
        $scope.commissions_table_test_input = $scope.commissions_table_test_input.replace(/[^\d]/g, '');

        $scope.commission_value = 0.00;
        $scope.commissions_percentage = _calc_commission();

        if ($scope.commissions_percentage > 0) {
          $scope.commission_value = ($scope.commissions_table_test_input * $scope.commissions_percentage)/100.00;
        }
      };

} ] );
