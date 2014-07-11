'use strict';

angular.module('report-editor')
    .controller('ListComputationCtrl', function($scope, $state, $stateParams){
        $scope.languageType = $stateParams.languageType;

    })
;
