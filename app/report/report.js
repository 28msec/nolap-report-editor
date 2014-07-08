'use strict';

angular.module('report-editor')
.controller('ReportCtrl', function($scope, $state, report){
    $scope.report = report;

    if($state.current.name === 'report') {
        $state.go('report.taxonomy');
    }
})
;
