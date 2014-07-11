'use strict';

angular
    .module('report-editor')
    .config(function ($stateProvider) {
        $stateProvider
            .state('report.taxonomy.concept.formula.validations', {
                url: '/validations',
                abstract: true,
                controller: 'ValidationsCtrl',
                template: '<div ui-view></div>'
            });
    })
;