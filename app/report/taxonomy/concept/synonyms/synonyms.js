'use strict';

angular
.module('report-editor')
.controller('SynonymsCtrl', function($scope){
    var synonyms = $scope.report.getConceptMap($scope.concept.Name);
    $scope.synonyms = synonyms === null ? [] : Object.keys(synonyms.To);
   
    $scope.form = {}; 

    $scope.addSynonym = function(value){
        $scope.form.newSynonym = '';
        $scope.synonyms.push(value);
        if(synonyms === null) {
            $scope.report.addConceptMap($scope.concept.Name, $scope.synonyms);
            synonyms = $scope.synonyms;
        } else {
            $scope.report.updateConceptMap($scope.concept.Name, $scope.synonyms);
        }
    };

    $scope.removeSynonym = function(value){
        $scope.synonyms.splice($scope.synonyms.indexOf(value), 1);
        $scope.report.updateConceptMap($scope.concept.Name, $scope.synonyms);
    };
    
    $scope.moveSynonym = function(value, index){
        var parent = $scope.report.getConceptMap($scope.concept.Name);
        var child = parent.To[value];
        $scope.report.moveTreeBranch('ConceptMap', child.Id, parent.Id, index);
        $scope.synonyms = Object.keys($scope.report.getConceptMap($scope.concept.Name).To);
    };
});