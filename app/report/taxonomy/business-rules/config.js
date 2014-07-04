'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.taxonomy.businessRules', {
        url: '/business-rules',
        templateUrl: '/report/taxonomy/business-rules/business-rules.html'
    });
})
;