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
            this.getPresentationTree = function(){
                return $scope.report.getNetwork('Presentation').Trees;
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
            var tree = reportCtrl.getPresentationTree();
    
            $scope.select = function(row) {
                if(row.branch.children.length > 0) {
                    row.branch.expanded = !row.branch.expanded;
                } else {
                    $scope.$emit('selectTreeItem', row.branch);
                }   
            };
            
            var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();
    
            var setRows = function(tree, level, visible){
                console.log(tree);
                Object.keys(tree).forEach(function(leaf){
                    var branch = tree[leaf];
                    $scope.rows.push({ branch: branch, level: level, visible: visible, id: guid() }); 
                    if(branch.To === undefined) {//if(Object.keys(branch.To).length === 0) {
                        visible = true;
                    } else {
                        setRows(branch.To, level + 1, visible);
                    }
                });
                console.log($scope.rows);
            };  
    
            var onChange = function(){
                $scope.rows = []; 
                setRows(tree, 1, true);
            };  
    
            //$scope.Path = Path;
            return $scope.$watch('treeData', onChange, true);
        }   
    };
})
;