'use strict';

angular.module('report-editor')
.controller('FiltersCtrl',
    function($scope, $state, $stateParams, $location, Filter, tags, entities, years, periods, sics) {
        $scope.tags = tags;
        $scope.entities = entities;
        $scope.years = years;
        $scope.periods = periods;
        $scope.sics = sics;
        var initDone = false;

        // for typeahead fields
        $scope.entityName = undefined;
        $scope.sicCode = undefined;

        Filter.getSelection($scope.report)
            .then(
                function (selection) {
                    $scope.selection = selection;
                    initDone = true;
                }
            );

        $scope.reset = function() {
            Filter.resetSelection($scope.report)
                .then(
                    function (selection) {
                        $scope.selection = selection;
                    }
                );
        };
        $scope.getEntity = Filter.getEntity;
        $scope.getSic = Filter.getSic;
        $scope.selectSic = Filter.selectSic;
        $scope.selectEntity = Filter.selectEntity;
        $scope.isLatestFiscalYearSelected = Filter.isLatestFiscalYearSelected;

        $scope.$watch(function () {
            return $scope.selection;
        }, function (newSelection, oldSelection) {
            if(initDone && !angular.equals(newSelection, oldSelection)) {
                Filter.getAspects()
                    .then(
                        function (aspects) {
                            if ($scope.report !== undefined && typeof $scope.report === 'object') {
                                $scope.report.updateAspects(aspects);
                            }
                        }
                    );
            }
        }, true);

        /*
         if ($scope.selection.cik.length === 0 &&
            $scope.selection.tag.length === 0 &&
            $scope.selection.fiscalYear.length === 0 &&
            $scope.selection.fiscalPeriod.length === 0)
        {
            $scope.reset();
        }


        */
    })
;