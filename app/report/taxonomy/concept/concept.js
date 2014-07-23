'use strict';

angular.module('report-editor')
.controller('ConceptCtrl', function($scope, $state, $stateParams) {

    $scope.concept = $scope.report.getConcept($stateParams.conceptId);
    $scope.selectConcept($scope.concept);
    $scope.computingRules = $scope.report.computableByRules($scope.concept.Name);
    if($scope.computingRules[0] !== undefined && $scope.computingRules[0].Type === 'xbrl28:validation'){
        $scope.isValidationConcept = true;
    } else {
        $scope.isValidationConcept = false;
    }

    $scope.$watch('concept.IsAbstract', function(newVal, oldVal){
        if(newVal !== oldVal) {
            $scope.loadPresentationTree();
        }
    });
});