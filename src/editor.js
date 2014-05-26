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
        scope: {
            'reportApi': '@',
            'reportApiToken': '@',
            'reportId': '@'
        },
        controller: function($scope){
            var api = new ReportAPI($scope.reportApi);

            $scope.$watch('dirtyModel', function(dirtyModel){
                console.log('dirtyModel');
                console.log(dirtyModel);
                return;
                /*
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
                */
            });

            api.listReports({
                _id: $scope.reportId,
                token: $scope.reportApiToken,
                $method: 'POST'
            })
            .then(function(reports){
                $scope.model = reports[0];
                $scope.dirtyModel = angular.copy($scope.model);
                $scope.report = new Report($scope.dirtyModel);
                $scope.concepts = $scope.report.listConcepts();
            })
            .catch(function(error){
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
.directive('presentationTree', function(PresentationTreeTpl){
    return {
        restrict: 'E',
        template: PresentationTreeTpl,
        requires: '^report',
        scope: {
            selected: '='
        },
        link: function($scope) {

            //$rootScope.$on('selectTreeItem', function(e, branch){
            //   $scope.selected = branch;
            //    branch.onSelect(branch);
            //}); 
    
            $scope.select = function(row) {
                if(row.branch.children.length > 0) {
                    row.branch.expanded = !row.branch.expanded;
                } else {
                    $scope.$emit('selectTreeItem', row.branch);
                }   
            };  
    
            var setRows = function(branches, level, visible){
                branches.forEach(function(branch){
                    $scope.rows.push({ branch: branch, level: level, visible: visible }); 
                    if(branch.children.length === 0) {
                        branch.expanded = true;
                    }   
                    setRows(branch.children, level + 1, visible === false ? false : branch.expanded);
                }); 
            };  
    
            var onChange = function(){
                $scope.rows = []; 
                setRows($scope.treeData, 1, true);
            };  
    
            //$scope.Path = Path;
            return $scope.$watch('treeData', onChange, true);
        }   
    };
})
;
