'use strict';

angular
.module('report-editor')
.controller('ConceptOverviewCtrl', function($scope, $state, $modal, ConceptIsStillReferencedError){
    
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

    $scope.refs = $scope.report.findInTree('Presentation', $scope.concept.Name);

    $scope.deleteConcept = function(){
        try {
            $scope.report.removeConcept($scope.concept.Name);
            $state.go('report.taxonomy.concepts');
        } catch(e) {
            if(e instanceof ConceptIsStillReferencedError) {
                $modal.open({
                    controller: 'DeleteConceptCtrl',
                    templateUrl: '/report/taxonomy/concept/overview/delete-concept.html',
                    resolve: {
                        report: function() {
                            return $scope.report;
                        },
                        concept: function(){
                            return $scope.concept;
                        },
                        references: function() {
                            return e.references;
                        },
                        dependentRules: function() {
                            var rules = {
                                Computing: [],
                                Validating: []
                            };
                            for (var i in e.references.Rules.Dependent){
                                if(e.references.Rules.Dependent.hasOwnProperty(i)){
                                    var id = e.references.Rules.Dependent[i];
                                    var rule = $scope.report.getRule(id);
                                    if(rule.Type === 'xbrl28:validation'){
                                        rules.Validating.push(rule);
                                    } else {
                                        rules.Computing.push(rule);
                                    }
                                }
                            }
                            return rules;
                        }
                    }
                }).result.then(function(result){
                    if(result) {
                        $scope.report.removeConcept($scope.concept.Name, true /*force*/);
                        $state.go('report.taxonomy.concepts');
                    }
                });
            }
        }
    };
})
.controller('DeleteConceptCtrl', function($scope, $modalInstance, report, concept, references, dependentRules){
    $scope.concept = concept;
    $scope.references = references;
    $scope.dependentRules = dependentRules;
    
    $scope.confirm = function(){
        $modalInstance.close(true);
    };
    
    $scope.cancel = function(){
        $modalInstance.close();
    };
});
