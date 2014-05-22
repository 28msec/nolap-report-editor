'use strict';

angular
.module('nolapReportEditor', ['reports.api.28.io'])
.directive('reports', function(ReportAPI){
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<div class="reports" ng-transclude></div>',
        scope: {
            'reportApi': '@',
            'reportApiToken': '@'
        },
        controller: function($scope){
            var api = new ReportAPI($scope.reportApi);
            api.listReports({
                token: $scope.reportApiToken,
                $method: 'POST'
            })
            .then(function(reports){
                $scope.$parent.reports = reports;
            });
            
        }
    };
})
.directive('report', function(ReportAPI){
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<div class="report" ng-transclude></div>',
        scope: {
            'reportApi': '@',
            'reportApiToken': '@',
            'reportId': '@'
        },
        controller: function($scope){
            var api = new ReportAPI($scope.reportApi);
            api.listReports({
                name: $scope.reportId,
                token: $scope.reportApiToken,
                $method: 'POST'
            })
            .then(function(report){
                console.log(report)
            });
        }
    };
})
;
