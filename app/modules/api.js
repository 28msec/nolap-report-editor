angular.module('api', ['report-api', 'session-api', 'constants'])
.factory('API', function(ReportAPI, SessionAPI, API_URL) {
    'use strict';

    return {
        Report: new ReportAPI(API_URL + '/_queries/public/reports'),
        Session: new SessionAPI(API_URL + '/_queries/public')
    };
});