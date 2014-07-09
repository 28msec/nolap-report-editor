'use strict';

angular
.module('report-editor')
.controller('ConceptsCtrl', function($scope){
    $scope.concepts = $scope.report.listConcepts();
    console.log($scope.concepts[0]);
});