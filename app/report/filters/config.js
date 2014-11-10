'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.filters', {
        url: '/filters',
        templateUrl: '/report/filters/filters.html',
        controller: 'FiltersCtrl',
        resolve: {
            sics: [ 'Filter', function(Filter) {
                return Filter.getSics();
            }],
            entities: [ 'Filter', function(Filter) {
                return Filter.getEntities();
            }],
            tags: [ 'Filter', function(Filter) {
                return Filter.getTags();
            }],
            years: [ 'Filter', function(Filter) {
                return Filter.getYears();
            }],
            periods: [ 'Filter', function(Filter) {
                return Filter.getPeriods();
            }],
            periodTypes: [ 'Filter', function(Filter) {
                return Filter.getPeriodTypes();
            }]
        }
    });
})
;