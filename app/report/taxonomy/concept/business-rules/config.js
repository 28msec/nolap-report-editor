'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.taxonomy.concept.businessRules', {
        url: '/business-rules',
        templateUrl: '/report/taxonomy/concept/business-rules/business-rules.html',
        Controller: 'BusinessRulesCtrl',
        resolve: {
            report: [ 'report', function(report) {
                return report;
            }],
            concept: [ 'concept', function(concept) {
                return concept;
            }],
            conceptName: [ 'conceptName', function(conceptName) {
                return conceptName;
            }],
            rules: [ '$stateParams', 'report', 'concept', function($stateParams, report) {
               var rules = report.listRules();
               return rules;
            }]
        }
    });
})
;