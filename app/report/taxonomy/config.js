'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.taxonomy', {
        url: '',
        abstract: true,
        templateUrl: '/report/taxonomy/taxonomy.html',
        controller: 'TaxonomyCtrl'
    });
})
;
