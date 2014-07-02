'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
        .state('report', {
            url: '/:reportId',
            templateUrl: 'report/report.html',
            controller: 'ReportCtrl',
            resolve: {
                report: [ '$stateParams', 'API', 'Session', function($stateParams, API, Session) {
                    return API.Report.listReports({
                        _id: $stateParams.reportId,
                        token: Session.getToken(),
                        $method: 'POST'
                    });
                }]
            }
        });
})
;