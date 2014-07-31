'use strict';

angular.module('report-editor')
    .controller('AuthCtrl', function($scope, $stateParams, $location, $http, $timeout, Session, REGISTRATION_URL) {

        $scope.returnPage = $stateParams.returnPage;
        $scope.registrationURL = REGISTRATION_URL;
        $scope.loginAttempted = false;

        $scope.login = function(){
            $scope.$broadcast('autofill:update');

            // we need a timeout (>=0) here to ensure the broadcast is handled first
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
            }, 28);
        };
    })
    .controller('LogoutCtrl', function($state, Session){
        Session.logout();
        $state.go('auth');
    });
    