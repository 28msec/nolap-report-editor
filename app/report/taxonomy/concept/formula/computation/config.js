'use strict';

angular
    .module('report-editor')
    .config(function ($stateProvider) {
        $stateProvider
            .state('report.taxonomy.concept.formula.computation', {
                url: '/computation',
                abstract: true,
                controller: 'ComputationCtrl',
                template: '<div ui-view></div>'
            });
    })
;