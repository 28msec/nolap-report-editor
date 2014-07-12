'use strict';

angular.module('report-editor')
.controller('ConceptCtrl', function($scope, $state, $stateParams) {

    $scope.concept = $scope.report.getConcept($stateParams.conceptId);
    $scope.synonymsCount = $scope.report.listConceptMapSynonyms($scope.concept.Name).length;
    $scope.computationFormulasCount = $scope.report.listRules($scope.concept.Name).length;
    $scope.validationFormulasCount = $scope.report.listValidatingRules($scope.concept.Name).length;

    $scope.$watch('concept.IsAbstract', function(newVal, oldVal){
        if(newVal !== oldVal) {
            $scope.loadPresentationTree();
        }
    });
});