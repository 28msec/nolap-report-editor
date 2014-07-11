'use strict';

angular
    .module('report-editor')
    .config(function ($stateProvider) {
        $stateProvider
            .state('report.taxonomy.concept.formula.validations.edit', {
                url: '/edit/:ruleId',
                controller: 'EditValidationsCtrl',
                templateUrl: '/report/taxonomy/concept/formula/validations/edit/edit.html'
            });
    })
;