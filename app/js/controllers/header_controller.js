/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  "HeaderController", [
    "$scope",
    "$rootScope",
    "$http",
    "sharedProperties",
    "focus",

    function ( $scope, $rootScope, $http, sharedProperties, focus, locale ) {
      "use strict";

      $scope.header = {
        "categories": [
          "05D188A3B78F87D4002AD1D1439823785716", // Supplements
          "05D6098C7CEE85447FCA20E1439823785716", // Personal Care
          "05DABDB2A9EE598494F931B1439823785716", // Cosmetics
          "05DCF494AA6EDA04958970C1439823785716", // Skin Care
          "05DE7799D79B7934A6F8B331439823785716", // Dietary Aids
          "05DD80C5AD42FAF40FBBAA31439823785716"  // value of the day
        ]
      };

      $scope.showModal = false;
      $scope.toggleModal = function(){
        $scope.showModal = !$scope.showModal;
      };

      $scope.category_name = function (category_id) {
        var category = $scope.$store.categories[category_id];
        var clang = $scope.lang.current().substring(0, 2);

        if (clang in category.lang) {
          return category.lang[clang];
        } else {
          return category.lang[Object.keys(category.lang)[0]];
        }
      };

      $scope.toggle_search_bar = function() {
        if ($('#search-bar').is(':visible')) {
          $('#search-bar').slideUp();
        } else {
          $scope.search_query = sharedProperties.getProperty('search_query');
          $('#search-bar').slideDown();
          focus('root.header.search_bar');
        }
      };

      $rootScope.$on( '$stateChangeSuccess', function () {
        $('#search-bar').slideUp();
      } );

      $scope.run_search = function () {
        $(".navbar-fixed-top .navbar-collapse").collapse('hide');
        if ('search_query' in $scope) {
          sharedProperties.setProperty('search_query', $scope.search_query);
          $rootScope.$broadcast('search_initiated', $scope.search_query);

          if ($scope.$state.current.name !== 'root.search') {
            $scope.$state.go('root.search', {query: $scope.search_query});
          } else {
            focus('root.search_products');
            $('#search-bar').slideUp();
          }
        } else {
          $scope.$state.go('root.search', {query: ''});
        }
      };

      $scope.scan_barcode = function () {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                alert("We got a barcode\n" +
                      "Result: " + result.text + "\n" +
                      "Format: " + result.format + "\n" +
                      "Cancelled: " + result.cancelled);
            },
            function (error) {
                alert("Scanning failed: " + error);
            }
         );
      };

      $scope.availableSearchParams = [
        // { key: "name", name: "Name", placeholder: "Name..." },
        // { key: "brand", name: "Brand", placeholder: "Brand Name..." },
        // { key: "price", name: "Price", placeholder: "Price..." }
        // { key: "country", name: "Country", placeholder: "Country..." },
        // { key: "emailAddress", name: "E-Mail", placeholder: "E-Mail..." },
        // { key: "job", name: "Job", placeholder: "Job..." }
      ];

      $scope.$on('$viewContentLoaded', function(){
        setTimeout(function() {
          $('.navbar a:not(.dropdown-toggle)').on('click', function(e) {
            $(".navbar-fixed-top .navbar-collapse").collapse('hide');
          });
        }, 100);
      });

      // The Font Request does/was holding up the critical path, so it gets to be added on the first state load
      //     calling viewContentLoaded_addFonts() destroys the watcher thus, only letting this run once.
      //     Note: the function is 'self cleaning' in that it sets viewContentLoaded_addFonts = undefined
      var viewContentLoaded_addFonts=$scope.$on("$viewContentLoaded",_.once(function(){_.defer(function(){angular.element("head").append('<link id="font-stylesheet" href="/assets/css/fonts.css" rel="stylesheet">'),viewContentLoaded_addFonts(),viewContentLoaded_addFonts=void 0})}));
} ] );
