'use strict';

angular.module('report-editor')
    .controller('BusinessRulesCtrl', function($scope, report, concept){
        $scope.report = report;
        $scope.concept = concept;
        $scope.conceptName = concept.Name;

    })
    .directive('businessRules', function(){
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
                    //$rootScope.$emit('removeRule', id);
                };

                $scope.addRule = function(concept, ruleType, language){
                    //$rootScope.$emit('createRule', concept, ruleType, language);
                };

                $scope.editRule = function(id) {
                    //$rootScope.$emit('editRule', id);
                };

            }
        };
    })

;