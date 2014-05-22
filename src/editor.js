'use strict';

angular
.module('nolapReportEditor', ['reports.api.28.io'])
//http://angular-tips.com/blog/2014/03/transclusion-and-scopes/
.directive('reports', function($compile, ReportAPI){
    return {
        restrict: 'A',
        scope: {
            'reportApi': '@',
            'reportApiToken': '@'
        },
        transclude: true,
        controller: function($scope){
            var api = new ReportAPI($scope.reportApi);
            api.listReports({
                token: $scope.reportApiToken,
                $method: 'POST'
            })
            .then(function(reports){
                $scope.reports = reports;
            });
        },
        link: function($scope, element, attrs, ctrl, $transclude){
            $transclude($scope, function(clone, $scope) {
                element.append(clone);
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
