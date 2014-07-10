'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
        .state('report.taxonomy.concepts', {
            url: '',
            templateUrl: '/report/taxonomy/concepts/concepts.html',
            controller: 'ConceptsCtrl'
        });
})
;