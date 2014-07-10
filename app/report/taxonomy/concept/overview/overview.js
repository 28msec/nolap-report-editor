'use strict';

angular
.module('report-editor')
.controller('ConceptOverviewCtrl', function($scope, $state){
    console.log($scope.concept);
    
    $scope.deleteConcept = function(){
        try {
            $scope.report.removeConcept($scope.concept.Name);
            $state.go('report.taxonomy.concepts');
        } catch(e) {
            console.error(e);
        }
    };
});