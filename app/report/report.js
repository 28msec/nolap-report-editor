'use strict';

angular.module('report-editor')
.controller('ReportCtrl', function($rootScope, $scope, $state, Session, API, Report, report){
    $scope.report = report;

    $scope.$watch('report.model', function(newVal, oldVal){
        if(oldVal === undefined || JSON.stringify(newVal) === JSON.stringify(oldVal)) {
            return;
        }
        $rootScope.$emit('apiStatus', { message: 'Saving Report...', code: 'warning' });
        API.Report.addOrReplaceOrValidateReport({
            report: JSON.stringify($scope.report.model),
            token: Session.getToken()
        })
        .then(function(){  
            $rootScope.$emit('apiStatus', { message: 'Report saved', code: 'success', expires: 500 });
        })
        .catch(function(){
            $rootScope.$emit('apiStatus', { message: 'Error while saving', code: 'error', expires: 4000 });
            $scope.report = new Report(oldVal);
        });
    }, true);

    if($state.current.name === 'report') {
        $state.go('report.taxonomy');
    }
})
;
