'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.preview', {
        url: '/preview',
        templateUrl: '/report/preview/preview.html',
        controller: 'PreviewCtrl'
    });
})
;