'use strict';

angular
.module('nolapReportEditor', ['reports.api.28.io'])
.directive('reports', function(ReportAPI){
    return {
        restrict: 'A',
        scope: {
            'reportApi': '=api',
            'reportApiToken': '=token'
        },
        link: function($scope){
            ReportAPI.listReports()
            .then(function(reports){
                console.log(reports);
                $scope.reports = reports;
            });
        }
    };
})
;
