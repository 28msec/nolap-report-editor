/*global moment:false */
'use strict';

angular.module('report-editor')
.controller('ReportsCtrl', function($rootScope, $log, $scope, $stateParams, $state, $modal, reports, $window, Session, API_URL){

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
    $scope.hasSingleSelectedReport = false;

    $scope.$watch('selectedReports', function(){
        var result = false;
        var count = 0;
        angular.forEach($scope.selectedReports, function(value){
            if(value === true) {
                count++;
                result = true;
                return false;
            }
        });
        $scope.hasSingleSelectedReport = count === 1;
        if($scope.toggle === null && result === false) {
            $scope.toggle = false;
        }
        $scope.hasSelectedReport = result;
    }, true);

    $scope.downloadSelectedReport = function() {
        var ids = $scope.getSelectedReportIds();
        if(ids.length !== 1){
            $log.error('Too many IDs: ' + JSON.stringify(ids));
        } else {
            $window.location.href = API_URL + '/_queries/public/reports/reports.jq?_method=POST&_id=' + ids[0] + '&export=true&token=' + Session.getToken();
        }
    };

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

    $scope.importReport = function(){
        var modal = $modal.open({
            controller: 'ImportReportCtrl',
            templateUrl: '/reports/import-report.html'
        });
        modal.result.then(function(report){
            $scope.reports.push(report);
        });
    };

    $scope.getSelectedReportIds = function(){
        var ids = [];
        Object.keys($scope.selectedReports).forEach(function(key){
            if($scope.selectedReports[key] === true) {
                ids.push(key);
            }
        });
        return ids;
    };

    $scope.deleteReports = function(){
        var ids = $scope.getSelectedReportIds();
        var modal = $modal.open({
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
        modal.result.then(function(){
            $scope.selectedReports = {};
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
        $modalInstance.dismiss('cancel');
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
.controller('ImportReportCtrl', function($scope, $modalInstance, $log, API_URL, Session, ReportID, $upload /* angularFileUpload service */){
    $scope.report = {};
    $scope.loading = false;
    $scope.file = undefined;
    $scope.progress = 0;
    $scope.filename = '';
    $scope.error = undefined;

    $scope.onFileSelect = function(files) {
        var file = files[0];
        $scope.error = undefined;
        if (files.length === 0) {
            $log.error('No file selected');
        } else if (files.length > 1) {
            $scope.error = 'Can only upload one file at a time.';
        } else if (file.name.indexOf('.xbrlb', file.name.length - '.xbrlb'.length) !== -1) {
            $scope.file = files[0];
            $scope.filename = file.name;
        } else {
            $scope.error = 'Cannot upload file "' + file.name + '". Only files of type ".xbrlb" can be uploaded.';
        }
    };

    $scope.dragOverClass = function($event) {
        var items;
        if($event.dataTransfer !== undefined && $event.dataTransfer.items !== undefined){
            items = $event.dataTransfer.items;
        }
        var dropOK = false;
        if (items !== undefined && items !== null && items.length === 1 && items[0].kind === 'file') {
            dropOK = true;
        }
        return dropOK ? 'drag-over' : 'drag-over-error';
    };

    $scope.ok = function() {
        if ($scope.file === undefined) {
            $scope.error = 'Please, select a file to upload';
        } else {
            $scope.loading = true;

            var newId = new ReportID().toString();
            var uploadUrl = API_URL + '/_queries/public/reports/add-report.jq?_method=POST&import=true&token=' + Session.getToken() + '&private=true&_id=' + newId;
            var fileReader = new FileReader();
            fileReader.readAsArrayBuffer($scope.file);
            fileReader.onload = function (e) {
                $upload.http({
                    url: uploadUrl,
                    data: e.target.result
                }).progress(function (event) {
                    $scope.progress = parseInt(100.0 * event.loaded / event.total);
                }).success(function (data) {
                    $scope.loading = false;
                    $modalInstance.close(data);
                }).error(function (data) {
                    $scope.loading = false;
                    $log.error(JSON.stringify(data));
                });
            };
        }
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
        return false;
    };
})
;
