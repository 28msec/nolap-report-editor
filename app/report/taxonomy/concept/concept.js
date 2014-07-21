'use strict';

angular.module('report-editor')
.controller('ConceptCtrl', function($scope, $state, $stateParams) {

    $scope.concept = $scope.report.getConcept($stateParams.conceptId);
    $scope.selectConcept($scope.concept);

    $scope.$watch('concept.IsAbstract', function(newVal, oldVal){
        if(newVal !== oldVal) {
            $scope.loadPresentationTree();
        }
    });
});