'use strict';

angular.module('report-editor')
    .controller('EditValidationsCtrl', function($scope, $state, $stateParams){
        $scope.ruleId = $stateParams.ruleId;

    })
;
