'use strict';

angular.module('report-editor')
.controller('SpreadsheetCtrl', function($scope, $modal, $filter, Session, API, report, API_URL){
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

        if(report.hasSufficientFilters()) { // prevent execution of too heavy weight queries
            API.Queries.listSpreadsheetForReport(params).then(function (data) {
                    console.log(data);
                    $scope.mymodel = data;
                    $scope.myheaders = [
                        { label: '', value: data.TableSetLabels[0] }
                    ];
                    $scope.error = null;
                    $scope.loading = false;
                })
                .catch(function (error) {
                    $scope.loading = false;
                    $scope.mymodel = null;
                    $scope.error = error;
                });
        }
    };

    $scope.onDataCellClick = function(data){
        //alert(JSON.stringify(data));
        var validationStampIdx = $filter('getAuditTrailByTypeIdx')(data.AuditTrails, "xbrl28:validation-stamp");
        var validationIdx = $filter('getAuditTrailByTypeIdx')(data.AuditTrails, "xbrl28:validation");
        var isStampedFact = validationStampIdx > -1;
        var isValidationFact = validationIdx > -1;
        var validationStamp = data.AuditTrails[validationStampIdx];
        var validation = data.AuditTrails[validationIdx];

        if(isStampedFact || isValidationFact) {
            $modal.open({
                templateUrl: '/modules/ui/validation-details-modal.html',
                controller: 'FactDetailCtrl',
                size: 'lg',
                resolve: {
                    isStampedFact: function () {
                        return isStampedFact;
                    },
                    validationStamp: function () {
                        return validationStamp;
                    },
                    isValidationFact: function(){
                        return isValidationFact;
                    },
                    validation: function(){
                        return validation;
                    }
                }
            });
        }
    };
	  
	$scope.getExportURL = function(format) {
	     return API_URL + '/_queries/public/api/spreadsheet-for-report.jq?_method=POST&format=' + format + '&report=' + encodeURIComponent(report.model._id) + '&token=' + Session.getToken();
	};
	  
	// $scope.reload();
	  
	$scope.$watch('preview.elimination', $scope.reload);
	  	  
})
    .controller('FactDetailCtrl', function($scope, $modalInstance, isStampedFact, validationStamp, isValidationFact, validation){
        $scope.isStampedFact = isStampedFact;
        $scope.validationStamp = validationStamp;
        $scope.isValidationFact = isValidationFact;
        $scope.validation = validation;
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .filter('getAuditTrailByTypeIdx', function(){
        return function(auditTrails, type){
            if(auditTrails === undefined || auditTrails === null){
                return -1;
            }
            for (var i = 0; i<auditTrails.length; i++){
                if(auditTrails[i].Type === type){
                    return i;
                }
            }
        }
    });