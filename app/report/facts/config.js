'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.facts', {
        url: '/facts',
        templateUrl: '/report/facts/facts.html',
        controller: 'FactsCtrl'
    });
})
;
