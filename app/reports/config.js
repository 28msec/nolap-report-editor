'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('reports', {
        url: '/',
        templateUrl: '/reports/reports.html',
        controller: 'ReportsCtrl',
        resolve: {
            reports: [ '$stateParams', 'API', 'Session', function($stateParams, API, Session) {
                return API.Report.listReports({
                    _id: $stateParams.id,
                    token: Session.getToken(),
                    $method: 'POST'
                });
            }]
        }
    });
});