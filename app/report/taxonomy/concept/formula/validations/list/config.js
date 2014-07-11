'use strict';

angular
    .module('report-editor')
    .config(function ($stateProvider) {
        $stateProvider
            .state('report.taxonomy.concept.formula.validations.list', {
                url: '',
                controller: 'ListValidationsCtrl',
                templateUrl: '/report/taxonomy/concept/formula/validations/list/list.html'
            });
    })
;