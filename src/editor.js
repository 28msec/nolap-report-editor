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
            
            this.getPresentationTree = function(){
                return this.getReport().getNetwork('Presentation').Trees;
            };

            this.getRules = function(ruleType, concept){
                var rules = [];
                var report = this.getReport();
                this.getReport().listRules();
                if(ruleType !== undefined && ruleType !== null){
                    if(rulesType === 'xbrl28:formula'){
                        rules = report.listFormulaRules(concept);
                    } else if(rulesType === 'xbrl28:validation'){
                        rules = report.listValidationRules(concept);
                    } else if(rulesType === 'xbrl28:excel'){
                        rules = report.listExcelRules(concept);
                    }
                } else {
                    rules = report.listRules(concept);
                }
                return rules;
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
.directive('presentationTree', function($rootScope, PresentationTreeTpl){
    return {
        restrict: 'E',
        template: PresentationTreeTpl,
        require: '^report',
        link: function($scope, element, attrs, reportCtrl) {
            $scope.presentationTree = reportCtrl.getPresentationTree();
            $scope.sortableOptions = {
                //placeholder: "sortable",
                //connectWith: ".sortable-container",
                receive: function(e, ui){
                    //var conceptName = angular.element(ui.item).attr('id');
                    angular.element(ui.item).attr('id');
                    //reportCtrl.getReport().addTreeChild();
                },
                stop: function(e, ui){
                    var item = angular.element(ui.item);
                    var subtreeRootElementID = item.attr('id');
                    $scope.rows.forEach(function(row, index){
                        if(row.branch.Id === subtreeRootElementID) {
                            if(index === 0){
                                $scope.$apply(function(){
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
                                $scope.$apply(function(){
                                    console.log(parent.branch.id);
                                    console.log('Offset: ' + (siblingIdx - parentIdx));
                                    reportCtrl.getReport().moveTreeBranch('Presentation', subtreeRootElementID, parent.branch.Id, siblingIdx - parentIdx);
                                });
                            }
                            //$scope.presentationTree = reportCtrl.getPresentationTree();
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
            
            $scope.remove = function(id){
                $rootScope.$emit('removeConceptFromPresentationTree', id);  
            };

            var setRows = function(tree, level, visible, rows){
                if(visible === false) {
                    return; 
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

            $scope.$watch('presentationTree', onChange, true);
        }   
    };
})
.directive('businessRules', function($rootScope, BusinessRulesTpl){
    return {
        restrict: 'E',
        template: BusinessRulesTpl,
        require: '^report',
        link: function($scope, element, attrs, reportCtrl) {

            var updateRules = function(rulesType, concept){
                if(rulesType === undefined || rulesType === null) {
                    updateRules('xbrl28:formula', concept);
                    updateRules('xbrl28:validation', concept);
                    updateRules('xbrl28:excel', concept);
                } else {
                    var rules = reportCtrl.getRules(rulesType, concept);
                    for(var i in rules){
                        var rule = rules[i];
                        if(rule.expanded === undefined || rule.expanded === null) {
                            rule.expanded = false;
                        }
                    }
                    if (rulesType === 'xbrl28:formula'){
                        $scope.formulaRules = rules;
                    } else if('xbrl28:validation') {
                        $scope.validationRules = rules;
                    }else if ('xbrl28:excel'){
                        $scope.excelRules = rules;
                    }
                }
            };
            updateRules();

            $scope.selectedConcept = null;
            $scope.selectConcept = function(concept) {
                $scope.selectedConcept = concept;
                updateRules(undefined, concept);
            };

            $scope.selectRule = function(row) {
                if(row.rule) {
                    row.rule.expanded = !row.rule.expanded;
                    updateRules(row.rule.Type);
                }
            };

            $scope.remove = function(id){
                $rootScope.$emit('removeRule', id);
            };

            //$scope.rows = [];
            var onChange = function(tree){
                updateRules(undefined, $scope.selectedConcept);
            };

            $scope.$watch('presentationTree', onChange, true);
        }
    };
})
;
