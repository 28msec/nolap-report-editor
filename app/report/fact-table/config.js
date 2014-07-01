'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.factTable', {
        url: '/fact-table',
        templateUrl: 'report/fact-table/fact-table.html',
        controller: 'FactTableCtrl'
    });
})
;