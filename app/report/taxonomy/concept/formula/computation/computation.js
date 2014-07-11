'use strict';

angular.module('report-editor')
    .controller('ComputationCtrl', function($scope, $state){
        $scope.isOverview = $state.current.name === 'report.taxonomy.concept.formula.computation';
    })
;
