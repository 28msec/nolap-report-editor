'use strict';

angular
.module('report-editor')
.controller('TaxonomyCtrl', function($scope){
    $scope.presentationNetwork = $scope.report.getNetwork('Presentation').Trees;
});