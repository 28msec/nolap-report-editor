'use strict';

angular.module('report-editor')
    .controller('FormulaCtrl', function($scope){
        $scope.conceptName = $scope.concept.Name;

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
        };

        $scope.cancel = function(){
            $scope.formula = undefined;
            $modalInstance.close();
        };
    })
;
