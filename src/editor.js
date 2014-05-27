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
        /*
            $scope.$watch('dirtyModel', function(dirtyModel){
                //console.log('dirtyModel');
                //console.log(dirtyModel);
                return;
                api.addOrReplaceOrValidateReport({
                    report: dirtyModel,
                    token: $scope.reportApiToken,
                    $method: 'POST'
                })
                .then(function(){
                    $scope.model = angular.copy(dirtyModel);
                })
                .catch(function(){
                    $scope.dirtyModel = angular.copy($scope.model);
                });
            });
        },
        */
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

            $scope.select = function(row) {
                if(row.branch.To) {
                    row.branch.expanded = !row.branch.expanded;
                } else {
                    $scope.selected = row.branch;
                    console.log($scope.selected.Id);
                }
            };

            var setRows = function(tree, level, visible){
                var parentExpanded = tree.expanded !== undefined ?  tree.expanded : true;
                Object.keys(tree).forEach(function(leaf){
                    var branch = tree[leaf];
                    branch.expanded = branch.expanded !== undefined ? branch.expanded : true;
                    $scope.rows.push({ branch: branch, level: level, visible: visible });
                    if(branch.To){
                        setRows(branch.To, level + 1, visible === false ? false : branch.expanded);
                    }
                });
            };
    
            var onChange = function(tree){
                $scope.rows = []; 
                setRows(tree, 1, true);
            };

            return $scope.$watch('presentationTree', onChange, true);
        }   
    };
})
;