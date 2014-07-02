'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report', {
        url: '/:reportId',
        templateUrl: '/report/report.html',
        controller: 'ReportCtrl',
        resolve: {
            report: ['$stateParams', 'ReportEditorConfig', 'ReportAPI', function($stateParams, ReportEditorConfig, ReportAPI) {
                var api = new ReportAPI(ReportEditorConfig.api.endpoint);
                return api.listReports({
                    _id: $stateParams.reportId,
                    token: ReportEditorConfig.api.token,
                    $method: 'POST'
                });
            }]
        }
    });
})
;