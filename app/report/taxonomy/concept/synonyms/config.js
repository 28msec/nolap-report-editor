'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.taxonomy.concept.synonyms', {
        url: '/synonyms',
        controller: 'SynonymsCtrl',
        templateUrl: '/report/taxonomy/concept/synonyms/synonyms.html'
    });
})
;
