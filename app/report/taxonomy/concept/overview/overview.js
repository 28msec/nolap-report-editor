'use strict';

angular
.module('report-editor')
.controller('ConceptOverviewCtrl', function($scope, $state){
    
    var element;
    var initElement = function(){
        element = $scope.report.createNewElement($scope.concept);
        $scope.element = [angular.copy(element)];
    };

    initElement();
    $scope.elementOptions = {
        accept: function(){
            return false;
        },
        dropped: function(event){
            if(event.source.nodesScope !== event.dest.nodesScope) {
                $scope.report.addElement('Presentation', event.dest.nodesScope.$nodeScope.$modelValue.Id, element, event.dest.index);
                initElement();
            }
        }
    };

    $scope.deleteConcept = function(){
        try {
            $scope.report.removeConcept($scope.concept.Name);
            $state.go('report.taxonomy.concepts');
        } catch(e) {
            console.error(e);
        }
    };
});