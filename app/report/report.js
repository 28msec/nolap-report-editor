'use strict';

angular.module('report-editor')
.controller('ReportCtrl', function($q, $rootScope, $scope, $timeout, Session, API, Report, report){
    $scope.report = report;

    var lastSavedModel;
    
    var inProgress, isWaiting;

    var save = function(reportModel){
        $rootScope.$emit('apiStatus', { message: 'Saving Report...', code: 'warning' });
        return API.Report.addOrReplaceOrValidateReport({
            report: JSON.stringify(reportModel),
            token: Session.getToken()
        })
        .then(function(){
            lastSavedModel = reportModel;
            $rootScope.$emit('apiStatus', { message: 'Report saved', code: 'success', expires: 500 });
        })
        .catch(function(error){
            //error.statuys === 0 means two things: either we don't have internet of the http call has been canceled out. Either way it's not handled here
            if(error.status !== 0) {
                $rootScope.$emit('apiStatus', { message: 'Error while saving', code: 'error', expires: 4000 });
                $scope.report = new Report(lastSavedModel);
            }
        })
        .finally(function(){
            //3. When inProgress is done execute isWaiting if present.
            if(isWaiting) {
                inProgress = isWaiting();
                isWaiting = undefined;
            } else {
                inProgress = undefined;
            }
        });
    };    

    $scope.$watch('report.model', function(newReportModel, oldReportModel){
        //TODO: fix report comparison
        if(oldReportModel === undefined) {
            lastSavedModel = newReportModel;
            return;
        }
        $scope.$broadcast('autofill:update');

        $timeout(function(){
            //1. inProgress === null, execute request
            if(inProgress === undefined) {
                inProgress = save(newReportModel);
            //2. inProgress !== null, isWaiting = request
            } else {
                isWaiting = function(){ return save(newReportModel); };
            }
        }, 28);
    }, true);
})
;
