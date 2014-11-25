'use strict';

angular.module('report-editor')
.controller('SpreadsheetCtrl', function($scope, $modal, $filter, PROFILE, Session, API, report, API_URL){
	$scope.mymodel = null;
	$scope.myheaders = null;
	  
	$scope.preview = { constraints : true, checks : false, truncate:true, css : 'preview-style', labelidx : 0 };
	  
	$scope.loading = false;

	$scope.reload = function() {
		  
	    $scope.loading = true;
		$scope.mymodel = null;	
		  
		var id = report.model._id;
		var params = { report: id, validate : true, token: Session.getToken(), $method: 'POST', eliminate : $scope.preview.elimination };

        if(report.hasSufficientFilters()) { // prevent execution of too heavy weight queries
            API.Queries.listSpreadsheetForReport(params).then(function (data) {
                    console.log(data);
                    $scope.mymodel = data;
                    $scope.myheaders = [
                        { label: '', value: data.TableSetLabels[0] }
                    ];                                       
                })
                .finally(function () {
                    $scope.loading = false;                    
                });
        }
    };

    $scope.onDataCellClick = function(data){
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
	     return API_URL + '/_queries/public/api/spreadsheet-for-report.jq?_method=POST&format=' + format + '&report=' + encodeURIComponent(report.model._id) + '&token=' + Session.getToken();
	};
	  
	// $scope.reload();
	  
	$scope.$watch('preview.elimination', $scope.reload);
	  	  
})
;
