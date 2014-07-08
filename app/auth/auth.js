'use strict';

angular.module('report-editor')
    .controller('AuthCtrl', function($scope, $stateParams, $location, $http, $timeout, Session, REGISTRATION_URL) {

        $scope.returnPage = $stateParams.returnPage;
        $scope.registrationURL = REGISTRATION_URL;
        $scope.loginAttempted = false;

        $scope.login = function(){
            $scope.$broadcast("autofill:update");

            $timeout(function(){
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
            }, 100);
        };
    })
    .directive('autofillCheck', function(){
        return {
            require: 'ngModel',
            link: function($scope, element, attrs, ngModel){
                // fix for: https://github.com/28msec/nolap-report-editor/issues/19
                $scope.$on("autofill:update", function() {
                    ngModel.$setViewValue(element.val());
                });
            }
        };
    });
    