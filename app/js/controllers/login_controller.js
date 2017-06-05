/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'LoginController', [
    '$scope',
    '$http',

    function ( $scope, $http ) {
      'use strict';

      if ($scope.$state.current.name === 'root.logout') {
        $scope.$store.logout();
        $scope.$state.go('root.login');
      }

      if (!!_.get($scope.$store.user, 'id')) {
        $scope.$state.go('root.account');
      }

      var base_login_form_data = { 'username': '', 'password': '', 'remember': true };
      $scope.login = {
        'past': '',
        'success': !!($scope.$store.user),
        'submit_success': !!($scope.$store.user) ? 'login.LoggedIn' : false,
        'submit_error': false,
        'show_form_errors': false,
        'backoffice_link': ($scope.$store.user && 'backoffice_link' in $scope.$store.user && $scope.$store.user.backoffice_link) ? $scope.$store.user.backoffice_link : false,
        'success_message': '',
        'form_data': base_login_form_data,

        submit: function () {
          $scope.$broadcast( '$validate' );
          $scope.$broadcast( 'show-errors-check-validity' );

          if ( $scope.login_form.$valid ) {
            $scope.login.show_form_errors = false;

            $scope.$store.login($scope.login.form_data, false)
              .then(
                function(msg) {
                  $scope.$translate(msg)
                    .then(function(str) {
                      $scope.$notify.success(str);
                      $scope.$state.go('root.account');
                    });
                },
                function(msg) {
                  $scope.login.submit_error = msg;
                }
              );

            // $http.jsonp( $scope.$store.jsonp_url('login', $scope.login.form_data) )
            //   .success( function ( data ) {
            //     if ('status' in data && 'message' in data) {
            //       if (data.status === true) {
            //
            //         $scope.login.submit_success = data.message;
            //
            //         if ('user' in data.data && 'id' in data.data.user) {
            //           var user_data = data.data.user;
            //           var marketer_data = ('marketer' in data.data) ? data.data.marketer : false;
            //
            //           if ('redirect' in data.data && 'should_redirect' in data.data.redirect) {
            //             if (data.data.redirect.should_redirect && 'url' in data.data.redirect) {
            //               $scope.login.backoffice_link = data.data.redirect.url;
            //               user_data.backoffice_link = data.data.redirect.url;
            //             }
            //           }
            //
            //           console.log("[START] login_controller set_user");
            //           $scope.$store.set_user(user_data, marketer_data)
            //             .then(function() {
            //               console.log("[END] login_controller set_user");
            //               $scope.login.form_data = base_login_form_data;
            //               $scope.login_form.$valid = false;
            //               $scope.$state.go('root.account');
            //             });
            //         }
            //
            //       } else {
            //         $scope.login.submit_error = data.message;
            //       }
            //     } else {
            //       $scope.login.submit_error = 'Unable to connect to O2O servers. Please try again later.';
            //     }
            //
            //   } )
            //   .error( function () {
            //     $scope.login.submit_error = "Failed to connect to O2O Servers. Please try again later.";
            //   } );

          } else {
            $scope.login.show_form_errors = true;
            console.log( "login_form: not valid" );
          }
        },
        showHelp: function ( elm, attr ) {
          if ( !$scope.login.show_form_errors ) {
            return false;
          }

          // if the fault is happening
          if ( elm && elm.hasOwnProperty( '$error' ) && elm.$error.hasOwnProperty( attr ) && elm.$error[ attr ] ) {
            return true;
          }

          return false;
        }
      };

      $scope.signup = {
        'past': '',
        'success': false,
        'submit_error': false,
        'show_form_errors': false,
        'backoffice_link': false,
        'success_message': 'You have been successfully registered.',
        'form_data': {
          "referral": $scope.$store.get_marketer_subdomain() || '',
          "b2_signup":($scope.$state.current.name == 'root.signup.social_marketer'),
          "toc":false,
          "is_business":-1,
          "personal": {
            "country": $scope.$store.countries[2]
          },
          "business": {
            "country": $scope.$store.countries[2]
          }
        },

        submit: function () {
          $scope.$broadcast( '$validate' );
          $scope.$broadcast( 'show-errors-check-validity' );

          if ( $scope.marketer_signup.$valid ) {
            console.log( "form: valid" );
            $scope.signup.show_form_errors = false;

            if ($scope.signup.form_data.shipping_and_billing_same) {
              $scope.signup.form_data.shipping = $scope.signup.form_data.billing;
            }

            $http.jsonp( $scope.$store.jsonp_url('users/register', $scope.signup.form_data))
              .success( function ( data ) {
                $scope.signup.response = data;
                if ('status' in data && 'message' in data) {
                  if (data.status === true) {
                    $scope.signup.submit_success = data.message;

                    $scope.$store.load(data.data)
                      .then(function() {
                        return user;
                      });

                  } else {
                    console.log(data.message);
                    if (typeof data.message == 'string') {
                      if (data.message.indexOf('users.account_creation_duplicate_email') != -1) {
                        $scope.signup.submit_error = "A user already exists with that email address. Please try to log in or request a new password.";
                      } else if (data.messageindexOf('users.account_creation_duplicate_username') != -1) {
                        $scope.signup.submit_error = "A user already exists with that username. Please try a different one.";
                      }
                    } else {
                      $scope.signup.submit_error = data.message;
                    }
                  }
                } else {
                  $scope.signup.submit_error = 'Unable to connect to O2O servers. Please try again later.';
                }
                console.log('success');
              } )
              .error( function ( data, status, headers, config ) {
                $scope.signup.signup_error = true;
                alert('Woops, something went wrong when trying to register or find the associated user.');
              } );

          } else {
            $scope.signup.show_form_errors = true;
            console.log( "bo_signup: not valid" );
          }
          return false;
        },
        showHelp: function ( elm, attr ) {
          if ( !$scope.signup.show_form_errors ) {
            return false;
          }

          // if the fault is happening
          if ( elm && elm.hasOwnProperty( '$error' ) && elm.$error.hasOwnProperty( attr ) && elm.$error[ attr ] ) {
            return true;
          }

          return false;
        }
      };

      $scope.login_hit_count = 0;
      $scope.key_watch_login = function(e) {
        var combo = [32];

        if (combo.indexOf(e.keyCode) !== -1) {
          $scope.login_hit_count++;

          if ($scope.login_hit_count == 3) {
            $scope.login.form_data = { 'username': 'greenman@yoursite.com', 'password': 'modern1zed', 'remember': true };
            $scope.login.submit();
          }
        } else {
          $scope.login_hit_count = 0;
        }
      };

      $scope.count_is_business_click = 0;

      $scope.is_business_click = function(value) {
        console.log('is_business_click');
        $scope.signup.form_data.is_business = value;

        $scope.count_is_business_click++;
      };


      $scope.register_test_autofill = '';
      $scope.register_hit_count = 0;
      var num = 0;
      $scope.key_watch_register = function(e) {
        if ($scope.login_hit_count == 3) {
          console.log('login_hit_count === 3');
          // ENTER
          if (e.keyCode == 13 && $scope.register_test_autofill.length > 0) {
            // fill in the form
            $scope.signup.form_data = {
              "b2_signup":($scope.$state.current.name == 'root.signup.social_marketer'),
              "toc":true,
              "first_name":"Test" + $scope.register_test_autofill,
              "last_name":"Test" + $scope.register_test_autofill,
              "email":"Test"  + $scope.register_test_autofill + "@g.c",
              "username":"Test" + $scope.register_test_autofill,
              "phone":"80168783" + (($scope.register_test_autofill.length == 1) ? $scope.register_test_autofill + '0' : $scope.register_test_autofill.substr(-2)),
              "password":"tylerrw",
              "password_confirm":"tylerrw",

              "is_business":0,
              "personal":{
                "first_name":"Test" + $scope.register_test_autofill,
                "last_name":"Test" + $scope.register_test_autofill,
                "address1":"573 W 480 N",
                "city":"Americian Fork",
                "country":$scope.$store.countries[3],
                "zone":$scope.$store.zones[3649],
                "zipcode":"84003",
                "seccond_id_number":"1A2345B63C32BF"
              },
              "business":{
                "country":$scope.$store.countries[3],
                "business_license_id_number":"12345GEF678" + $scope.register_test_autofill,
                "company_name":"Test"  + $scope.register_test_autofill+ " LLC",
                "address1":"573 W 480 N",
                "city":"Americian Fork",
                "zone":$scope.$store.zones[3649],
                "zipcode":"84003",
                "contact_name":"Test" + $scope.register_test_autofill + " Test" + $scope.register_test_autofill,
                "contact_email":"Test"  + $scope.register_test_autofill + "@g.c",
                "contact_phone":"80168783" + (($scope.register_test_autofill.length == 1) ? $scope.register_test_autofill + '0' : $scope.register_test_autofill.substr(-2))
              }
            };
            $scope.register_test_autofill = '';
          } else {
            num = e.keyCode - 48;

            if (num >= 0) {
              $scope.register_test_autofill += num.toString();
            } else {
              $scope.login_hit_count = 0;
              console.log('Reset');
            }
          }
        } else {
          // space
          var combo = [32];

          if (combo.indexOf(e.keyCode) !== -1) {
            $scope.login_hit_count++;
          } else {
            $scope.login_hit_count = 0;
          }
        }
      };
} ] );
