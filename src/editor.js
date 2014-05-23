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
            })
            .catch(function(error){
                $scope.error = error;
            });
        },
        link: function($scope, element, attrs, ctrl, $transclude){
            $transclude($scope, function(clone) {
                element.append(clone);
            });
        }
    };
})
.directive('report', function(Report, ReportAPI){
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            'reportApi': '@',
            'reportApiToken': '@',
            'reportId': '@'
        },
        controller: function($scope){
            var api = new ReportAPI($scope.reportApi);

            $scope.$watch('dirtyModel', function(dirtyModel){
                api.addOrReplaceOrValidateReport({
                    report: dirtyModel,
                    token: $scope.reportApiToken,
                    $method: 'POST'
                })
                .then(function(){
                    $scope.model = angular.copy(dirtyModel);
                })
                .catch(function(){
                    $scope.dirtyModel = angular.copy($scope.model);
                });
            });

            api.listReports({
                name: $scope.reportId,
                token: $scope.reportApiToken,
                $method: 'POST'
            })
            .then(function(reports){
                $scope.model = reports[0];
                $scope.dirtyModel = angular.copy($scope.model);
                $scope.report = new Report($scope.dirtyModel);
            })
            .catch(function(error){
                $scope.error = error;
            });
        },
        link: function($scope, element, attrs, ctrl, $transclude){
            $transclude($scope, function(clone) {
                element.append(clone);
            });
        }
    };
})
;
