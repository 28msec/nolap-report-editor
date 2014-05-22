'use strict';

angular
.module('nolapReportEditor', ['reports.api.28.io'])
.directive('reports', function(ReportAPI){
    return {
        restrict: 'A',
        scope: {
            'reportApi': '=',
            'reportApiToken': '='
        },
        link: function($scope){
            console.log($scope.api);
            var api = new ReportAPI($scope.reportApi);
            api.listReports({
                token: $scope.reportApiToken
            })
            .then(function(reports){
                console.log(reports);
                $scope.reports = reports;
            });
        }
    };
})
;
