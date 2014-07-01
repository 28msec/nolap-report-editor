'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.filters', {
        url: '/filters',
        templateUrl: 'report/filters/filters.html',
        controller: 'FiltersCtrl'
    });
})
;