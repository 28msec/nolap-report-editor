'use strict';

angular.module('report-editor')
.controller('ReportsCtrl', function($scope, $state, $modal, reports){
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
        var modal = $modal.open({
            controller: 'CreateReportCtrl',
            templateUrl: '/reports/create-report.html'
        });
        modal.result.then(function(report){
            reports.push(report);
            $scope.reports = reports;
            $state.go('report', { id: report._id });
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
            promises.push(api.removeReport({ _id: id, token: $rootScope.session.getToken(), $method: 'POST' }).then(function(){
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
.controller('CreateReportCtrl', function($rootScope, $scope, $modalInstance, Report, ReportEditorConfig, ReportAPI){
    $scope.report = {};
    
    $scope.ok = function(){
        $scope.loading = true;
        //TODO: this will change with the new REST API
        var report = new Report($scope.report.name, $scope.report.name, '', 'http://reports.28.io');
        var api = new ReportAPI(ReportEditorConfig.api.endpoint);
        api.addOrReplaceOrValidateReport({
            report: report.model,
            $method: 'POST',
            token: $rootScope.session.getToken()
        })
        .then(function(){
            $scope.loading = false;
            $modalInstance.close(report.model);
        })
        .catch(function(error){
            $scope.loading = false;
            console.error(error);
        });
    };
    
    $scope.cancel = function(){
        $modalInstance.close();
    };
})
;