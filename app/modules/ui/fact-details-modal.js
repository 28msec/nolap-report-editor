'use strict';

angular
    .module('report-editor')
    .controller('FactDetailsCtrl', function(_, $scope, $templateCache, $compile, $modalInstance, PROFILE, fact){
        if(_.isArray(fact)) {
            fact = fact[0];
        }
        $scope.fact = fact;
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };

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
        //var aspects = keys($scope.fact.Aspects);
        var keyAspects = angular.copy($scope.fact.KeyAspects);
        if(PROFILE === 'sec') {
            keyAspects.push('dei:LegalEntityAxis');
        }
        for (var aspect in $scope.fact.Aspects){
            //var aspect = aspects[i];
            if($scope.fact.Aspects.hasOwnProperty(aspect)) {
                var aspectObject = {
                    name: aspect,
                    value: $scope.fact.Aspects[aspect]
                };
                if (isInArray(keyAspects, aspect)) {
                    $scope.keyAspects.push(aspectObject);
                } else {
                    $scope.nonKeyAspects.push(aspectObject);
                }
            }
        }

        //alert(JSON.stringify(data));
        $scope.computationAuditTrails = [];
        $scope.validationAuditTrails = [];
        var auditTrails = $scope.fact.AuditTrails;
        for (var j=0;j < auditTrails.length; j++){
            var trail = auditTrails[j];
            if(trail.Type === 'xbrl28:validation-stamp'){
                $scope.validationAuditTrails.push(trail);
            } else {
                $scope.computationAuditTrails.push(trail);
            }
        }
        $scope.isStampedFact = $scope.validationAuditTrails.length > 0;
        $scope.isValidationFact = $scope.fact['xbrl28:Type'] === 'xbrl28:validation';

        /*var validationStampIdx = $filter('getAuditTrailByTypeIdx')(data.AuditTrails, "");
        var validationIdx = $filter('getAuditTrailByTypeIdx')(data.AuditTrails, "xbrl28:validation");
        $scope.isStampedFact = validationStampIdx > -1;
        var isValidationFact = validationIdx > -1;
        var validationStamp = data.AuditTrails[validationStampIdx];
        var validation = data.AuditTrails[validationIdx];
*/


    })
;
