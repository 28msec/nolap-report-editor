'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.taxonomy.concept.businessRules', {
        url: '/business-rules',
        templateUrl: '/report/taxonomy/concept/business-rules/business-rules.html',
        controller: 'BusinessRulesCtrl'
    });
})
;