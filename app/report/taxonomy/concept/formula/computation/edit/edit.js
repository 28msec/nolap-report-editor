'use strict';

angular.module('report-editor')
    .controller('EditComputationCtrl', function($scope, $state, $stateParams){
        $scope.ruleId = $stateParams.ruleId;

    })
;
