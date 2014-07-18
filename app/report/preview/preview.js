'use strict';

angular.module('report-editor')
.controller('PreviewCtrl', function($scope, Session, API, report, API_URL){
	  $scope.mymodel = null;
	  $scope.myheaders = null;
	  
	  $scope.preview = { constraints : false, checks : true, css : 'preview-style', labelidx : 0, elimination : false };
	  $scope.error = null;
	  
	  $scope.loading = false;
	  		  
	  $scope.reload = function() {			 
		  
		  $scope.loading = true;
		  $scope.mymodel = null;
		  $scope.error = null;
		  
		  var id = report.model._id;		  
		  var params = { report: id, validate : true, token: Session.getToken(), $method: 'POST', eliminate : $scope.preview.elimination };
		  
		  //params.cik = "0000021344";
		  //params.fiscalYear = "2013";
		  //params.fiscalPeriod = "FY";
		  
		  API.Queries.listSpreadsheetForReport(params).then(function(data){		  
			console.log(data);
		    $scope.mymodel = data;
		    $scope.myheaders = [ { label:"", value:data.TableSetLabels[0] }];
		    $scope.error = null;
		    $scope.loading = false;
		  })
		  .catch(function(error){
            $scope.loading = false;
            $scope.mymodel = null;
            $scope.error = error;
          });
	  };
	  
	  $scope.getExportURL = function(format) {
	       return API_URL + '/_queries/public/api/spreadsheet-for-report.jq?_method=POST&format=' + format + '&report=' + encodeURIComponent(report.model._id) + '&token=' + Session.getToken();
	  };
	  
	  // $scope.reload();
	  
	  $scope.$watch('preview.elimination', $scope.reload);
	  	  
});