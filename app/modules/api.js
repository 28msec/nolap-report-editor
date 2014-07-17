angular.module('api', ['report-api', 'session-api', 'queries-api', 'constants'])
.factory('API', function(ReportAPI, SessionAPI, QueriesAPI, API_URL) {
    'use strict';

    return {
        Report: new ReportAPI(API_URL + '/_queries/public/reports'),
        Session: new SessionAPI(API_URL + '/_queries/public'),
        Queries: new QueriesAPI(API_URL + '/_queries/public/api')
    };
});