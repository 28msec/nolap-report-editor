'use strict';

angular
.module('nolapReportEditor', ['reports.api.28.io'])
//http://angular-tips.com/blog/2014/03/transclusion-and-scopes/
.directive('reports', function($compile, ReportAPI){
    return {
        restrict: 'A',
        scope: {
            'reportApi': '@',
            'reportApiToken': '@'
        },
        transclude: true,
        controller: function($scope){
            var api = new ReportAPI($scope.reportApi);
            api.listReports({
                token: $scope.reportApiToken,
                $method: 'POST'
            })
            .then(function(reports){
                $scope.reports = reports;
            })
            .catch(function(error){
                console.error(error);
                $scope.error = error;
            });
        },
        link: function($scope, element, attrs, ctrl, $transclude){
            $transclude($scope, function(clone) {
                element.append(clone);
            });
        }
    };
})
.directive('report', function(Report, ReportAPI){
    return {
        restrict: 'E',
        transclude: true,
        controller: function($scope){

            this.getReport = function(){
                return $scope.report;
            };
            
            this.getPresentationTree = function(){
                return this.getReport().getNetwork('Presentation').Trees;
            };
        },
        link: function($scope, element, attrs, ctrl, $transclude){
            var api = new ReportAPI(attrs.reportApi);
            api.listReports({
                _id: attrs.reportId,
                token: attrs.reportApiToken,
                $method: 'POST'
            })
            .then(function(reports){
                $scope.model = reports[0];
                $scope.dirtyModel = angular.copy($scope.model);
                $scope.report = new Report($scope.dirtyModel);
                $scope.concepts = $scope.report.listConcepts();
            })
            .catch(function(error){
                console.error(error);
                $scope.error = error;
            });
            
            $transclude($scope, function(clone) {
                element.append(clone);
            });

            $scope.$watch('dirtyModel', function(dirtyModel, previousVersion){
                if(previousVersion === undefined) {
                    return;
                }
                api.addOrReplaceOrValidateReport({
                    report: dirtyModel,
                    token: attrs.reportApiToken,
                    $method: 'POST'
                })
                .then(function(){
                    console.log('new model saved');
                    $scope.model = angular.copy(dirtyModel);
                    $scope.concepts = $scope.report.listConcepts();
                })
                .catch(function(error){
                    console.error(error);
                    $scope.dirtyModel = angular.copy($scope.model);
                    $scope.concepts = $scope.report.listConcepts();
                });
            }, true);
        }
    };
})
.directive('presentationTree', function(PresentationTreeTpl){
    return {
        restrict: 'E',
        template: PresentationTreeTpl,
        require: '^report',
        link: function($scope, element, attrs, reportCtrl) {
            $scope.presentationTree = reportCtrl.getPresentationTree();
            $scope.sortableOptions = {
                stop: function(e, ui){
                    var item = angular.element(ui.item);
                    var subtreeRootElementID = item.attr('id');
                    $scope.rows.forEach(function(row, index){
                        if(row.branch.Id === subtreeRootElementID) {
                            if(index === 0){
                                reportCtrl.getReport().moveTreeBranch('Presentation', subtreeRootElementID);
                            } else {
                                //var currentLevel = row.level;
                                var siblingIdx = index - 1;
                                var parentIdx = index - 1;
                                //var sibling = $scope.rows[siblingIdx];
                                var parent = $scope.rows[parentIdx];
                                while(parent.level === row.level){
                                    parentIdx--;
                                    parent = $scope.rows[parentIdx];
                                }
                                reportCtrl.getReport().moveTreeBranch('Presentation', subtreeRootElementID, parent.branch.Id, parentIdx - siblingIdx + 1);
                            }
                            return false;
                        }
                    });
                }
            };

            $scope.select = function(row) {
                if(row.branch.To) {
                    row.branch.expanded = !row.branch.expanded;
                    $scope.rows = setRows($scope.presentationTree, 1, true, []);
                } else {
                    $scope.selected = row.branch;
                }
            };

            var setRows = function(tree, level, visible, rows){
                if(visible === false) {
                    return; 
                }
                Object.keys(tree).forEach(function(leaf){
                    var branch = tree[leaf];
                    branch.expanded = branch.expanded !== undefined ? branch.expanded : true;
                    rows.push({ branch: branch, level: level, visible: visible });
                    if(branch.To){
                        setRows(branch.To, level + 1, visible === false ? false : branch.expanded, rows);
                    }
                });
                return rows;
            };

            //$scope.rows = [];
            var onChange = function(tree){
                $scope.rows = setRows(tree, 1, true, []);
            };

            $scope.$watch('presentationTree', onChange, true);
        }   
    };
})
;