angular.module('report-api', ['report-service', 'constants'])
    .factory('ReportAPI', function($q, $http, $rootScope, ReportService, API_URL) {
        'use strict';
        return new ReportService(API_URL + '/_queries/public/reports');
    });