'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.taxonomy.concept.overview', {
        url: '',
        templateUrl: '/report/taxonomy/concept/overview/overview.html'
    });
})
;