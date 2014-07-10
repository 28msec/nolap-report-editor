'use strict';

angular
.module('report-editor')
.controller('ConceptsCtrl', function($scope, $state){
    $scope.concepts = $scope.report.listConcepts();
    $scope.getResults = function($viewValue){
        var results = [];
        $scope.concepts.forEach(function(concept) {
            if(concept.Name.indexOf($viewValue) !== -1) {
                results.push(concept);
            }
        });
        results.push({ Name: 'Create ' + $viewValue + ' concept.', newConcept: true });
        return results;
    };
    
    $scope.onSelect = function($item, $model, $label){
        if($item.newConcept === true) {
            
        } else {
            $state.go('report.taxonomy.concept', { conceptId: $item.Name });
        }
    };
    
    console.log($scope.concepts[0]);
});