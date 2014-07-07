'use strict';

angular.module('report-editor')
    .controller('AuthCtrl', function($scope, $stateParams, $location, $http, $window, Session, REGISTRATION_URL) {
        $scope.returnPage = $stateParams.returnPage;
        $scope.registrationURL = REGISTRATION_URL;
        $scope.loginAttempted = false;

        $scope.login = function(){
            $scope.loginAttempted = true;
            $scope.loginForm.loginPassword.$setValidity('unauthorized', true);
            if(!$scope.loginForm.$invalid) {
                $scope.loading = true;
                Session
                .login($scope.loginEmail, $scope.loginPassword)
                .then(function() {
                    $location.url(decodeURIComponent($scope.returnPage || '/')).replace();
                })
                .catch(function() {
                    $scope.loginForm.loginPassword.$setValidity('unauthorized', false);
                    $scope.loading = false;
                });
            }
        };
    })
    .directive('checkForPrefilled', function($timeout){
        return {
            link: function($scope, element){
                $timeout(function () {
                    // fix for: https://github.com/28msec/nolap-report-editor/issues/19
                    var inputField = element[0];
                    if(inputField !== undefined && inputField !== null && inputField.value !== '') {
                        console.log(inputField.name);
                        // @TODO
                        //inputField.trigger('input');
                    }
                }, 500);
            }
        };
    });
    