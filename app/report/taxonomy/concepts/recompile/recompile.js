'use strict';

angular
.module('report-editor')
.controller('RecompileCtrl', function($scope, Rule){
    $scope.concepts = $scope.report.listConcepts();
    $scope.rules = $scope.report.listRules();

    $scope.allRules = [];
    $scope.compiledRules = [];
    $scope.skippedRules = [];
    $scope.buggyRules = [];

    $scope.messages =[];

    var addCompiledRule = function(rule){
        $scope.compiledRules.push(rule);
        $scope.allRules.push(rule);
    };

    var addBuggyRule = function(rule){
        $scope.buggyRules.push(rule);
        $scope.allRules.push(rule);
    };

    var addSkippedRule = function(rule){
        $scope.skippedRules.push(rule);
        $scope.allRules.push(rule);
    };

    $scope.recompile = function() {

        $scope.messages.push('Starting to recompile ' + $scope.rules.length + ' rules');

        angular.forEach($scope.rules, function (rule) {

            if (rule.OriginalLanguage === 'SpreadsheetFormula') {
                $scope.messages.push('Recompiling formula computing ' + rule.ComputableConcepts);
                var formula = new Rule(rule, $scope.report);
                try {
                    formula.compile();
                    try {
                        if (formula.validate($scope.report, 'Update')) {
                            addCompiledRule(formula.getRule());
                            $scope.messages.push('[SUCCESS] formula recompiled and validated');
                        } else {
                            addBuggyRule(rule);
                            $scope.messages.push('[ERROR] Formula not valid: ' + JSON.stringify(formula.getModel()));
                        }
                    } catch (e) {
                        addBuggyRule(rule);
                        $scope.messages.push('[ERROR] Validation failed:' + e.message);
                    }
                } catch (e) {
                    addBuggyRule(rule);
                    $scope.messages.push('[ERROR] Compilation failed:' + e.message);
                }

            } else {
                addSkippedRule(rule);
                $scope.messages.push('Skipping formula computing ' + rule.ComputableConcepts);
            }
        });
        if ($scope.buggyRules.length > 0) {
            $scope.messages.push('[ERROR] ' + $scope.buggyRules.length + ' formulas are buggy. Not updating report.');
        } else {
            if ($scope.compiledRules.length > 0) {
                $scope.messages.push('updating ' + $scope.compiledRules.length + ' formulas in report');
                $scope.report.getModel().Rules = $scope.compiledRules;
            }
            $scope.messages.push('[SUCCESS] all rules up-to-date');
        }
    };

});
