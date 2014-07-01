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
            reports: ['ReportEditorConfig', 'ReportAPI', function(ReportEditorConfig, ReportAPI) {
                var api = new ReportAPI(ReportEditorConfig.api.endpoint);
                return api.listReports({
                    token: ReportEditorConfig.api.token,
                    $method: 'POST'
                });
            }]
        }
    });
})
;