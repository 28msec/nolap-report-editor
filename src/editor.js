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
.directive('report', function($rootScope, Report, ReportAPI){
    return {
        restrict: 'E',
        transclude: true,
        controller: function($scope){

            this.getReport = function(){
                return $scope.report;
            };
            
            this.getConcepts = function(){
                return $scope.concepts;
            };
            
            this.getPresentationTree = function(){
                return this.getReport().getNetwork('Presentation').Trees;
            };
            
            this.getConceptMap = function(){
                return this.getReport().getNetwork('ConceptMap').Trees;
            };
        },
        link: function($scope, element, attrs, ctrl, $transclude){
            
            $scope.isInPresentation = function(concept){
                return $scope.report.findInTree('Presentation', concept.Name).length > 0;
            };
            
            $scope.isInConceptMap = function(concept){
                return $scope.report.findInConceptMap(concept.Name).length > 0;
            };
            
            $scope.isInBusinessRule = function(concept){
                return $scope.report.findInRules(concept.Name).length > 0;
            };
                    
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

                if(previousVersion === undefined || JSON.stringify(dirtyModel) === JSON.stringify(previousVersion)) {
                    return;
                }
  /*  
        var instance = jsondiffpatch.create({
        objectHash: function(obj) {
            return obj._id || obj.id || obj.name || JSON.stringify(obj);
        }
    });
    console.log(dirtyModel);
    console.log(previousVersion);
var delta = instance.diff(dirtyModel, previousVersion);
console.log(delta);
*/
                $rootScope.$emit('saving');
                api.addOrReplaceOrValidateReport({
                    report: dirtyModel,
                    token: attrs.reportApiToken,
                    $method: 'POST'
                })
                .then(function(){
                    $rootScope.$emit('saved');
                    console.log('new model saved');
                    $scope.model = angular.copy(dirtyModel);
                    $scope.concepts = $scope.report.listConcepts();
                })
                .catch(function(error){
                    $rootScope.$emit('savingError');
                    console.error(error);
                    $scope.dirtyModel = angular.copy($scope.model);
                    $scope.concepts = $scope.report.listConcepts();
                });
            }, true);
        }
    };
})
.directive('presentationTree', function($rootScope, PresentationTreeTpl) {

    var safeApply = function(scope, fn){
        scope.$apply(function(){
            try {
                fn();
            } catch (e) {
                $rootScope.$emit('error', 500, e.message);
            }
        });
    };

    return {
        restrict: 'E',
        scope: {
            'conceptName': '@'
        },
        template: PresentationTreeTpl,
        require: '^report',
        link: function($scope, element, attrs, reportCtrl) {
            $scope.sortableOptions = {
                placeholder: "sortable",
                connectWith: ".sortable-container",
                receive: function(e, ui){
                    var concept = ui.item.sortable.moved;
                    var dropIdx = ui.item.sortable.dropindex;
                    var parentIdx = dropIdx - 1;
                    var parentLevel = $scope.rows[dropIdx].level - 1;
                    var parent = $scope.rows[parentIdx];
                    while(parent.level !== parentLevel) {
                        parentIdx--;
                        parent = $scope.rows[parentIdx];
                    }
                    //networkShortName, parentElementID, conceptName, offset
                    //safeApply($scope, function(){
                        reportCtrl.getReport().addTreeChild('Presentation', parent.branch.Id, ui.item.text(), dropIdx - 1 - parentIdx);
                        ui.item.sortable.cancel();
                    //});
                },
                stop: function(e, ui){
                    var item = angular.element(ui.item);
                    var subtreeRootElementID = item.attr('id');
                    $scope.rows.forEach(function(row, index){
                        if(row.branch.Id === subtreeRootElementID) {
                            if(index === 0){
                                safeApply($scope, function(){
                                    reportCtrl.getReport().moveTreeBranch('Presentation', subtreeRootElementID);
                                });
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
                                safeApply($scope, function(){
                                    reportCtrl.getReport().moveTreeBranch('Presentation', subtreeRootElementID, parent.branch.Id, siblingIdx - parentIdx);
                                });
                            }
                            //$scope.presentationTree = reportCtrl.getPresentationTree();
                            return false;
                        }
                    });
                }
            };
            
            /*
            $scope.$watch('conceptName', function(conceptName){
                if(conceptName !== undefined) {
                    $scope.toDrop = [conceptName];
                }
            });
            */

            $scope.select = function(row) {
                if(row.branch.To) {
                    row.branch.expanded = !row.branch.expanded;
                    $scope.rows = setRows(reportCtrl.getPresentationTree(), 1, true, []);
                } else {
                    $scope.selected = row.branch;
                }
            };

            $scope.remove = function(id){
                $rootScope.$emit('removeConceptFromPresentationTree', id);  
            };

            var setRows = function(tree, level, visible, rows){
                if(visible === false) {
                    return; 
                }
                if(tree === undefined) {
                    console.log(tree);
                }
                Object.keys(tree).sort(function(elem1, elem2){
                    elem1 = tree[elem1];
                    elem2 = tree[elem2];
                    var order1 = elem1.Order;
                    if(order1 === undefined || order1 === null){
                        order1 = 1;
                    } else if(typeof order1 !== 'number'){
                        order1 = parseInt(order1, 10);
                    }
                    var order2 = elem2.Order;
                    if(order2 === undefined || order2 === null){
                        order2 = 1;
                    } else if(typeof order2 !== 'number'){
                        order2 = parseInt(order2, 10);
                    }
                    if (order1 < order2){
                        return -1;
                    }
                    if (order1 > order2){
                        return 1;
                    }
                    return 0;
                }).forEach(function(leaf){
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

            $scope.$watch(function(){
                return reportCtrl.getPresentationTree();
            }, onChange, true);
        }   
    };
})
.directive('conceptMap', function($rootScope, ConceptMapTpl) {
    return {
        restrict: 'E',
        scope: {
            'conceptName': '@'
        },
        template: ConceptMapTpl,
        require: '^report',
        link: function($scope, element, attrs, reportCtrl) {
            $scope.concept = reportCtrl.getReport().getConcept($scope.conceptName);
            $scope.map = reportCtrl.getConceptMap()[$scope.conceptName] === undefined ? undefined : Object.keys(reportCtrl.getConceptMap()[$scope.conceptName].To);

            $scope.$watch(function(){
                return reportCtrl.getConcepts();
            }, function(concepts){
                $scope.concepts = [];
                concepts.forEach(function(concept){
                    $scope.concepts.push(concept.Name);
                });
            });

            $scope.removeConceptMap = function(){
                reportCtrl.getReport().removeConceptMap($scope.conceptName);
                $scope.map = undefined;
            };

            $scope.addConceptMap = function(){
                try {
                    reportCtrl.getReport().addConceptMap($scope.conceptName, []);
                    $scope.map = [];
                } catch(e) {
                    $rootScope.$emit('error', 500, e.message);
                }
            };

            $scope.addValue = function(value){
                if($scope.concepts.indexOf(value) !== -1) {
                    $scope.map.push(value);
                    reportCtrl.getReport().updateConceptMap($scope.concept.Name, $scope.map);
                }
            };

            $scope.removeValue = function(value){
                if($scope.map.indexOf(value) !== -1) {
                    $scope.map.splice($scope.map.indexOf(value), 1);
                    reportCtrl.getReport().updateConceptMap($scope.concept.Name, $scope.map);
                }
            };
            
            $scope.moveTo = function(value, index) {
                var parent = reportCtrl.getConceptMap()[$scope.conceptName];
                var child = parent.To[value]; 
                reportCtrl.getReport().moveTreeBranch('ConceptMap', child.Id, parent.Id, index);
            };
        }
    };
})
.directive('concept', function($rootScope, ConceptTpl){
    return {
        restrict: 'E',
        scope: {
            'conceptName': '@'
        },
        template: ConceptTpl,
        require: '^report',
        link: function($scope, element, attrs, reportCtrl) {
            
            $scope.concept = reportCtrl.getReport().getConcept($scope.conceptName);

            $scope.remove = function(){
                try {
                    reportCtrl.getReport().removeConcept($scope.concept.Name);
                } catch(e) {
                    console.log(e);
                    $rootScope.$emit('error', 500, e.message);
                }
            };

            $scope.edit = function(){
                reportCtrl.getReport().updateConcept($scope.concept.Name, $scope.concept.Label, $scope.concept.IsAbstract);
            };
        }
    };    
})
;