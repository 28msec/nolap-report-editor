'use strict';

angular
    .module('report-editor')
    .directive('fact-details-modal', function($modal, $log){
        return {
            restrict: 'E',
            scope: {
                'fact': '='
            },
            templateUrl: '/modules/ui/fact-details-modal.html',
            link: function($scope) {

            }
        };
    })
    .controller('FactDetailCtrl', function($scope, $modalInstance, fact){
        $scope.fact = fact;
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    })
;
