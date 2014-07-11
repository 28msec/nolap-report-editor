'use strict';

angular
    .module('report-editor')
    .config(function ($stateProvider) {
        $stateProvider
            .state('report.taxonomy.concept.formula.validations.create', {
                url: '/create/:languageType',
                controller: 'CreateValidationsCtrl',
                templateUrl: '/report/taxonomy/concept/formula/validations/create/create.html'
            });
    })
;