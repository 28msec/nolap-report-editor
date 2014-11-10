'use strict';

/* global accounting : false */

angular.module('report-editor')
.controller('FactsCtrl', function($scope, $timeout, $modal, Session, API, report, API_URL) {
    $scope.columns = [];
    $scope.data = null; 
    $scope.loading = false;
    $scope.dynamic = 0;
    $scope.max = 0;

    /*$scope.advanceProgress = function(init){
        if(init){
            $scope.max = 100;
            $scope.dynamic = 0;
            var estimate = $scope.report.countAspectsRestrictions(['xbrl28:Archive']) * $scope.report.countAspectsRestrictions(['xbrl:Concept']);
            $scope.step = $scope.max * 10 / estimate;
        }
        if($scope.loading){

            $scope.$apply(
                function() {
                    $scope.dynamic += $scope.step;
                    console.log($scope.dynamic);
                    $timeout($scope.advanceProgress, 100);
                }
            );
        }
    };*/

    $scope.reload = function() {
		console.log(report);
        var params = { report: report.model._id, token: Session.getToken(), $method: 'POST' };
        //params.aik = "0000021344-14-000008";

        $scope.data = null;     

        if(report.hasSufficientFilters()) {
            $scope.loading = true;
            //$scope.advanceProgress(true);

            API.Queries.listFactTableForReport(params).then(function (data) {
                console.log(data);
                $scope.data = data.FactTable;             

                if ($scope.data && $scope.data.length > 0) {
                    $scope.columns.push('xbrl:Entity');
                    $scope.columns.push('xbrl:Period');
                    $scope.columns.push('xbrl:Concept');
                    var insertIndex = 3;
                    Object.keys($scope.data[0].Aspects).forEach(function (key) {
                        switch (key) {
                            case 'xbrl:Entity':
                                $scope.entityIndex = 0;
                                break;
                            case 'xbrl:Concept':
                            case 'xbrl:Period':
                            case 'sec:Accepted':
                            case 'sec:FiscalYear':
                            case 'sec:FiscalPeriod':
                            case 'xbrl28:Archive':
                                break;
                            case 'dei:LegalEntityAxis':
                                $scope.columns.splice(insertIndex, 0, key);
                                insertIndex++;
                                break;
                            default:
                                $scope.columns.splice(insertIndex, 0, key);
                        }
                    });
                }
                
            })
            .finally(
                function () {
                    $scope.loading = false;                  
                });
        }
    };
	  
	$scope.reload();
	   
    $scope.showText = function(html) {
        $scope.$emit('alert', 'Text Details', html);
    };

    $scope.showNumber = function(value) {
        return accounting.formatNumber(value);
    };

    $scope.isBlock = function(string) {
        if (!string) {
            return false;
        }
        return string.length > 60;
    };

    $scope.onValueClick = function(data){
        $modal.open({
            templateUrl: '/modules/ui/fact-details-modal.html',
            controller: 'FactDetailsCtrl',
            size: 'lg',
            resolve: {
                fact: function () {
                    return data;
                }
            }
        });
    };

    $scope.getExportURL = function(format) {
        return API_URL + '/_queries/public/api/facttable-for-report.jq?_method=POST&format=' + format + '&report=' + encodeURIComponent(report.model._id) + '&token=' + Session.getToken();
    };
       
});
