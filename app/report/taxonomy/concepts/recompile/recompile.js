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

    var addMessage = function(type, msg){
      $scope.messages.push({
        'Type': type,
        'Message': msg      
      });
    };

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

        addMessage('info', 'Starting to recompile ' + $scope.rules.length + ' rules');

        angular.forEach($scope.rules, function (rule) {

            if (rule.OriginalLanguage === 'SpreadsheetFormula') {
                addMessage('info', 'Recompiling formula computing ' + rule.ComputableConcepts);
                var formula = new Rule(rule, $scope.report);
                try {
                    formula.compile();
                    try {
                        if (formula.validate($scope.report, 'Update')) {
                            addCompiledRule(formula.getRule());
                            addMessage('success', 'formula recompiled and validated (' + rule.ComputableConcepts + ')');
                        } else {
                            addBuggyRule(rule);
                            addMessage('error', 'Formula not valid: ' + JSON.stringify(formula.getModel()));
                        }
                    } catch (e) {
                        addBuggyRule(rule);
                        addMessage('error', 'Validation failed:' + e.message);
                    }
                } catch (e) {
                    addBuggyRule(rule);
                    addMessage('error', 'Compilation failed:' + e.message);
                }

            } else {
                addSkippedRule(rule);
                addMessage('info', 'Skipping formula computing ' + rule.ComputableConcepts);
            }
        });
        if ($scope.buggyRules.length > 0) {
            addMessage('error', $scope.buggyRules.length + ' formulas are buggy. Not updating report.');
        } else {
            if ($scope.compiledRules.length > 0) {
                addMessage('info', 'updating ' + $scope.compiledRules.length + ' formulas in report');
                $scope.report.getModel().Rules = $scope.allRules;
            }
            addMessage('success', 'all rules up-to-date');
        }
    };

});
