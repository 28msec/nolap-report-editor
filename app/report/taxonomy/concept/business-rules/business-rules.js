'use strict';

angular.module('report-editor')
    .controller('BusinessRulesCtrl', function($scope, $state, $log, report, concept){
        $scope.report = report;
        $scope.concept = concept;
        $scope.conceptName = concept.Name;

        //$log.log($state.current);
    })
    .controller('EditRuleCtrl', function($scope, $modalInstance, report, ruleId, concept, ruleType, ruleLanguage, Rule){

        $scope.error = undefined;
        $scope.report = report;
        if(ruleId !== undefined && ruleId !== null){
            $scope.action = 'Update';
            // do not edit the original rule directly
            var ruleModel = angular.copy(report.getRule(ruleId));
            if(ruleModel.Type === 'xbrl28:validation'){
                $scope.title = 'Edit Rule to Validate ' + ruleModel.ValidatedConcepts;
            } else {
                $scope.title = 'Edit Rule to Compute ' + ruleModel.ComputableConcepts;
            }
            $scope.formula = new Rule(ruleModel, report);
            $scope.formula.compile();
            $scope.formula.validate($scope.report, $scope.action);
        } else {
            if(ruleType === 'xbrl28:validation'){
                $scope.title = 'Create a New Rule to Validate ' + concept;
            } else {
                $scope.title = 'Create a New Rule to Compute ' + concept;
            }
            $scope.action = 'Create';
            $scope.formula = new Rule(ruleType, report, concept, ruleLanguage);
            $scope.formula.compile();
            $scope.formula.validate($scope.report, $scope.action);
        }

        $scope.ok = function(){
            //ReportPersistance.save(report, function() {
                if ($scope.action === 'Create') {
                    try {
                        $scope.error = undefined;
                        var rule = $scope.formula.getRule();
                        var concept = rule.ComputableConcepts[0];
                        if(rule.Type === 'xbrl28:validation' && rule.OriginalLanguage === 'SpreadsheetFormula' &&
                            !$scope.report.existsConcept(concept)) {
                            $scope.report.addConcept(concept, rule.Label, false);
                        }
                        $scope.report.createRule(rule);
                    } catch (e) {
                        $scope.error = e.message;
                    }
                } else if($scope.action === 'Update'){
                    try {
                        $scope.error = undefined;
                        $scope.report.updateRule($scope.formula.getRule());
                    } catch (e) {
                        $scope.error = e.message;
                    }
                }
                if ($scope.error === undefined) {
                    $scope.formula = undefined;
                    $modalInstance.close();
                }
            //});
        };

        $scope.cancel = function(){
            $scope.formula = undefined;
            $modalInstance.close();
        };
    })
    .directive('businessRules', function($modal, $log){
        return {
            restrict: 'E',
            scope: {
                'conceptName': '@',
                'report': '='
            },
            templateUrl: '/report/taxonomy/concept/business-rules/list-rules.html',
            link: function($scope) {

                $scope.hasComputingRule = false;
                $scope.hasValidatingRules = false;

                var updateRules = function(concept){
                    if(concept === undefined || concept === null){
                        $scope.allRules = undefined;
                        $scope.hasComputingRule = false;

                        $scope.validatingRules = undefined;
                        $scope.hasValidatingRules = false;
                    } else {
                        $scope.allRules = $scope.report.listRules(concept);
                        if($scope.allRules.length > 0){
                            $scope.hasComputingRule = true;
                        } else {
                            $scope.hasComputingRule = false;
                        }

                        $scope.validatingRules = $scope.report.listValidatingRules(concept);
                        if($scope.validatingRules.length > 0){
                            $scope.hasValidatingRules = true;
                        } else {
                            $scope.hasValidatingRules = false;
                        }
                    }
                };
                updateRules($scope.conceptName);

                $scope.$watch(function(){
                    return $scope.report.listRules();
                }, function(){
                    updateRules($scope.conceptName);
                }, true);

                $scope.removeRule = function(id){
                    //ReportPersistance.save($scope.report, function(){
                        var rule = $scope.report.getRule(id);
                        var concept = rule.ComputableConcepts[0];
                        if(rule.Type === 'xbrl28:validation' && rule.OriginalLanguage === 'SpreadsheetFormula' &&
                            $scope.report.existsConcept(concept)) {
                            try {
                                $scope.report.removeConcept(concept);
                            } catch(e){
                                $log.log('Info: automatic removal of validation concept '+ concept + ' failed. Reason: ' + e.name + ': ' + e.message);
                            }
                        }
                        $scope.report.removeRule(id);
                    //});
                };

                $scope.addRule = function(concept, ruleType, ruleLanguage){
                    $modal.open({
                        templateUrl: '/report/taxonomy/concept/business-rules/rules-editor-modal.html',
                        controller: 'EditRuleCtrl',
                        windowClass: 'modal-big',
                        backdrop: 'static',
                        resolve: {
                            ruleId: function(){
                                return undefined;
                            },
                            concept: function(){
                                return concept;
                            },
                            ruleType: function(){
                                return ruleType;
                            },
                            ruleLanguage: function(){
                                return ruleLanguage;
                            },
                            report: function(){
                                return $scope.report;
                            }
                        }
                    });
                };

                $scope.editRule = function(id) {
                    $modal.open({
                        templateUrl: '/report/taxonomy/concept/business-rules/rules-editor-modal.html',
                        controller: 'EditRuleCtrl',
                        windowClass: 'modal-big',
                        backdrop: 'static',
                        resolve: {
                            ruleId: function(){
                                return id;
                            },
                            concept: function(){
                                return undefined;
                            },
                            ruleType: function(){
                                return undefined;
                            },
                            ruleLanguage: function(){
                                return undefined;
                            },
                            report: function(){
                                return $scope.report;
                            }
                        }
                    });
                };

            }
        };
    })
    .directive('rulesEditor', function($rootScope){
        return {
            restrict: 'E',
            scope: {
                'conceptName': '@',
                'formula': '=',
                'action': '='
            },
            templateUrl: '/report/taxonomy/concept/business-rules/rules-editor.html',
            link: function($scope) {
                $scope.tooltipPlacement = 'top';
                $scope.availableConceptNames = $scope.formula.listAvailableConceptNames();
                $scope.onSelectTypeAhead = function(updateDependencies){
                    $scope.formula.validate($scope.action, updateDependencies);
                };
                $scope.createConcept = function(concept){
                    $rootScope.$emit('createConcept', false, concept);
                };
                $scope.$watch(function () {
                    if($scope.formula === undefined){
                        return undefined;
                    } else {
                        return $scope.formula.listConcepts();
                    }
                }, function () {
                    if($scope.formula !== undefined) {
                        $scope.availableConceptNames = $scope.formula.listAvailableConceptNames();
                        $scope.formula.validate($scope.action, true);
                    }
                });
            }
        };
    })
    .directive('autoRecompileBindHtml', function($compile, $parse){
        return {
            link: function($scope, element, attr){
                // Recompile the ng bind html
                $scope.$watch(function() {
                    var parsed = $parse(attr.ngBindHtml);
                    var val = parsed($scope) || '';
                    return val.toString();
                }, function() {
                    $compile(element, null, -9999 /*skip directives*/)($scope);
                });
            }
        };
    })
;