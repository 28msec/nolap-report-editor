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
            reports: ['$rootScope', '$stateParams', 'ReportAPI', function($rootScope, $stateParams, ReportAPI) {
                return ReportAPI.listReports({
                    _id: $stateParams.id,
                    token: $rootScope.session.getToken(),
                    $method: 'POST'
                });
            }]
        }
    });
});