'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.taxonomy.concept.formula', {
        url: '/formula',
        abstract: true,
        controller: 'FormulaCtrl',
        template: '<div ui-view></div>'
    });
})
;