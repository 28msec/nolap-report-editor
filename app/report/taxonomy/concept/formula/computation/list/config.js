'use strict';

angular
    .module('report-editor')
    .config(function ($stateProvider) {
        $stateProvider
            .state('report.taxonomy.concept.formula.computation.list', {
                url: '',
                controller: 'ListComputationCtrl',
                templateUrl: '/report/taxonomy/concept/formula/computation/list/list.html'
            });
    })
;