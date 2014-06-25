'use strict';

angular.module('report-editor')
.controller('ReportCtrl', function($scope, report){
    $scope.report = report[0];
})
;