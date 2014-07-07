'use strict';

angular.module('report-editor')
.controller('ReportCtrl', function($scope, $state, report, Report){
    $scope.report = new Report(report[0]);

    if($state.current.name === 'report') {
        $state.go('report.taxonomy');
    }
})
;