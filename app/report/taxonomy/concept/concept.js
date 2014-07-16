'use strict';

angular.module('report-editor')
.controller('ConceptCtrl', function($scope, $state, $stateParams) {

    $scope.concept = $scope.report.getConcept($stateParams.conceptId);
    $scope.synonymsCount = $scope.report.listConceptMapSynonyms($scope.concept.Name).length;
    $scope.computationFormulasCount = $scope.report.listRules($scope.concept.Name).length;
    $scope.validationFormulasCount = $scope.report.listValidatingRules($scope.concept.Name).length;

    $scope.$watch(function () {
        return $scope.report.listValidatingRules($scope.concept.Name).length;
    }, function (newLength) {
        $scope.validationFormulasCount = newLength;
    });

    $scope.$watch(function () {
        return $scope.report.listRules($scope.concept.Name).length;
    }, function (newLength) {
        $scope.computationFormulasCount = newLength;
    });

    $scope.$watchCollection(function () {
        return $scope.report.getConceptMap($scope.concept.Name).To;
    }, function () {
        $scope.synonymsCount = $scope.report.listConceptMapSynonyms($scope.concept.Name).length;
    });

    $scope.$watch('concept.IsAbstract', function(newVal, oldVal){
        if(newVal !== oldVal) {
            $scope.loadPresentationTree();
        }
    });
});