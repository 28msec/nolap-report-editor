'use strict';

angular.module('report-editor')
.controller('ReportCtrl', function($q, $rootScope, $scope, $timeout, Session, API, Report, report){
    $scope.report = report;

    var lastKnowSavedModel = $scope.report.model;
    var lastKnowSavedModelAsString = JSON.stringify(lastKnowSavedModel);
    var saveCanceler;
    var savePromise;

    $scope.$watch('report.model', function(newVal, oldVal){
        var reportAsString = JSON.stringify(newVal);
        if(oldVal === undefined || reportAsString === lastKnowSavedModelAsString) {
            return;
        }
        $scope.$broadcast('autofill:update');

        // we need a timeout (>=0) here to ensure the broadcast is handled first
        savePromise = $timeout(function(){
            if(savePromise){
                // cancel previous attempt to save
                $timeout.cancel(savePromise);
            }
            $rootScope.$emit('apiStatus', { message: 'Saving Report...', code: 'warning' });
            if(saveCanceler) {
                saveCanceler.resolve();
            }
            saveCanceler = $q.defer();
            API.Report.addOrReplaceOrValidateReport({
                report: reportAsString,
                token: Session.getToken(),
                $timeout: saveCanceler.promise
            })
            .then(function(){
                lastKnowSavedModel = newVal;
                lastKnowSavedModelAsString = JSON.stringify(lastKnowSavedModel);
                $rootScope.$emit('apiStatus', { message: 'Report saved', code: 'success', expires: 500 });
            })
            .catch(function(error){
                //error.statuys === 0 means two things: either we don't have internet of the http call has been canceled out. Either way it's not handled here
                if(error.status !== 0) {
                    $rootScope.$emit('apiStatus', { message: 'Error while saving', code: 'error', expires: 4000 });
                    $scope.report = new Report(lastKnowSavedModelAsString);
                }
            });
        }, 28);
    }, true);
})
;
