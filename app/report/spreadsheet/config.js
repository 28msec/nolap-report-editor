'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.spreadsheet', {
        url: '/spreadsheet',
        templateUrl: '/report/spreadsheet/spreadsheet.html',
        controller: 'SpreadsheetCtrl'
    });
})
;