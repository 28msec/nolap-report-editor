'use strict';

angular.module('report-editor')
    .controller('AuthCtrl', function($scope, $stateParams, $location, $http, $window, Session, REGISTRATION_URL) {
        $scope.returnPage = $stateParams.returnPage;
        $scope.registerAttempted = false;
        $scope.loginAttempted = false;
        $scope.forgotAttempted = false;
        $scope.registrationURL = REGISTRATION_URL;

        $scope.login = function(){
            $scope.registerAttempted = false;
            $scope.loginAttempted = true;
            $scope.forgotAttempted = false;

            $scope.$broadcast('autocomplete:update');
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

        $scope.back = function() {
            setTimeout(function() { $window.history.back(); }, 100);
        };
    });