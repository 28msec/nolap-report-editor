'use strict';

angular.module('report-editor')
.controller('ConceptCtrl', function($scope, $state, $stateParams){
    $scope.concept = $scope.report.getConcept($stateParams.conceptId);
});