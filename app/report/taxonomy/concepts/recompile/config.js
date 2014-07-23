'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
        .state('report.taxonomy.concepts.recompile', {
            url: '/recompile',
            templateUrl: '/report/taxonomy/concepts/recompile/recompile.html',
            controller: 'RecompileCtrl'
        });
})
;