'use strict';

angular.module('report-editor')
.controller('ReportCtrl', function($q, $rootScope, $scope, Session, API, Report, report){
    $scope.report = report;

    var saveCanceler;

    $scope.$watch('report.model', function(newVal, oldVal){
        //TODO: JSON stringify is too slow
        if(oldVal === undefined || JSON.stringify(newVal) === JSON.stringify(oldVal)) {
            return;
        }
        $rootScope.$emit('apiStatus', { message: 'Saving Report...', code: 'warning' });
        if(saveCanceler) {
            saveCanceler.resolve();
        }
        saveCanceler = $q.defer();
        API.Report.addOrReplaceOrValidateReport({
            report: JSON.stringify($scope.report.model),
            token: Session.getToken(),
            $timeout: saveCanceler.promise
        })
        .then(function(response){  
            $rootScope.$emit('apiStatus', { message: 'Report saved', code: 'success', expires: 500 });
        })
        .catch(function(error){
            //error.statuys === 0 means two things: either we don't have internet of the http call has been canceled out. Either way it's not handled here
            if(error.status !== 0) {
                $rootScope.$emit('apiStatus', { message: 'Error while saving', code: 'error', expires: 4000 });
                $scope.report = new Report(oldVal);
            }
        });
    }, true);
})
;
