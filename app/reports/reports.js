'use strict';

angular.module('report-editor')
.controller('ReportsCtrl', function($scope, $modal, reports){
    $scope.reports = reports;
    $scope.selectedReports = {};
    $scope.reports.forEach(function(report){
        $scope.selectedReports[report._id] = false;
    });

    $scope.toggle = false;

    $scope.toggleAll = function(){
        angular.forEach($scope.selectedReports, function(value, index){
            $scope.selectedReports[index] = $scope.toggle;
        });
    };

    $scope.toggleReport = function(){
        if($scope.toggle === true){
            angular.forEach($scope.selectedReports, function(value) {
                if(value === false) {
                    $scope.toggle = null;
                    return false;
                }
            });
        }
    };

    $scope.hasSelectedReport = false;

    $scope.$watch('selectedReports', function(){
        var result = false;
        angular.forEach($scope.selectedReports, function(value){
            if(value === true) {
                result = true;
                return false;
            }
        });
        if($scope.toggle === null && result === false) {
            $scope.toggle = false;
        }
        $scope.hasSelectedReport = result;
    }, true);
    
    $scope.createReport = function(){
        $modal.open({
            controller: 'CreateReportCtrl',
            templateUrl: '/reports/create-report.html'
        });
    };
    
    $scope.deleteReports = function(){
        var ids = [];
        Object.keys($scope.selectedReports).forEach(function(key){
            if($scope.selectedReports[key] === true) {
                ids.push(key);
            }
        });
        $modal.open({
            controller: 'DeleteReportsCtrl',
            templateUrl: '/reports/delete-reports.html',
            resolve: {
                reportIdsToDelete: function(){
                    return ids;
                },
                reports: function(){
                    return $scope.reports;
                }
            }
        });
    };
})
.controller('DeleteReportsCtrl', function($q, $scope, $modalInstance, ReportEditorConfig, ReportAPI, reports, reportIdsToDelete){

    $scope.loading = false;

    var api = new ReportAPI(ReportEditorConfig.api.endpoint);

    $scope.names = [];
    reports.forEach(function(report){
        if(reportIdsToDelete.indexOf(report._id) !== -1){
            $scope.names.push(report.Label);
        } 
    });

    $scope.ok = function(){
        $scope.loading = true;
        var promises = [];
        reportIdsToDelete.forEach(function(id){
            promises.push(api.removeReport({ _id: id, token: ReportEditorConfig.api.token, $method: 'POST' }).then(function(){
                reports.forEach(function(report, index){
                    if(report._id === id) {
                        reports.splice(index, 1);
                    }
                });
            }));
        });
        $q
        .all(promises)
        .then(function(){
            $modalInstance.close();
        })
        .catch(function(error){
            console.error(error);
        })
        .finally(function(){
            $scope.loading = false;
        });
    };
    
    $scope.cancel = function(){
        $modalInstance.close();
    };
})
.controller('CreateReportCtrl', function($scope, $modalInstance){
    
})
;