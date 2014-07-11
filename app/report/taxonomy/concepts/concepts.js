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
        results.push({ Name: 'Create ' + $viewValue + ' concept.', newConcept: true, viewValue: $viewValue });
        return results;
    };
    
    $scope.onSelect = function($item){
        if($item.newConcept === true) {
            $scope.report.addConcept($item.viewValue, 'Concept Label', false);
        }
        $state.go('report.taxonomy.concept.overview', { conceptId: $item.newConcept ? $item.viewValue : $item.Name });
    };
});
