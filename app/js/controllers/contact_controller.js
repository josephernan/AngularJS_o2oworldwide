/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  "ContactController", [
    '$scope',
    '$stateParams',

    function ( $scope, $stateParams ) {
      "use strict";

      $scope.name = _.get($stateParams, 'name') || 'not-found';

      $scope.is_en = ($scope.lang.current().substr(0, 2) == 'en');


      var _req_lang = _.get(__get_params, 'lang');
      if (_req_lang) {
        $scope.is_en = ($scope.lang.available(_req_lang) && _req_lang.substr(0, 2) === 'en');
      }

      $scope.card_src = function() {
        var lang = ($scope.is_en) ? 'en' : 'zh';
        var src = 'assets/images/contact/' + $scope.name  + '.' + lang + '.jpg';
        return src;
      }
    }
  ]
);
