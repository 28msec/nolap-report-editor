'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
        .state('report.taxonomy.concepts', {
            url: '/concepts',
            templateUrl: '/report/taxonomy/concepts/concepts.html',
            controller: 'ConceptsCtrl'
        });
})
;