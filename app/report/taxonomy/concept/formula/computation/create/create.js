'use strict';

angular.module('report-editor')
    .controller('CreateComputationCtrl', function($scope, $state, $stateParams){
        $scope.languageType = $stateParams.languageType;

    })
;
