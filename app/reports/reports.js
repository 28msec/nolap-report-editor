/*global moment:false */
'use strict';

angular.module('report-editor')
.controller('ReportsCtrl', function($rootScope, $log, $scope, $stateParams, $state, $modal, reports){

    $scope.reports = reports;
    $scope.selectedReports = {};

    $scope.reports.forEach(function(report){
        $scope.selectedReports[report._id] = false;
    });
    
    $scope.formatDateTime = function(date){
        return moment(date).fromNow();
    };

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
            templateUrl: '/reports/create-report.html',
            resolve: {
                reportTemplates: [ '$stateParams', 'API', 'Session', function($stateParams, API, Session) {
                    return API.Report.listReports({
                        publicRead: true,
                        user: 'admin@28.io',
                        token: Session.getToken(),
                        $method: 'POST',
                        onlyMetadata: true
                    });
                }]
            }
        });
        modal.result.then(function(report){
            $scope.reports.push(report);
            $state.go('report.taxonomy.concepts', { 'reportId': report._id });
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
.controller('DeleteReportsCtrl', function($q, $scope, $modalInstance, API, Session, reports, reportIdsToDelete){

    $scope.loading = false;

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
            promises.push(API.Report.removeReport({ _id: id, token: Session.getToken(), $method: 'POST' }).then(function(){
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
.controller('CreateReportCtrl', function($scope, $modalInstance, $log, Report, API, Session, reportTemplates){
    $scope.report = {};
    $scope.reportTemplates = reportTemplates;
    $scope.selectedTemplate = '_empty';
    $scope.loadingStatus = '';

    $scope.selectTpl = function(id){
        $scope.selectedTemplate = id;
    };

    $scope.addReport = function(report){
        API.Report.addOrReplaceOrValidateReport({
            report: report.model,
            $method: 'POST',
            token: Session.getToken()
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

    $scope.ok = function(){
        $scope.loading = true;

        var user = Session.getUser();

        if($scope.selectedTemplate === '_empty'){
            $scope.loadingStatus = 'Creating Report ...';
            var newReport = new Report(undefined, $scope.report.name, '', 'http://reports.28.io', user.email);
            $scope.addReport(newReport);
        } else {
            $scope.loadingStatus = 'Loading Template ...';
            var id = $scope.selectedTemplate;
            API.Report.listReports({
                _id: id,
                user: 'admin@28.io',
                token: Session.getToken(),
                $method: 'POST'
            })
            .then(function(reportTemplates){
                $scope.loadingStatus = 'Creating Report ...';

                var reportTemplate = reportTemplates[0];
                if(reportTemplate === undefined){
                    $log.error('Couldnt find report with id ' + id);
                } else {
                    reportTemplate.Label = $scope.report.name;
                    reportTemplate.Owner = user.email;
                    reportTemplate.ACL = []; // make it private
                    delete reportTemplate._id;
                    var reportFromTemplate = new Report(reportTemplate);
                    $scope.addReport(reportFromTemplate);
                }
            });
        }
    };
    
    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    };
})
;