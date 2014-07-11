'use strict';

angular
    .module('report-editor')
    .directive('formulas', function($modal, $log){
        return {
            restrict: 'E',
            scope: {
                'conceptName': '@',
                'type': '@',
                'report': '='
            },
            templateUrl: '/report/taxonomy/concept/formula/directive-formulas.html',
            link: function($scope) {

                $scope.hasComputingRule = false;
                $scope.hasValidatingRules = false;
                $scope.rulesList = undefined;

                var updateRulesList = function(concept){
                    if(concept === undefined || concept === null){
                        $scope.rulesList = undefined;
                        $scope.hasComputingRule = false;
                        $scope.hasValidatingRules = false;
                    } else if($scope.type === 'computation'){
                        $scope.rulesList = $scope.report.listRules(concept);
                        if($scope.rulesList.length > 0){
                            $scope.hasComputingRule = true;
                        } else {
                            $scope.hasComputingRule = false;
                        }

                    } else if($scope.type === 'validation'){
                        $scope.rulesList = $scope.report.listValidatingRules(concept);
                        if($scope.rulesList.length > 0){
                            $scope.hasValidatingRules = true;
                        } else {
                            $scope.hasValidatingRules = false;
                        }
                    } else {
                        throw new Error('Unknown formula type ' + $scope.type + ' (computation or validation allowed).');
                    }
                };
                updateRulesList($scope.conceptName);

                $scope.$watch(function(){
                    return $scope.report.listRules();
                }, function(){
                    updateRulesList($scope.conceptName);
                }, true);

                $scope.removeRule = function(id){
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
                };

            }
        };
    })
    .directive('formulaEditor', function($state, Rule){
        return {
            restrict: 'E',
            scope: {
                'report': '=',
                'languageType': '=',
                'conceptName': '=',
                'ruleId': '=',
                'type': '@'
            },
            templateUrl: '/report/taxonomy/concept/formula/directive-formula-editor.html',
            link: function($scope) {
                $scope.error = undefined;
                if($scope.languageType === ''){
                    $scope.languageType = undefined;
                }

                var redirectToParent = function(){
                    var current = $state.current.name;
                    if(current.indexOf('.computation.') > -1){
                        $state.go('report.taxonomy.concept.formula.computation.list');
                    } else {
                        $state.go('report.taxonomy.concept.formula.validations.list');
                    }
                };

                var initFormula = function() {
                    if ($scope.ruleId !== undefined && $scope.ruleId !== null) {
                        $scope.action = 'Update';
                        // do not edit the original rule directly
                        var ruleModel = angular.copy($scope.report.getRule($scope.ruleId));
                        if (ruleModel.Type === 'xbrl28:validation') {
                            $scope.title = 'Edit Rule to Validate ' + ruleModel.ValidatedConcepts;
                        } else {
                            $scope.title = 'Edit Rule to Compute ' + ruleModel.ComputableConcepts;
                        }
                        $scope.formula = new Rule(ruleModel, $scope.report);
                        $scope.formula.compile();
                        $scope.formula.validate($scope.report, $scope.action);
                    } else {
                        if ($scope.type === 'validation') {
                            $scope.title = 'Create a New Rule to Validate ' + $scope.conceptName;
                        } else {
                            $scope.title = 'Create a New Rule to Compute ' + $scope.conceptName;
                        }
                        var ruleType = 'xbrl28:formula';
                        if ($scope.type === 'validation') {
                            ruleType = 'xbrl28:validation';
                        }
                        $scope.action = 'Create';
                        $scope.formula = new Rule(ruleType, $scope.report, $scope.conceptName, $scope.languageType);
                        $scope.formula.compile();
                        $scope.formula.validate($scope.report, $scope.action);
                    }
                };

                $scope.ok = function(){
                    if ($scope.action === 'Create') {
                        try {
                            $scope.error = undefined;
                            var rule = $scope.formula.getRule();
                            var concept = rule.ComputableConcepts[0];
                            if(rule.Type === 'xbrl28:validation' && rule.OriginalLanguage === 'SpreadsheetFormula' &&
                                !$scope.report.existsConcept(concept)) {
                                // in the simple formula case we automatically create a concept
                                // for a newly created validation formula
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
                        redirectToParent();
                    }
                };

                $scope.cancel = function(){
                    $scope.formula = undefined;
                    redirectToParent();
                };

                $scope.onSelectTypeAhead = function(updateDependencies){
                    $scope.formula.validate($scope.action, updateDependencies);
                };

                $scope.createConcept = function(){//concept
                    //$rootScope.$emit('createConcept', false, concept);
                };

                initFormula();

                $scope.tooltipPlacement = 'top';
                $scope.availableConceptNames = $scope.formula.listAvailableConceptNames();
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
