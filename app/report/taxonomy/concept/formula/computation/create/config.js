'use strict';

angular
    .module('report-editor')
    .config(function ($stateProvider) {
        $stateProvider
            .state('report.taxonomy.concept.formula.computation.create', {
                url: '/create/:languageType',
                controller: 'CreateComputationCtrl',
                templateUrl: '/report/taxonomy/concept/formula/computation/create/create.html'
            });
    })
;