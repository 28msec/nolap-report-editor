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
                Session.login(
                    $scope.loginEmail,
                    $scope.loginPassword,
                    function() {
                        $location.url(decodeURIComponent($scope.returnPage || '/')).replace();
                    },
                    function() {
                        $scope.loginForm.loginPassword.$setValidity('unauthorized', false);
                    });
            }
        };
    });