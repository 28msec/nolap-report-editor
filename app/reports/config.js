'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('reports', {
        url: '/',
        templateUrl: '/reports/reports.html',
        controller: 'ReportsCtrl'
    });
});