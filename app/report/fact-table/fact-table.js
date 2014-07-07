'use strict';

/* global accounting : false */

angular.module('report-editor')
.controller('FactTableCtrl', function($scope, Session, API, report, API_URL) {
    $scope.columns = [];
    $scope.data = null;
    $scope.error = null;
    $scope.loading = false;
    
	$scope.reload = function() {
		  var params = { report: report[0]._id, token: Session.getToken(), $method: 'POST' };		  
		  //params.aik = "0000021344-14-000008";	
		  
		  $scope.loading = true;
		  $scope.data = null;
		  $scope.error = null;
		  
		  API.Queries.listFactTableForReport(params).then(function(data){		  
			console.log(data);
		    $scope.data = data.FactTable;	
		    $scope.error = null;
		    
		    if ($scope.data && $scope.data.length > 0)
		    {
		        $scope.columns.push('xbrl:Entity');
		        $scope.columns.push('xbrl:Period');
		        $scope.columns.push('xbrl:Concept');
		        var insertIndex = 3;
		        Object.keys($scope.data[0].Aspects).forEach(function (key) {
		            switch (key)
		            {
		                case 'xbrl:Entity':
		                    $scope.entityIndex = 0;
		                    break;
		                case 'xbrl:Concept':
		                case 'xbrl:Period':
		                case 'sec:Accepted':
		                case 'sec:FiscalYear':
		                case 'sec:FiscalPeriod':
		                case 'sec:Archive':
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
		    
		    $scope.loading = false;
		    		    		    
		  })
		  .catch(function(error){
            $scope.loading = false;
            $scope.data = null;
            $scope.error = error;
          });;
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
    
    $scope.getExportURL = function(format) {
        return API_URL + '/_queries/public/api/facttable-for-report.jq?_method=POST&format=' + format + '&report=' + encodeURIComponent(report[0]._id) + '&token=' + Session.getToken();
    };
       
});
