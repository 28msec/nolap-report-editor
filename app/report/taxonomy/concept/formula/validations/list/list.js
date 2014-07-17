'use strict';

angular.module('report-editor')
    .controller('ListValidationsCtrl', function($scope, $state, $stateParams){
        $scope.languageType = $stateParams.languageType;

    })
;
