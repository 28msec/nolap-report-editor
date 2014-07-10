'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.taxonomy.concept', {
        url: '/concept/:conceptId',
        abstract: true,
        Controller: 'ConceptCtrl',
        templateUrl: '/report/taxonomy/concept/concept.html'
    });
})
;
