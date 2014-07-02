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
                report: ['$rootScope', '$stateParams', 'ReportAPI', function($rootScope, $stateParams, ReportAPI) {
                    return ReportAPI.listReports({
                        _id: $stateParams.reportId,
                        token: $rootScope.session.getToken(),
                        $method: 'POST'
                    });
                }]
            }
        });
})
;