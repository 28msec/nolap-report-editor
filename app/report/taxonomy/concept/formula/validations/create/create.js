'use strict';

angular.module('report-editor')
    .controller('CreateValidationsCtrl', function($scope, $state, $stateParams){
        $scope.languageType = $stateParams.languageType;

    })
;
