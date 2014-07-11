'use strict';

angular
.module('report-editor')
.controller('SynonymsCtrl', function($scope){
    $scope.synonyms = $scope.report.listConceptMapSynonyms($scope.concept.Name);
    $scope.form = {};

    $scope.addSynonym = function(value){
        $scope.form.newSynonym = '';
        $scope.synonyms.push(value);
        $scope.report.updateConceptMap($scope.concept.Name, $scope.synonyms);
    };

    $scope.removeSynonym = function(value){
        $scope.synonyms.splice($scope.synonyms.indexOf(value), 1);
        $scope.report.updateConceptMap($scope.concept.Name, $scope.synonyms);
    };
    
    $scope.moveSynonym = function(value, index){
        var parent = $scope.report.getConceptMap($scope.concept.Name);
        var child = parent.To[value];
        $scope.report.moveTreeBranch('ConceptMap', child.Id, parent.Id, index);
        $scope.synonyms = $scope.report.listConceptMapSynonyms($scope.concept.Name);
    };
});