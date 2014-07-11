'use strict';

angular
    .module('report-editor')
    .config(function ($stateProvider) {
        $stateProvider
            .state('report.taxonomy.concept.formula.computation.edit', {
                url: '/edit/:ruleId',
                controller: 'EditComputationCtrl',
                templateUrl: '/report/taxonomy/concept/formula/computation/edit/edit.html'
            });
    })
;