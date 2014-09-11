'use strict';

angular
    .module('report-editor')
    .directive('fact-details', function($filter){
        return {
            restrict: 'E',
            scope: {
                'fact': '='
            },
            templateUrl: '/modules/ui/fact-details.html',
            link: function($scope) {

                $scope.isValidation = $scope.fact['xbrl28:Type'] === 'xbrl28:validation';
                $scope.auditTrails = $scope.fact.AuditTrails;


                var isInArray = function(array, value){
                    if(array === undefined || array === null || array.length === 0){
                        return false;
                    }
                    for( var i=0; i < array.length; i++){
                        if (array[i] === value) {
                            return true;
                        }
                    }
                    return false;
                };

                $scope.keyAspects = [];
                $scope.nonKeyAspects = [];
                var aspects = keys($scope.fact.Aspects);
                var keyAspects = angular.copy($scope.fact.KeyAspects);
                keyAspects.push('dei:LegalEntityAxis');
                for (var i=0;i < aspects.lenth; i++){
                    var aspect = aspects[i];
                    var aspectObject = {
                        name: aspect,
                        value: $scope.fact.Aspects[aspect]
                    };
                    if(isInArray(keyAspects, aspect)){
                        $scope.keyAspects.push(aspectObject);
                    } else {
                        $scope.nonKeyAspects.push(aspectObject);
                    }
                }

                //alert(JSON.stringify(data));
                $scope.computationAuditTrails = [];
                $scope.validationAuditTrails = [];
                var auditTrails = $scope.fact.AuditTrails;
                for (var j=0;j < auditTrails.lenth; j++){
                    var trail = auditTrails[j];
                    if(trail.Type === 'xbrl28:validation-stamp'){
                        $scope.validationAuditTrails.push(trail);
                    } else {
                        $scope.computationAuditTrails.push(trail);
                    }
                }
                $scope.isStampedFact = $scope.validationAuditTrails.length > 0;
                $scope.isValidationFact = $scope.fact['xbrl28:Type'] === 'xbrl28:validation';

                var validationStampIdx = $filter('getAuditTrailByTypeIdx')(data.AuditTrails, "");
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

            }
        };
    })
;
