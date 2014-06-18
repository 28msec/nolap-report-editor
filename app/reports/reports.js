'use strict';

angular.module('report-editor')
.controller('ReportsCtrl', function($scope, reports){
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
        
    };
    
    $scope.deleteReports = function(){
        var selected = [];
        Object.keys($scope.selectedReports).forEach(function(key){
            if($scope.selectedReports[key] === true) {
                selected.push(key);
            }
        });
        console.log(selected);
    };

    console.log(reports);
})
;