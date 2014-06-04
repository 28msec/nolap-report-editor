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

            this.getRules = function(ruleType, concept){
                var rules = [];
                var report = this.getReport();
                this.getReport().listRules();
                if(ruleType !== undefined && ruleType !== null){
                    if(ruleType === 'xbrl28:formula'){
                        rules = report.listFormulaRules(concept);
                    } else if(ruleType === 'xbrl28:validation'){
                        rules = report.listValidationRules(concept);
                    } else if(ruleType === 'xbrl28:excel'){
                        rules = report.listExcelRules(concept);
                    }
                } else {
                    rules = report.listRules(concept);
                }
                return rules;
            };

            this.getConceptMap = function(){
                return this.getReport().getNetwork('ConceptMap').Trees;
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
                placeholder: 'sortable',
                connectWith: '.sortable-container',
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
                //console.log(reportCtrl.getConceptMap()[$scope.conceptName].To[value].Id);
                //console.log(reportCtrl.getConceptMap()[$scope.conceptName].Id);
                reportCtrl.getReport().moveTreeBranch('Presentation', reportCtrl.getConceptMap()[$scope.conceptName].To[value].Id, reportCtrl.getConceptMap()[$scope.conceptName].Id, index);
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
.directive('businessRules', function($rootScope, BusinessRuleTpl){
    return {
        restrict: 'E',
        template: BusinessRuleTpl,
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
            var onChange = function(){
                updateRules(undefined, $scope.selectedConcept);
            };

            $scope.$watch('presentationTree', onChange, true);
        }
    };
})
;
angular.module('reports.api.28.io', [])
/**
 * <p>This API can be used to manage reports.</p> <p>This API is only accesible for users having granted priviliges to work with reports.</p> <p>Note, that the POST method can be simulated by using GET and adding the _method=POST parameter to the HTTP request.</p>
 */
.factory('ReportAPI', function($q, $http, $rootScope){
    /**
     * @class ReportAPI
     * @param {string} domain - The project domain
     */
    return function(domain) {
        if(typeof(domain) !== 'string') {
            throw new Error('Domain parameter must be specified as a string.');
        }

        var root = '';

        this.$on = function($scope, path, handler) {
            var url = domain + path;
            $scope.$on(url, function(event, data){
                handler(data);
            });
            return this;
        };

        this.$broadcast = function(path, data){
            var url = domain + path;
            $rootScope.$broadcast(url, data);
            return this;
        };

        /**
         * 
         * @method
         * @name ReportAPI#listReports
         * @param {string} _id - A report id (e.g. FundamentalAccountingConcepts),
         * @param {string} token - The token of the current session,
         * 
         */
        this.listReports = function(parameters){
            var deferred = $q.defer();
            var that = this;
            var path = '/reports.jq'
            var url = domain + path;
            var params = {};
            params['_id'] = parameters['_id'];
            params['token'] = parameters['token'];
            var body = null;
            var method = 'GET'.toUpperCase();
            if (parameters.$method)
            {
                params['_method'] = parameters.$method;
                method = 'GET';
            }
            var cached = parameters.$cache && parameters.$cache.get(url);
            if(method === 'GET' && cached !== undefined && parameters.$refresh !== true) {
                deferred.resolve(cached);
            } else {
            $http({
                method: method,
                url: url,
                params: params,
                cache: (parameters.$refresh !== true)
            })
            .success(function(data, status, headers, config){
                deferred.resolve(data);
                //that.$broadcast(url);
                if(parameters.$cache !== undefined) parameters.$cache.put(url, data, parameters.$cacheItemOpts ?
parameters.$cacheItemOpts : {});
            })
            .error(function(data, status, headers, config){
                deferred.reject({data: data, status: status, headers: headers, config: config});
                //cache.removeAll();
            })
            ;
            }
            return deferred.promise;
        };

        /**
         * 
         * @method
         * @name ReportAPI#addOrReplaceOrValidateReport
         * @param {object} report - A JSON object containing the report,
         * @param {boolean} validation-only - This parameter is either given without any value (means: on) or absent (means: off) or its value is castable to a boolean. Turns validation-only mode on or off.,
         * @param {string} token - The token of the current session,
         * 
         */
        this.addOrReplaceOrValidateReport = function(parameters){
            var deferred = $q.defer();
            var that = this;
            var path = '/add-report.jq'
            var url = domain + path;
            var params = {};
            params['validation-only'] = parameters['validationOnly'];
            params['token'] = parameters['token'];
            var body = parameters['report'];
            var method = 'POST'.toUpperCase();
            if (parameters.$method)
            {
                params['_method'] = parameters.$method;
                method = 'POST';
            }
            var cached = parameters.$cache && parameters.$cache.get(url);
            if(method === 'GET' && cached !== undefined && parameters.$refresh !== true) {
                deferred.resolve(cached);
            } else {
            $http({
                method: method,
                url: url,
                params: params,
data: body,
                cache: (parameters.$refresh !== true)
            })
            .success(function(data, status, headers, config){
                deferred.resolve(data);
                //cache.removeAll();
            })
            .error(function(data, status, headers, config){
                deferred.reject({data: data, status: status, headers: headers, config: config});
                //cache.removeAll();
            })
            ;
            }
            return deferred.promise;
        };

        /**
         * 
         * @method
         * @name ReportAPI#removeReport
         * @param {string} _id - A report id (e.g. FundamentalAccountingConcepts),
         * @param {string} token - The token of the current session,
         * 
         */
        this.removeReport = function(parameters){
            var deferred = $q.defer();
            var that = this;
            var path = '/delete-report.jq'
            var url = domain + path;
            var params = {};
            if(parameters['_id'] === undefined) {
                deferred.reject(new Error('The _id parameter is required'));
                return deferred.promise;
            } else {
                params['_id'] = parameters['_id'];
            }
            params['token'] = parameters['token'];
            var body = null;
            var method = 'POST'.toUpperCase();
            if (parameters.$method)
            {
                params['_method'] = parameters.$method;
                method = 'GET';
            }
            var cached = parameters.$cache && parameters.$cache.get(url);
            if(method === 'GET' && cached !== undefined && parameters.$refresh !== true) {
                deferred.resolve(cached);
            } else {
            $http({
                method: method,
                url: url,
                params: params,
                cache: (parameters.$refresh !== true)
            })
            .success(function(data, status, headers, config){
                deferred.resolve(data);
                //cache.removeAll();
            })
            .error(function(data, status, headers, config){
                deferred.reject({data: data, status: status, headers: headers, config: config});
                //cache.removeAll();
            })
            ;
            }
            return deferred.promise;
        };
    };
});angular.module("nolapReportEditor")

.constant("PresentationTreeTpl", "<div ng-if=\"!conceptName\">\r\n    <p>No concept is selected. You can pick one on the left end side or create a new concept.</p>\r\n    <button ng-click=\"newConcept()\" class=\"btn btn-primary\"><i class=\"fa fa-plus\"></i> Concept</button>\r\n</div>\r\n<div ng-if=\"conceptName\">\r\n    <p>Drag and drop the concept in the presentation tree.</p>\r\n    <ul class=\"list-group sortable-container\" ui-sortable=\"sortableOptions\" ng-model=\"conceptName\">\r\n        <li class=\"list-group-item sortable\" ng-bind=\"conceptName\"></li>\r\n    </ul>\r\n</div>\r\n<ul class=\"nav nav-list nav-pills nav-stacked abn-tree sortable-container\" ui-sortable=\"sortableOptions\" ng-model=\"rows\">\r\n    <li ng-repeat=\"row in rows\"  ng-class=\"'level-' + {{ row.level }} + (selected.Id === row.branch.Id ? ' active':'')\" class=\"abn-tree-row sortable\" id=\"{{row.branch.Id}}\">\r\n        <a ng-click=\"select(row)\">\r\n            <i ng-class=\"{ 'fa-caret-right': !row.branch.expanded && row.branch.To, 'fa-caret-down': row.branch.expanded && row.branch.To }\" class=\"indented tree-icon fa\"></i>\r\n            <span class=\"indented tree-label\">{{row.branch.Label}} ({{row.branch.Name}})</span>\r\n            <span class=\"remove-concept indented fa fa-times\" ng-click=\"remove(row.branch.Id)\"></span>\r\n        </a>\r\n    </li>\r\n</ul>")

.constant("ConceptMapTpl", "<div ng-if=\"map === undefined\">\r\n    <h3 ng-bind=\"concept.Name\"></h3>\r\n    <div ng-if=\"concept.IsAbstract !== true\">\r\n        <p>There is no concept map associated to <i ng-bind=\"conceptName\"></i>.</p>\r\n        <button ng-click=\"addConceptMap()\" class=\"btn btn-primary\">Add concept Map</button>\r\n    </div>\r\n    <div ng-if=\"concept.IsAbstract === true\">\r\n        <p>This concept is abstract.</p>\r\n    </div>\r\n</div>\r\n<div ng-if=\"map !== undefined\">\r\n    <button class=\"pull-right btn btn-default\"><i class=\"fa fa-times\" ng-click=\"removeConceptMap()\"></i></button>\r\n    <h3 ng-bind=\"concept.Name\"></h3>\r\n    <p ng-bind=\"concept.Label\"></p>\r\n    <ul class=\"list-group\">\r\n        <li class=\"list-group-item clearfix\" ng-repeat=\"key in map\">\r\n            <span ng-bind=\"key\"></span>\r\n            <div class=\"btn-group pull-right\">\r\n                <button class=\"btn btn-default\" type=\"button\" ng-click=\"moveTo(key, $index - 1)\" ng-if=\"$last === false\"><i class=\"fa fa-long-arrow-down\"></i></button>\r\n                <button class=\"btn btn-default\" type=\"button\" ng-click=\"moveTo(key, $index + 1)\" ng-if=\"$first === false\"><i class=\"fa fa-long-arrow-up\"></i></button>\r\n                <button class=\"btn btn-default\" type=\"button\" ng-click=\"removeValue(key)\"><i class=\"fa fa-times\"></i></button>\r\n            </div>\r\n            <!--a class=\"pull-right\" ng-click=\"removeValue(key, $index - 1)\" ng-if=\"$last === false\"><i class=\"fa fa-long-arrow-down\"></i></a>\r\n            <a class=\"pull-right\" ng-click=\"moveValueUp(key, $index + 1)\" ng-if=\"$first === false\"><i class=\"fa fa-long-arrow-up\"></i></a>\r\n            <a class=\"pull-right\" ng-click=\"removeValue(key)\"><i class=\"fa fa-times\"></i></a-->\r\n        </li>\r\n    </ul>\r\n    <form class=\"form-inline\" role=\"form\" ng-submit=\"addValue(newConceptValue)\" ui-keypress=\"{ 13:'addValue(newConceptValue)' }\">\r\n        <div class=\"form-group\">\r\n            <div class=\"row\">\r\n                <div class=\"col-lg-6\">\r\n                    <div class=\"input-group\">\r\n                        <input type=\"text\" class=\"form-control\" id=\"conceptValue\" placeholder=\"Concept Name\" ng-model=\"newConceptValue\" typeahead=\"concept for concept in concepts | filter:$viewValue | limitTo:8\">\r\n                        <span class=\"input-group-btn\">\r\n                            <button type=\"submit\" class=\"btn btn-primary\">Add</button>\r\n                        </span>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </form>\r\n</div>\r\n<!--ul class=\"list-group\">\r\n  <li class=\"list-group-item\" ng-repeat=\"(key, value) in map\">\r\n    <a class=\"pull-right\"><i class=\"fa fa-times\" ng-click=\"removeKey(key)\"></i></a>\r\n    <h3 ng-bind=\"value.Name\"></h3>\r\n    <p ng-bind=\"value.Label\"></p>\r\n    <ul class=\"list-group\">\r\n        <li class=\"list-group-item\" ng-repeat=\"(subkey, subvalue) in value.To\">\r\n            <span ng-bind=\"subkey\"></span>\r\n            <a class=\"pull-right\" ng-click=\"removeValue(key, value, subkey)\"><i class=\"fa fa-times\"></i></a>\r\n        </li>\r\n    </ul>\r\n    <form class=\"form-inline\" role=\"form\" ng-submit=\"addValueToConceptMap(key, value.To, newConceptValue)\" ui-keypress=\"{ 13:'addValueToConceptMap(key, value.To, newConceptValue)' }\">\r\n        <div class=\"form-group\">\r\n            <input type=\"text\" class=\"form-control\" id=\"conceptValue\" placeholder=\"Concept Name\" ng-model=\"newConceptValue\" typeahead=\"concept for concept in concepts | filter:$viewValue | limitTo:8\">\r\n        </div>\r\n        <button type=\"submit\" class=\"btn btn-primary\">Add</button>\r\n    </form>\r\n  </li>\r\n</ul-->")

.constant("BusinessRuleTpl", "<form class=\"form-inline\" role=\"form\" ng-submit=\"addConceptMap()\">\r\n    <div class=\"form-group\">\r\n        <input type=\"text\" class=\"form-control\" id=\"conceptName\" placeholder=\"Concept Name\" ng-model=\"newConceptName\" typeahead=\"concept for concept in concepts | filter:$viewValue | limitTo:8\">\r\n    </div>\r\n    <button type=\"submit\" class=\"btn btn-primary\">Add</button>\r\n</form>\r\n<ul class=\"list-group\">\r\n    <li class=\"list-group-item\" ng-repeat=\"(key, value) in map\">\r\n        <a class=\"pull-right\"><i class=\"fa fa-times\" ng-click=\"removeKey(key)\"></i></a>\r\n        <h3 ng-bind=\"value.Name\"></h3>\r\n        <p ng-bind=\"value.Label\"></p>\r\n        <ul class=\"list-group\">\r\n            <li class=\"list-group-item\" ng-repeat=\"(subkey, subvalue) in value.To\">\r\n                <span ng-bind=\"subkey\"></span>\r\n                <a class=\"pull-right\" ng-click=\"removeValue(key, value, subkey)\"><i class=\"fa fa-times\"></i></a>\r\n            </li>\r\n        </ul>\r\n        <form class=\"form-inline\" role=\"form\" ng-submit=\"addValueToConceptMap(key, value.To, newConceptValue)\" ui-keypress=\"{ 13:'addValueToConceptMap(key, value.To, newConceptValue)' }\">\r\n            <div class=\"form-group\">\r\n                <input type=\"text\" class=\"form-control\" id=\"conceptValue\" placeholder=\"Concept Name\" ng-model=\"newConceptValue\" typeahead=\"concept for concept in concepts | filter:$viewValue | limitTo:8\">\r\n            </div>\r\n            <button type=\"submit\" class=\"btn btn-primary\">Add</button>\r\n        </form>\r\n    </li>\r\n</ul>")

.constant("RulesEditorTpl", "<div class=\"container\">\r\n    <h1>Rule Editor</h1>\r\n    <h2>Arithmetic computation of new Facts</h2>\r\n    <form class=\"form-horizontal\" role=\"form\">\r\n        <div class=\"form-group\">\r\n            <label for=\"ruleID\" class=\"col-sm-{{colspan1}} control-label\">ID</label>\r\n            <div class=\"col-sm-{{12 - colspan1}}\">\r\n                <input type=\"text\" id=\"ruleID\" class=\"form-control\" ng-model=\"formula.model.Id\" ng-pattern=\"/^.+$/\">\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <label for=\"ruleLabel\" class=\"col-sm-{{colspan1}} control-label\">Label</label>\r\n            <div class=\"col-sm-{{12 - colspan1}}\">\r\n                <input type=\"text\" id=\"ruleLabel\" class=\"form-control\" ng-model=\"formula.model.Label\">\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <label for=\"ruleDescription\" class=\"col-sm-{{colspan1}} control-label\">Description</label>\r\n            <div class=\"col-sm-{{12 - colspan1}}\">\r\n                <textarea class=\"form-control\" id=\"ruleDescription\" rows=\"3\" placeholder=\"\" ng-model=\"formula.model.Description\"></textarea>\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\" ng-repeat=\"concept in formula.model.ComputableConcepts track by $index\">\r\n            <label for=\"compFact{{$index}}\" class=\"col-sm-{{colspan1}} control-label\">Computable Fact {{ $index +1 }}</label>\r\n            <div class=\"col-sm-{{12 - colspan1}}\">\r\n                <input type=\"text\" id=\"compFact{{$index}}\" class=\"form-control\" ng-model=\"formula.model.ComputableConcepts[$index]\">\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\" ng-repeat=\"concept in formula.model.DependsOn track by $index\">\r\n            <label for=\"dep{{$index}}\" class=\"col-sm-{{colspan1}} control-label\">Dependency {{ $index +1 }}</label>\r\n            <div class=\"col-sm-{{12 - colspan1}}\">\r\n                <input type=\"text\" id=\"dep{{$index}}\" readonly=\"readonly\" class=\"form-control\" ng-model=\"concept\">\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <label for=\"coverAspects\" class=\"col-sm-{{colspan1}} control-label\">Cover Aspects</label>\r\n            <div class=\"col-sm-{{12 - colspan1}}\">\r\n                <input type=\"checkbox\" id=\"coverAspects\" ng-model=\"formula.model.AllowCrossPeriodType\">  Allow facts to be computable across different period type (e.g. allow to add an instant fact to a duration fact)\r\n            </div>\r\n            <div class=\"col-sm-{{12 - colspan1}}\">\r\n                <input type=\"checkbox\" ng-model=\"formula.model.AllowCrossBalance\">  Allow facts to be computable across different balance types (e.g. allow to compare credit facts with debit facts)\r\n            </div>\r\n        </div>\r\n\r\n        <tabset ng-if=\"formula.model.Type === 'xbrl28:arithmetic' || formula.model.Type === 'xbrl28:excel'\">\r\n            <tab ng-repeat=\"alt in formula.model.Formulae track by $index\" heading=\"Alternative {{$index +1}}\" >\r\n                <div style=\"border-width: 0 1px 1px 1px;border-color: #ddd;border-radius: 4px 4px 0 0;padding-top: 15px;\">\r\n                    <div class=\"form-group\">\r\n                        <label for=\"sourceFact{{$index}}\" class=\"col-sm-{{colspan1}} control-label\">Mandatory Source Fact</label>\r\n                        <div class=\"col-sm-{{12 - colspan1}}\">\r\n                            <input type=\"text\" id=\"sourceFact{{$index}}\" class=\"form-control\" ng-model=\"alt.SourceFact[0]\" ng-pattern=\"/^.+$/\">\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"form-group\">\r\n                        <label for=\"precondition{{$index}}\" class=\"col-sm-{{colspan1}} control-label\">Precondition</label>\r\n                        <div class=\"col-sm-{{12 - colspan1}}\">\r\n                            <textarea class=\"form-control\" id=\"precondition{{$index}}\" rows=\"1\" placeholder=\"\" ng-change=\"formula.compilePrereq($index)\" ng-model=\"alt.PrereqSrc\"></textarea>\r\n                        </div>\r\n                        <div class=\"container alert alert-danger col-sm-offset-{{colspan1}} col-sm-{{12 - colspan1}}\" ng-show=\"alt.PrereqErr\" style=\"margin-top: 20px;\">{{alt.PrereqErr}}</div>\r\n                    </div>\r\n                    <div class=\"form-group\">\r\n                        <label for=\"rule{{$index}}\" class=\"col-sm-{{colspan1}} control-label\">Arithmetic Rule</label>\r\n                        <div  class=\"col-sm-{{12 - colspan1}}\">\r\n                            <textarea class=\"form-control\" id=\"rule{{$index}}\" rows=\"6\" placeholder=\"\" ng-change=\"formula.compileBody($index)\" ng-model=\"alt.BodySrc\"></textarea>\r\n                        </div>\r\n                        <div class=\"container alert alert-danger col-sm-offset-{{colspan1}} col-sm-{{12 - colspan1}}\" ng-show=\"alt.BodyErr\" style=\"margin-top: 20px;\">{{alt.BodyErr}}</div>\r\n                    </div>\r\n                </div>\r\n            </tab>\r\n        </tabset>\r\n\r\n        <div ng-if=\"formula.model.Type === 'xbrl28:formula'\">\r\n            <div class=\"form-group\">\r\n                <label for=\"sourceFact\" class=\"col-sm-{{colspan1}} control-label\">Mandatory Source Fact</label>\r\n                <div class=\"col-sm-{{12 - colspan1}}\">\r\n                    <input type=\"text\" id=\"sourceFact\" class=\"form-control\" ng-model=\"formula.model.SourceFact[0]\" ng-pattern=\"/^.+$/\">\r\n                </div>\r\n            </div>\r\n            <div class=\"form-group\">\r\n                <label for=\"rule\" class=\"col-sm-{{colspan1}} control-label\">Advanced Rule</label>\r\n                <div  class=\"col-sm-{{12 - colspan1}}\">\r\n                    <textarea class=\"form-control\" id=\"rule\" rows=\"20\" placeholder=\"\" ng-change=\"formula.compile()\" ng-model=\"formula.model.Formula\"></textarea>\r\n                </div>\r\n                <div class=\"container alert alert-danger col-sm-offset-{{colspan1}} col-sm-{{12 - colspan1}}\" ng-show=\"formula.model.FormulaErr\" style=\"margin-top: 20px;\">{{formula.model.FormulaErr}}</div>\r\n            </div>\r\n        </div>\r\n\r\n        <pre class=\"container\" ng-bind=\"formula.view\" ng-if=\"false\" style=\"margin-top: 20px;\"></pre>\r\n        <button type=\"submit\" id=\"send\" ng-click=\"formula.updateView();\" class=\"btn btn-default\">Submit</button>\r\n    </form>\r\n</div>")

.constant("ConceptTpl", "<form name=\"newConceptForm\" ng-submit=\"ok\" role=\"form\" spellcheck=\"false\" novalidate>\r\n    <div class=\"modal-header\">\r\n    <button class=\"pull-right btn btn-default\"><i class=\"fa fa-times\" ng-click=\"remove()\"></i></button>\r\n        <h3 class=\"modal-title\" ng-bind=\"concept.Name\"></h3>\r\n    </div>\r\n    <div class=\"modal-body\">\r\n        <div class=\"form-group\">\r\n            <label for=\"label\">Label</label>\r\n           <input type=\"text\" class=\"form-control\" id=\"label\" ng-model=\"concept.Label\" placeholder=\"Label\" required>\r\n        </div>\r\n        <div class=\"checkbox\">\r\n            <label>\r\n                <input type=\"checkbox\" ng-model=\"concept.IsAbstract\"> Abstract\r\n            </label>\r\n        </div>\r\n    </div>\r\n</form>")

;'use strict';

angular.module('formulaEditor',['excelParser', 'formulaParser'])
.factory('Formula', ['$q', '$log', 'ExcelParser', 'FormulaParser', function($q, $log, ExcelParser, FormulaParser){

    var ensureParameter = function(paramValue, paramName, paramType, functionName, regex, regexErrorMessage) {
        if(paramValue === null || paramValue === undefined) {
            throw new Error(functionName + ': function called without mandatory "' + paramName + '" parameter.');
        }
        if(typeof paramValue !== paramType) {
            throw new Error(functionName + ': function called with mandatory "' + paramName + '" parameter which is of wrong type "' + typeof paramValue + '" (should be of type "' + paramType + '" instead).');
        }
        if(regex !== undefined && paramValue.match(regex) === null) {
            throw new Error(functionName + ': ' + regexErrorMessage);
        }
    };

    //Constructor
    var Formula = function(type){
        ensureParameter(type, 'type', 'string', 'Formula (Const.)');
        this.parser = null;
        this.model = {
            'Id': '',
            'Type': type,
            'Label': '',
            'Description': '',
            'ComputableConcepts': [],
            'DependsOn': [],
            'AllowCrossPeriod': false,
            'Formulae': [
                {
                    'PrereqSrc': '',
                    'Prereq': {},
                    'SourceFact': [],
                    'BodySrc': '',
                    'Body': {}
                }
            ]
        };
    };

    Formula.prototype.getParser = function() {
        if(this.parser === undefined || this.parser === null ) {
            if(this.model.Type === 'xbrl28:arithmetic') {
                this.parser = new FormulaParser();
                this.parserType = 'FormulaParser';
            }
            if(this.model.Type === 'xbrl28:excel') {
                this.parser = new ExcelParser();
                this.parserType = 'ExcelParser';
            }
        }
        return this.parser;
    };

    Formula.prototype.updateView = function() {
        this.view = JSON.stringify(this.model, null, ' ');
    };


    Formula.prototype.compileDeferred = function() {
        var deferred = $q.defer();

        $log.log('starting compilation');
        if(this.model.Formulae !== undefined && this.model.Formulae !== null) {
            for (var i = 0; i < this.model.Formulae.length; ++i) {
                this.compilePrereq(i);
                this.compileBody(i);
            }
        }

        return deferred.promise;
    };

    Formula.prototype.compile = function() {
        this.compileDeferred().then(
            function(){
                $log.log('compilation finished');
            }
        );
    };

    Formula.prototype.compileBodyDeferred = function(index) {
        ensureParameter(index, 'index', 'number', 'compileBodyDeferred');
        var deferred = $q.defer();
        var parser = this.getParser();
        var altComp = this.model.Formulae[index];
        var body;
        try{
            body = parser.parse(altComp.BodySrc);
            deferred.resolve(body);
        }
        catch(e) {
            var errMsg = this.parserType + ' ' + e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
            deferred.reject(errMsg);
        }
        return deferred.promise;
    };

    Formula.prototype.compileBody = function(index) {
        ensureParameter(index, 'index', 'number', 'compileBody');
        var that = this;
        this.compileBodyDeferred(index).then(
            function(body){
                var altComp = that.model.Formulae[index];
                altComp.Body = body;
                if(altComp.BodyErr !== undefined){
                    delete altComp.BodyErr;
                }
                $log.log(that.parserType + ' Body ok');
                that.model.Formulae[index] = altComp;
            },
            function(errMsg){
                var altComp = that.model.Formulae[index];
                altComp.BodyErr = errMsg;
                altComp.Body = {};
                $log.log(errMsg);
                that.model.Formulae[index] = altComp;
            }
        );
    };

    Formula.prototype.compilePrereqDeferred = function(index) {
        ensureParameter(index, 'index', 'number', 'compilePrereqDeferred');
        var deferred = $q.defer();
        var parser = this.getParser();
        var altComp = this.model.Formulae[index];
        var prereq;
        try{
            prereq = parser.parse(altComp.PrereqSrc);
            deferred.resolve(prereq);
        }
        catch(e) {
            var errMsg = this.parserType + ' ' + e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
            deferred.reject(errMsg);
        }
        return deferred.promise;
    };

    Formula.prototype.compilePrereq = function(index) {
        ensureParameter(index, 'index', 'number', 'compilePrereq');
        var that = this;
        this.compilePrereqDeferred(index).then(
            function(prereq){
                var altComp = that.model.Formulae[index];
                altComp.Prereq = prereq;
                if(altComp.PrereqErr !== undefined){
                    delete altComp.PrereqErr;
                }
                $log.log(that.parserType + ' Prereq ok');
                that.model.Formulae[index] = altComp;
            },
            function(errMsg){
                var altComp = that.model.Formulae[index];
                altComp.PrereqErr = errMsg;
                altComp.Prereq = {};
                $log.log(errMsg);
                that.model.Formulae[index] = altComp;
            }
        );
    };

    Formula.prototype.getModel = function () {
        return this.model;
    };

    Formula.prototype.setModel = function (model) {
        ensureParameter(model, 'model', 'object', 'setModel');
        this.model = model;
        this.parser = null;
        this.compile();
    };

    Formula.prototype.Id = function() {
        return this.model.Id;
    };
    return Formula;
}]);


'use strict';

angular
.module('nolapReportEditor')
.factory('Report', function(){

    //Constructor
    var Report = function(modelOrName, label, description, role){
        if ( modelOrName === null) {
            throw new Error('new Report creation with null');
        } else if (typeof modelOrName !== 'object' &&
                   typeof modelOrName !== 'string') {
            throw new Error('new Report creation with invalid type ' + typeof modelOrName);
        } else if (typeof modelOrName === 'object') {
            this.model = modelOrName;
        } else if (typeof modelOrName === 'string'){
            this.model =
                {
                    '_id' : modelOrName,
                    'Archive' : null,
                    'Label' : label,
                    'Description': description,
                    'Role' : role,
                    'Networks' : [
                        {
                            'LinkName' : 'link:presentationLink',
                            'LinkRole' : role,
                            'ArcName' : 'link:presentationArc',
                            'ArcRole' : 'http://www.xbrl.org/2003/arcrole/parent-child',
                            'Kind' : 'InterConceptTreeNetwork',
                            'ShortName' : 'Presentation',
                            'CyclesAllowed' : 'undirected',
                            'Trees' : {}
                        }, {
                            'LinkName' : 'link:definitionLink',
                            'LinkRole' : role,
                            'ArcName' : 'link:definitionArc',
                            'ArcRole' : 'http://www.xbrlsite.com/2013/fro/arcrole/class-subClass',
                            'Kind' : 'InterConceptTreeNetwork',
                            'ShortName' : 'ConceptMap',
                            'CyclesAllowed' : 'undirected',
                            'Trees' : {}
                        }
                    ],
                    'Hypercubes' : {
                        'xbrl:DefaultHypercube' : {
                            'Name' : 'xbrl:DefaultHypercube',
                            'Label' : 'XBRL Implicit non-dimensional Hypercube',
                            'Aspects' : {
                                'xbrl:Concept' : {
                                    'Name' : 'xbrl:Concept',
                                    'Label' : 'Implicit XBRL Concept Dimension',
                                    'Domains' : {
                                        'xbrl:ConceptDomain' : {
                                            'Name' : 'xbrl:ConceptDomain',
                                            'Label' : 'Implicit XBRL Concept Domain',
                                            'Members' : {}
                                        }
                                    }
                                },
                                'xbrl:Period' : {
                                    'Name' : 'xbrl:Period',
                                    'Label' : 'Implicit XBRL Period Dimension'
                                },
                                'xbrl:Entity' : {
                                    'Name' : 'xbrl:Entity',
                                    'Label' : 'Implicit XBRL Entity Dimension'
                                }
                            }
                        }
                    },
                    'Rules' : []
                };
        } // if
    };

    var ConceptIsStillReferencedError = function(message, referencesInConceptMapsArray, referencesInPresentationArray, referencesInRulesArray) {
        this.name = 'ConceptIsStillReferencedError';
        this.message = (message || '');
        this.references = {
            'Presentation': referencesInPresentationArray,
            'ConceptMaps' : referencesInConceptMapsArray,
            'Rules': referencesInRulesArray
        };
    };
    ConceptIsStillReferencedError.prototype = new Error();

    // helper function to check parameters
    var ensureNetworkShortName = function(networkShortName, paramName, functionName) {
        ensureParameter(networkShortName, paramName, 'string', functionName, /^(Presentation)|(ConceptMap)$/g,
            'invalid networkShortName parameter value passed "' + networkShortName + '" (allowed values: Presentation, ConceptMap).');
    };

    var ensureConceptName = function(conceptName, paramName, functionName) {
        ensureParameter(conceptName, paramName, 'string', functionName, /^\w(\w|\d|[-_])*:(\w|\d|[-_])*$/g,
            'function called with mandatory "' + paramName + '" parameter which is not a QName: ' + conceptName);
    };
    
    var ensureRuleType = function(ruleType, paramName, functionName) {
        ensureParameter(ruleType, paramName, 'string', functionName, /^(xbrl28:validation)|(xbrl28:formula)$/g,
            'rule type "' + ruleType + '" is not a valid type (allowed types: xbrl28:validation, xbrl28:formula)');
    };

    var ensureParameter = function(paramValue, paramName, paramType, functionName, regex, regexErrorMessage) {
        if(paramValue === null || paramValue === undefined) {
            throw new Error(functionName + ': function called without mandatory "' + paramName + '" parameter.');
        }
        if(typeof paramValue !== paramType) {
            throw new Error(functionName + ': function called with mandatory "' + paramName + '" parameter which is of wrong type "' + typeof paramValue + '" (should be of type "' + paramType + '" instead).');
        }
        if(regex !== undefined && paramValue.match(regex) === null) {
            throw new Error(functionName + ': ' + regexErrorMessage);
        }
    };

    var ensureExists = function(value, valueType, functionName, errorMessage) {
        if(value === null || value === undefined) {
            throw new Error(functionName + ': ' + errorMessage);
        }
        if(typeof value !== valueType) {
            throw new Error(functionName + ': Type exception: Expected type "' + valueType + '"');
        }
    };

    // helper to create a unique id
    var uuid = function () {
        // thanks to https://gist.github.com/ae6rt/7894539
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = '0123456789abcdef';
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
        /* jslint bitwise: true */
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        /* jslint bitwise: false */
        s[8] = s[13] = s[18] = s[23] = '-';
        return s.join('');
    };

    Report.prototype.getModel = function(){
        return this.model;
    };

    /**********************
     ** Concepts API
     **********************/
    Report.prototype.addConcept = function(name, label, abstract) {
        ensureConceptName(name, 'name', 'addConcept');
        ensureParameter(label, 'label', 'string', 'addConcept');
        ensureParameter(abstract, 'abstract', 'boolean', 'addConcept');
        
        if(this.existsConcept(name)) {
            throw new Error('addConcept: concept with name "' + name + '" already exists.');
        }

        var model = this.getModel();
        var concept =
            {
                'Name': name,
                'Label': label,
                'IsAbstract': abstract
                /* still to be implemented:
                'IsNillable': false,
                'PeriodType': duration,
                'SubstitutionGroup': 'xbrl:item',
                'DataType' : 'nonnum:textBlockItemType', 
                'BaseType' : 'xs:string', 
                'ClosestSchemaBuiltinType' : 'xs:string', 
                'IsTextBlock' : true
                */
            };
        model.Hypercubes['xbrl:DefaultHypercube']
            .Aspects['xbrl:Concept']
            .Domains['xbrl:ConceptDomain']
            .Members[name] = concept;
    };

    Report.prototype.updateConcept = function(name, label, abstract) {
        ensureConceptName(name, 'name', 'updateConcept');
        ensureParameter(label, 'label', 'string', 'updateConcept');
        abstract = abstract === true;

        if(!this.existsConcept(name)) {
            throw new Error('updateConcept: cannot update concept with name "' + name + '" because it doesn\'t exist.');
        }
       
        var concept = this.getConcept(name);
        concept.Label = label;
        concept.IsAbstract = abstract;
    };

    Report.prototype.removeConcept = function(name) {
        ensureConceptName(name, 'name', 'removeConcept');

        if(!this.existsConcept(name)){
            throw new Error('removeConcept: cannot remove concept with name "' + name + '" from model because it doesn\'t exist.');
        }

        var referencesInConceptMapsArray = this.findInConceptMap(name);
        var referencesInPresentationArray = this.findInTree('Presentation', name);
        var referencesInRulesArray = this.findInRules(name);
        if(referencesInConceptMapsArray.length > 0 || referencesInPresentationArray.length > 0 || referencesInRulesArray.length > 0){
            throw new ConceptIsStillReferencedError('removeConcept: cannot remove concept with name "' + name + '" from model because it is still referenced in the report.', referencesInConceptMapsArray, referencesInPresentationArray, referencesInRulesArray);
        }

        var model = this.getModel();
        delete model.Hypercubes['xbrl:DefaultHypercube']
            .Aspects['xbrl:Concept']
            .Domains['xbrl:ConceptDomain']
            .Members[name];
    };

    Report.prototype.existsConcept = function(conceptName) {
        ensureConceptName(conceptName, 'conceptName', 'existsConcept');

        var concept = this.getConcept(conceptName);
        if(concept !== null && typeof concept === 'object') {
            return true;
        }
        return false;
    };

    Report.prototype.getConcept = function(conceptName) {
        ensureConceptName(conceptName, 'conceptName', 'getConcept');

        var model = this.getModel();
        if(model === null || model === undefined) {
            return null;
        }

        var concept =
          model.Hypercubes['xbrl:DefaultHypercube']
              .Aspects['xbrl:Concept']
              .Domains['xbrl:ConceptDomain']
              .Members[conceptName];

        if(concept === null || concept === undefined) {
            return null;
        }
        return concept;
    };

    Report.prototype.listConcepts = function() {

        var result = [];
        var model = this.getModel();
        if(model === null || model === undefined) {
            return result;
        }

        var members =
            model.Hypercubes['xbrl:DefaultHypercube']
                .Aspects['xbrl:Concept']
                .Domains['xbrl:ConceptDomain']
                .Members;
        if(members === null || members === undefined) {
            return result;
        }

        for(var conceptname in members) {
            var concept = members[conceptname];
            result.push(concept);
        }
        return result;
    };

    /**********************
     ** Trees API
     **********************/
    Report.prototype.getNetwork = function(networkShortName) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'getNetwork');
        
        var model = this.getModel();
        if(model === null || model === undefined) {
            return null;
        }

        var networks = model.Networks;
        if(networks === null || networks === undefined) {
            return null;
        }

        for(var i in networks) {
            var network = networks[i];
            if(networks.hasOwnProperty(i) &&
                network.ShortName === networkShortName){
                return network;
            }
        }
    };

    Report.prototype.listTrees = function(networkShortName) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'listTrees');
        
        var result = [];
        var network = this.getNetwork(networkShortName);
        if(network === null || network === undefined) {
            return result;
        }

        for(var treeroot in network.Trees) {
            var tree = network.Trees[treeroot];
            result.push(tree);
        }
        return result;
    };

    Report.prototype.findInSubTree = function(conceptName, subtree) {
        var result = [];
        if(subtree.Name === conceptName){
            result.push(subtree.Id);
        }
        var children = subtree.To;
        for(var child in children){
            if(children.hasOwnProperty(child)) {
                var childresult = this.findInSubTree(conceptName, children[child]);
                Array.prototype.push.apply(result, childresult);
            }
        }
        return result;
    };
    
    Report.prototype.findInTree = function(networkShortName, conceptName) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'findInTree');
        
        var network = this.getNetwork(networkShortName);
        var result = [];
        var children = network.Trees;
        for(var child in children){
            if(children.hasOwnProperty(child)) {
                var childresult = this.findInSubTree(conceptName, children[child]);
                Array.prototype.push.apply(result, childresult);
            }
        }
        return result;
    };

    var getElementByIdFromSubTree = function(elementID, subtree) {
        if(subtree.Id === elementID){
            return subtree;
        }
        var children = subtree.To;
        for(var child in children){
            if(children.hasOwnProperty(child)) {
                var childresult = getElementByIdFromSubTree(elementID, children[child]);
                if(childresult !== null) {
                    return childresult;
                }
            }
        }
        return null;
    };

    Report.prototype.getElementFromTree = function(networkShortName, elementID) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'getElementFromTree');
        ensureParameter(elementID, 'elementID', 'string', 'getElementFromTree');
        
        var network = this.getNetwork(networkShortName);
        var element = null;
        var children = network.Trees;
        for(var child in children){
            if(children.hasOwnProperty(child)) {
                var childresult = getElementByIdFromSubTree(elementID, children[child]);
                if(childresult !== null) {
                    element = childresult;
                }
            }
        }
        return element;
    };

    var enforceStrictChildOrderAndShift = function(report, networkShortName, parentID, shiftOffset) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'enforceStrictChildOrder');

        if(shiftOffset === undefined || shiftOffset === null){
            shiftOffset = -1;
        }
        var network = report.getNetwork(networkShortName);
        var children = network.Trees;
        if(parentID !== undefined && parentID !== null) {
            ensureParameter(parentID, 'parentID', 'string', 'enforceStrictChildOrder');
            var parent = report.getElementFromTree(networkShortName, parentID);
            ensureExists(parent, 'object', 'enforceStrictChildOrder', 'cannot enforce strict child order. Parent with id "' + parentID + '" doesn\'t exist.');
            children = parent.To;
        }

        var ordered = [];
        for(var child in children){
            if(children.hasOwnProperty(child)) {
                ordered.push(children[child]);
            }
        }
        ordered.sort(function(elem1, elem2){
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
        });
        for (var i = 0; i < ordered.length; i++) {
            if(shiftOffset !== -1 && i >= shiftOffset){
                ordered[i].Order = i + 2;
            } else {
                ordered[i].Order = i + 1;
            }
        }
    };

    var getParentElementFromSubTree = function(elementID, subtree) {
        var children = subtree.To;
        for(var child in children){
            if(children.hasOwnProperty(child)) {
                if(children[child].Id === elementID) {
                    return subtree;
                } else {
                    var childresult = getParentElementFromSubTree(elementID, children[child]);
                    if(childresult !== null) {
                        return childresult;
                    }
                }
            }
        }
        return null;
    };

    Report.prototype.getParentElementFromTree = function(networkShortName, elementID) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'getParentElementFromTree');
        ensureParameter(elementID, 'elementID', 'string', 'getParentElementFromTree');
        
        var network = this.getNetwork(networkShortName);
        var parent = null;
        var children = network.Trees;
        for(var child in children){
            if(children.hasOwnProperty(child)) {
                var result = getParentElementFromSubTree(elementID, children[child]);
                if(result !== null) {
                    parent = result;
                }
            }
        }
        return parent;
    };

    Report.prototype.existsElementInTree = function(networkShortName, elementID) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'existsElementInTree');
        ensureParameter(elementID, 'elementID', 'string', 'existsElementInTree');
        
        var element = this.getElementFromTree(networkShortName, elementID);
        if(element !== null && typeof element === 'object') {
            return true;
        }
        return false;
    };

    var createNewElement = function(concept, order) {
        ensureParameter(concept, 'concept', 'object', 'createNewElement');
        var _order = 1;
        if(order !== undefined) {
            ensureParameter(order, 'order', 'number', 'createNewElement');
            _order = order;
        }
        var element = {
            Id: uuid(),
            Name : concept.Name,
            Label : concept.Label,
            Order : _order
        };
        return element;
    };

    var getMaxOrder = function(report, networkShortName, parentElementID){
        ensureNetworkShortName(networkShortName, 'networkShortName', 'getMaxOrder');
        var network = report.getNetwork(networkShortName);
        var children = network.Trees;
        if(parentElementID !== undefined && parentElementID !== null) {
            var parent = report.getElementFromTree(networkShortName, parentElementID);
            children = parent.To;
        }
        var count = 0, child;
        for (child in children) {
            if (children.hasOwnProperty(child)) {
                count += 1;
            }
        }
        return count;
    };

    Report.prototype.addTreeChild = function(networkShortName, parentElementID, conceptName, offset) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'addTreeChild');
        ensureConceptName(conceptName, 'conceptName', 'addTreeChild');
        var concept = this.getConcept(conceptName);
        ensureExists(concept, 'object', 'addTreeChild', 'concept with name "' + conceptName + '" doesn\'t exist.');

        var order = 1;
        var maxOrder = getMaxOrder(this, networkShortName, parentElementID);
        if(offset !== undefined && offset !== null){
            ensureParameter(offset, 'offset', 'number', 'addTreeChild');
            order = offset + 1;
        } else {
            offset = 0; // default
        }
        if(offset > (maxOrder)){
            throw new Error('addTreeChild: offset out of bounds: ' + offset +
                ' (Max offset is ' + maxOrder + ' for parent ' + parentElementID  + '.');
        }
        enforceStrictChildOrderAndShift(this, networkShortName, parentElementID, offset);
        if(parentElementID === undefined || parentElementID === null) {
            // add a root element
            var network = this.getNetwork(networkShortName);
            var rootElement = createNewElement(concept, order);
            network.Trees[conceptName] = rootElement;
            return rootElement;

        } else {
            // add child to existing tree
            ensureParameter(parentElementID, 'parentElementID', 'string', 'addTreeChild');
        
            var parent = this.getElementFromTree(networkShortName, parentElementID);
            ensureExists(parent, 'object', 'addTreeChild', 'cannot add child to tree. Parent with id "' + parentElementID + '" doesn\'t exist.');
            var parentConcept = this.getConcept(parent.Name);
            if(!parentConcept.IsAbstract) {
                throw new Error('addTreeChild: cannot add child to parent "' + parentElementID +
                    '". Reason: Parent concept "' + parent.Name  + '" is not abstract.');
            }

            var element = createNewElement(concept, order);
            if(parent.To === undefined || parent.To === null) {
                parent.To = {};
            }
            parent.To[conceptName] = element;

            return element;
        }
    };

    Report.prototype.moveTreeBranch = function(networkShortName, subtreeRootElementID, newParentElementID, newOffset) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'moveTreeBranch');
        ensureParameter(subtreeRootElementID, 'subtreeRootElementID', 'string', 'moveTreeBranch');

        var newOrder = 1;
        var maxOrder = getMaxOrder(this, networkShortName, newParentElementID);
        if(newOffset !== undefined && newOffset !== null){
            ensureParameter(newOffset, 'newOffset', 'number', 'moveTreeBranch');
            newOrder = newOffset + 1;
        } else {
            newOffset = 0; // default
        }
        if(newOffset > (maxOrder)){
            throw new Error('moveTreeBranch: offset out of bounds: ' + newOffset +
                ' (Max offset is ' + maxOrder + ' for parent ' + newParentElementID  + '.');
        }
        if(newParentElementID !== undefined && newParentElementID !== null){
            ensureParameter(newParentElementID, 'newParentElementID', 'string', 'moveTreeBranch');

            var newParent = this.getElementFromTree(networkShortName, newParentElementID);
            ensureExists(newParent, 'object', 'moveTreeBranch', 'Cannot move element with id "' + subtreeRootElementID + '" to new parent element with id "' + newParentElementID + '": Parent element doesn\'t exist.');
            var parentConcept = this.getConcept(newParent.Name);
            if(!parentConcept.IsAbstract) {
                throw new Error('moveTreeBranch: cannot move element to target parent "' + newParentElementID +
                    '". Reason: Parent concept "' + newParent.Name  + '" is not abstract.');
            }

            var element = this.removeTreeBranch(networkShortName, subtreeRootElementID);
            enforceStrictChildOrderAndShift(this, networkShortName, newParentElementID, newOffset);
            element.Order = newOrder;
            if(newParent.To === undefined || newParent.To === null) {
                newParent.To = {};
            }
            newParent.To[element.Name] = element;
        } else {
            // no new parent given -> make it a root element
            var network = this.getNetwork(networkShortName);
            var element2 = this.removeTreeBranch(networkShortName, subtreeRootElementID);
            enforceStrictChildOrderAndShift(this, networkShortName, newParentElementID, newOffset);
            element2.Order = newOrder;
            if(network.Trees === undefined || network.Trees === null) {
                network.Trees = [];
            }
            network.Trees[element2.Name] = element2;
        }
    };

    Report.prototype.removeTreeBranch = function(networkShortName,subtreeRootElementID) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'removeTreeBranch');
        ensureParameter(subtreeRootElementID, 'subtreeRootElementID', 'string', 'removeTreeBranch');

        var element = this.getElementFromTree(networkShortName, subtreeRootElementID);
        ensureExists(element, 'object', 'removeTreeBranch', 'Cannot remove element with id "' + subtreeRootElementID + '" from network: Element doesn\'t exist.');
        var parent = this.getParentElementFromTree(networkShortName, subtreeRootElementID);
        if(parent === null || parent === undefined) {
            var network = this.getNetwork(networkShortName);
            delete network.Trees[element.Name];
        } else {
            delete parent.To[element.Name];
        }
        return element;
    };

    /**********************
     ** Concept Maps API
     **********************/
    Report.prototype.getConceptMap = function(conceptName) {
        ensureConceptName(conceptName, 'conceptName', 'getConceptMap');

        var network = this.getNetwork('ConceptMap');
        if(network === null || network === undefined || network.Trees === null || network.Trees === undefined) {
            return null;
        }
 
        var map = network.Trees[conceptName];
        if(map === null || map === undefined) {
            return null;
        } else {
            return map;
        }
    };

    Report.prototype.listConceptMaps = function() {

        var result = [];
        var network = this.getNetwork('ConceptMap');
        if(network === null || network === undefined || network.Trees === null || network.Trees === undefined) {
            return result;
        }
        
        for (var conceptname in network.Trees) {
            var map = network.Trees[conceptname];
            result.push(map);
        }
        return result;
    };

    Report.prototype.existsConceptMap = function(conceptName) {
        ensureConceptName(conceptName, 'conceptName', 'existsConceptMap');

        var map = this.getConceptMap(conceptName);
        if(map === null || map === undefined) {
            return false;
        }
        return true;
    };

    Report.prototype.addConceptMap = function(fromConceptName, toConceptNamesArray) {
        ensureConceptName(fromConceptName, 'fromConceptName', 'addConceptMap');
        var fromConcept = this.getConcept(fromConceptName);
        ensureExists(fromConcept, 'object', 'addConceptMap', 'concept with name "' + fromConceptName + '" doesn\'t exist.');
        if(fromConcept.IsAbstract) {
            throw new Error('addConceptMap: cannot add a concept map for concept "' + fromConceptName +
                '". Reason: Concept is abstract.');
        }

        var toObj = {};
        for(var i in toConceptNamesArray) {
            var name = toConceptNamesArray[i];
            ensureConceptName(name, 'toConceptNamesArray', 'addConceptMap');
            toObj[name] = {
                'Name': name,
                'Order': parseInt(i, 10) + 1
            };
        }
        var conceptMap = {
            'Name': fromConcept.Name,
            'To': toObj
        };
        
        var network = this.getNetwork('ConceptMap');
        if(network.Trees === null || network.Trees === undefined) {
            network.Trees = {};
        }
        if(network.Trees[fromConceptName] !== null && typeof network.Trees[fromConceptName] === 'object'){
            throw new Error('addConceptMap: concept map for concept "' + fromConceptName + '" already exists');
        }
        network.Trees[fromConceptName] = conceptMap;
    };

    Report.prototype.updateConceptMap = function(fromConceptName, toConceptNamesArray) {
        ensureConceptName(fromConceptName, 'fromConceptName', 'updateConceptMap');
        var fromConcept = this.getConcept(fromConceptName);
        ensureExists(fromConcept, 'object', 'updateConceptMap', 'concept with name "' + fromConceptName + '" doesn\'t exist.');

        var conceptMap = this.getConceptMap(fromConceptName);
        ensureExists(conceptMap, 'object', 'updateConceptMap', 'No concept map exists for concept with name "' + fromConceptName + '".');

        var toObj = {};
        for(var i in toConceptNamesArray) {
            var name = toConceptNamesArray[i];
            ensureConceptName(name, 'toConceptNamesArray', 'updateConceptMap');
            toObj[name] = {
                'Name': name,
                'Order': parseInt(i, 10) + 1
            };
        }
        conceptMap.To = toObj;
    };

    Report.prototype.findInConceptMap = function(conceptName) {
        ensureConceptName(conceptName, 'conceptName', 'findInConceptMap');
        
        var result = [];
        var network = this.getNetwork('ConceptMap');
        if(network.Trees === null || network.Trees === undefined) {
            return result;
        }

        for(var child in network.Trees){
            if(network.Trees.hasOwnProperty(child)) {
                var map = network.Trees[child];
                var to = map.To;
                if(to !== null && to !== undefined && to[conceptName] !== null && typeof to[conceptName] === 'object') {
                    result.push(child);
                } else if (child === conceptName){
                    result.push(child);
                }
            }
        }
        return result;
    };

    Report.prototype.removeConceptMap = function(conceptName) {
        ensureConceptName(conceptName, 'conceptName', 'removeConceptMap');
        
        var conceptMap = this.getConceptMap(conceptName);
        ensureExists(conceptMap, 'object', 'removeConceptMap', 'No concept map exists for concept with name "' + conceptName + '".');

        var network = this.getNetwork('ConceptMap');
        return delete network.Trees[conceptName];
    };

    /**********************
     ** Rules API
     **********************/
    Report.prototype.getRule = function(id) {
        ensureParameter(id, 'id', 'string', 'getRule');

        var model = this.getModel();
        if(model === null || model === undefined || model.Rules === null || model.Rules === undefined || model.Rules.length === 0) {
            return null;
        }

        for (var i in model.Rules) {
            var rule = model.Rules[i];
            if(rule.Id === id) {
                return rule;
            }
        }
        return null;
    };

    Report.prototype.removeRule = function(id) {
        ensureParameter(id, 'id', 'string', 'removeRule');

        var model = this.getModel();
        if(model === null || model === undefined || model.Rules === null || model.Rules === undefined || model.Rules.length === 0) {
            return;
        }
        for (var i in model.Rules) {
            var rule = model.Rules[i];
            if(rule.Id === id) {
                // remove rule from array
                model.Rules.splice(i,1);
            }
        }
    };

    Report.prototype.existsRule = function(id) {
        ensureParameter(id, 'id', 'string', 'existsRule');

        var rule = this.getRule(id);
        if(rule !== null && typeof rule === 'object') {
            return true;
        }
        return false;
    };

    Report.prototype.computableByRules = function(conceptName) {
        ensureConceptName(conceptName, 'conceptName', 'computableByRules');

        var result = [];
        var model = this.getModel();
        ensureExists(model, 'object', 'computableByRules', 'Report doesn\'t have a model.');

        if(model.Rules === null || model.Rules === undefined || model.Rules.length === 0) {
            return result;
        }

        for (var i in model.Rules) {
            var rule = model.Rules[i];
            // indexOf not supported in IE<9
            for(var j in rule.ComputableConcepts){
                if(rule.ComputableConcepts[j] === conceptName) {
                    result.push(rule);
                }
            }
        }
        return result;
    };

    Report.prototype.findInRules = function(conceptName) {
        ensureConceptName(conceptName, 'conceptName', 'findInRules');

        var result = [];
        var model = this.getModel();
        ensureExists(model, 'object', 'computableByRules', 'Report doesn\'t have a model.');

        if(model.Rules === null || model.Rules === undefined || model.Rules.length === 0) {
            return result;
        }

        for (var i in model.Rules) {
            var rule = model.Rules[i];
            var found = false;
            // indexOf not supported in IE<9
            for(var j in rule.ComputableConcepts){
                if(rule.ComputableConcepts[j] === conceptName) {
                    result.push(rule.Id);
                    found = true;
                    break;
                }
            }
            if(!found && rule.DependsOn !== null && typeof rule.DependsOn === 'object') {
                for(var x in rule.DependsOn){
                    if(rule.DependsOn[x] === conceptName) {
                        result.push(rule.Id);
                        found = true;
                        break;
                    }
                }
            }
            if(!found && rule.ValidatedConcepts !== null && typeof rule.ValidatedConcepts === 'object') {
                for(var y in rule.ValidatedConcepts){
                    if(rule.ValidatedConcepts[y] === conceptName) {
                        result.push(rule.Id);
                        found = true;
                        break;
                    }
                }
            }
        }
        return result;
    };

    var createNewRule = function(id, label, description, type, formula, computableConceptsArray, dependingConceptsArray, validatedConceptsArray, report) {
        ensureParameter(id, 'id', 'string', 'createNewRule');
        ensureParameter(label, 'label', 'string', 'createNewRule');
        ensureParameter(description, 'description', 'string', 'createNewRule');
        ensureRuleType(type, 'type', 'createNewRule');
        ensureParameter(formula, 'formula', 'string', 'createNewRule');
        ensureExists(computableConceptsArray, 'object', 'createNewRule', 'function called without computableConceptsArray.');

        for(var i in computableConceptsArray) {
            var cname = computableConceptsArray[i];
            ensureConceptName(cname, 'computableConceptsArray', 'createNewRule');
            var rulesComputableConcepts = report.computableByRules(cname);
            if(rulesComputableConcepts.lenght > 0 && rulesComputableConcepts[0].Id !== id) {
                throw new Error('createNewRule: A rule which can compute facts of concept "' + cname + '" exists already: "' + rulesComputableConcepts[0] + '. Currently, only one rule must be able to compute a fact for a certain concept.');
            }
        }
        if(dependingConceptsArray !== null && typeof dependingConceptsArray === 'object') {
            for(var j in dependingConceptsArray) {
                var dname = dependingConceptsArray[j];
                ensureConceptName(dname, 'dependingConceptsArray', 'createNewRule');
            }
        }
        if(validatedConceptsArray !== null && typeof validatedConceptsArray === 'object') {
            for(var x in validatedConceptsArray) {
                var vname = validatedConceptsArray[x];
                ensureConceptName(vname, 'validatedConceptsArray', 'createNewRule');
            }
        }
        if(computableConceptsArray.length === 0) {
            throw new Error('createNewRule: rule of type "' + type + '" must have at least one computable concept. Function createNewRule was called with empty computableConceptsArray.');
        }
        
        var rule = {
            'Id': id,
            'Label': label,
            'Description': description,
            'Type': type,
            'Formula': formula,
            'ComputableConcepts': computableConceptsArray,
            'DependsOn': dependingConceptsArray
        };

        if(type === 'xbrl28:validation') {
            ensureExists(validatedConceptsArray, 'object', 'createNewRule', 'function called without validatedConceptsArray.');
            if(validatedConceptsArray.length === 0) {
                throw new Error('validatedConceptsArray: rule of type "' + type + '" must have at least one validateble concept. Function createNewRule was called with empty validatedConceptsArray.');
            }
            rule.ValidatedConcepts = validatedConceptsArray;
        }
        return rule;
    };

    Report.prototype.setFormulaRule = function(id, label, description, formula, computableConceptsArray, dependingConceptsArray){
        // sanity checks are done in createNewRule
        var rule = createNewRule(id, label, description, 'xbrl28:formula', formula, computableConceptsArray, dependingConceptsArray, null, this);

        var model = this.getModel();
        ensureExists(model, 'object', 'setFormulaRule', 'Report doesn\'t have a model.');

        if(model.Rules === null || model.Rules === undefined) {
            model.Rules = [];
        }
        if(this.existsRule(id)) {
            this.removeRule(id);
        }
        model.Rules.push(rule);
    };

    Report.prototype.setValidationRule = function(id, label, description, formula, computableConceptsArray, dependingConceptsArray, validatedConceptsArray){
        // sanity checks are done in createNewRule
        var rule = createNewRule(id, label, description, 'xbrl28:validation', formula, computableConceptsArray, dependingConceptsArray, validatedConceptsArray, this);

        var model = this.getModel();
        ensureExists(model, 'object', 'setValidationRule', 'Report doesn\'t have a model.');

        if(model.Rules === null || model.Rules === undefined) {
            model.Rules = [];
        }
        if(this.existsRule(id)) {
            this.removeRule(id);
        }
        model.Rules.push(rule);
    };

    Report.prototype.listRules = function(concept){

        var result = [];
        var model = this.getModel();
        if(model === null || model === undefined || model.Rules === null || model.Rules === undefined) {
            return result;
        }
        if(concept !== undefined && concept !== null){
            ensureParameter(concept, 'concept', 'string', 'listRules');
            result = this.computableByRules(concept);
        } else {
            result = model.Rules;
        }
        return result;
    };

    Report.prototype.listFormulaRules = function(concept){
        var result = [];
        var rules = this.listRules(concept);
        for(var i in rules) {
            var rule = rules[i];
            if(rule.Type === 'xbrl28:formula'){
                result.push(rule);
            }
        }
        return result;
    };

    Report.prototype.listValidationRules = function(concept){
        var result = [];
        var rules = this.listRules(concept);
        for(var i in rules) {
            var rule = rules[i];
            if(rule.Type === 'xbrl28:validation'){
                result.push(rule);
            }
        }
        return result;
    };

    Report.prototype.listExcelRules = function(concept){
        var result = [];
        var rules = this.listRules(concept);
        for(var i in rules) {
            var rule = rules[i];
            if(rule.Type === 'xbrl28:excel'){
                result.push(rule);
            }
        }
        return result;
    };

    return Report;
});
angular.module('excelParser', []).factory('ExcelParser',function(){ return (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = peg$FAILED,
        peg$c1 = function(left, operator, right) { return create(operator, left, right); },
        peg$c2 = /^[+\-]/,
        peg$c3 = { type: "class", value: "[+\\-]", description: "[+\\-]" },
        peg$c4 = function(sign) { if (sign === "+"){ return "add"; } else { return "sub"; } },
        peg$c5 = /^[*\/]/,
        peg$c6 = { type: "class", value: "[*\\/]", description: "[*\\/]" },
        peg$c7 = function(sign) { if (sign === "*"){ return "mul"; } else { return "div"; } },
        peg$c8 = /^[<>]/,
        peg$c9 = { type: "class", value: "[<>]", description: "[<>]" },
        peg$c10 = "=",
        peg$c11 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c12 = function(double) { switch(double.join("")){
                                   case "<=": return "le";
                                   case ">=": return "ge";
                                 };
                               },
        peg$c13 = "<>",
        peg$c14 = { type: "literal", value: "<>", description: "\"<>\"" },
        peg$c15 = function() { return "ne"; },
        peg$c16 = /^[<=>]/,
        peg$c17 = { type: "class", value: "[<=>]", description: "[<=>]" },
        peg$c18 = function(single) { return single; },
        peg$c19 = "(",
        peg$c20 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c21 = ")",
        peg$c22 = { type: "literal", value: ")", description: "\")\"" },
        peg$c23 = function(block) { return createOne("block", block); },
        peg$c24 = [],
        peg$c25 = /^[a-zA-Z0-9._]/,
        peg$c26 = { type: "class", value: "[a-zA-Z0-9._]", description: "[a-zA-Z0-9._]" },
        peg$c27 = void 0,
        peg$c28 = /^[^(]/,
        peg$c29 = { type: "class", value: "[^(]", description: "[^(]" },
        peg$c30 = function(name) { return createVar(name[0].join("")); },
        peg$c31 = function(name) { return createVar(name.join("")); },
        peg$c32 = { type: "other", description: "integer" },
        peg$c33 = /^[0-9.]/,
        peg$c34 = { type: "class", value: "[0-9.]", description: "[0-9.]" },
        peg$c35 = function(digits) { return createAtomic(parseFloat(digits.join(""), 10)); },
        peg$c36 = /^[aA]/,
        peg$c37 = { type: "class", value: "[aA]", description: "[aA]" },
        peg$c38 = /^[nN]/,
        peg$c39 = { type: "class", value: "[nN]", description: "[nN]" },
        peg$c40 = /^[dD]/,
        peg$c41 = { type: "class", value: "[dD]", description: "[dD]" },
        peg$c42 = function(name, params) { return createFun(name.join("").toLowerCase(), params); },
        peg$c43 = /^[oO]/,
        peg$c44 = { type: "class", value: "[oO]", description: "[oO]" },
        peg$c45 = /^[rR]/,
        peg$c46 = { type: "class", value: "[rR]", description: "[rR]" },
        peg$c47 = "not",
        peg$c48 = { type: "literal", value: "not", description: "\"not\"" },
        peg$c49 = function(name, param) { return createFun(name, param); },
        peg$c50 = "isblank",
        peg$c51 = { type: "literal", value: "isblank", description: "\"isblank\"" },
        peg$c52 = null,
        peg$c53 = function(param) { return param; },
        peg$c54 = /^[ \t\r\n]/,
        peg$c55 = { type: "class", value: "[ \\t\\r\\n]", description: "[ \\t\\r\\n]" },
        peg$c56 = ",",
        peg$c57 = { type: "literal", value: ",", description: "\",\"" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsestart() {
      var s0;

      s0 = peg$parsecomparison();

      return s0;
    }

    function peg$parsecomparison() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsesubadd();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseop_comparator();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsecomparison();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c1(s2, s4, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsesubadd();
      }

      return s0;
    }

    function peg$parsesubadd() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsemuldiv();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseop_subadd();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsesubadd();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c1(s2, s4, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsemuldiv();
      }

      return s0;
    }

    function peg$parsemuldiv() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseprimary();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseop_muldiv();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemuldiv();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c1(s2, s4, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseprimary();
      }

      return s0;
    }

    function peg$parseop_subadd() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c2.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c3); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c4(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseop_muldiv() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c5.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c6); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c7(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseop_comparator() {
      var s0;

      s0 = peg$parseop_comparator_le_ge();
      if (s0 === peg$FAILED) {
        s0 = peg$parseop_comparator_not_equal();
        if (s0 === peg$FAILED) {
          s0 = peg$parseop_comparator_single();
        }
      }

      return s0;
    }

    function peg$parseop_comparator_le_ge() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (peg$c8.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c9); }
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 61) {
          s3 = peg$c10;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c11); }
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c12(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseop_comparator_not_equal() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c13) {
        s1 = peg$c13;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c14); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c15();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseop_comparator_single() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c16.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c17); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c18(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseprimary() {
      var s0;

      s0 = peg$parseinteger();
      if (s0 === peg$FAILED) {
        s0 = peg$parseblock();
        if (s0 === peg$FAILED) {
          s0 = peg$parsevariable();
          if (s0 === peg$FAILED) {
            s0 = peg$parsefunction();
            if (s0 === peg$FAILED) {
              s0 = peg$parsevariable2();
            }
          }
        }
      }

      return s0;
    }

    function peg$parseblock() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c19;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsecomparison();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c21;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c22); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c23(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsevariable() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = [];
        if (peg$c25.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c26); }
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c25.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c26); }
            }
          }
        } else {
          s3 = peg$c0;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$currPos;
          s6 = peg$parse_();
          if (s6 !== peg$FAILED) {
            if (peg$c28.test(input.charAt(peg$currPos))) {
              s7 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c29); }
            }
            if (s7 !== peg$FAILED) {
              s6 = [s6, s7];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$c0;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$c0;
          }
          peg$silentFails--;
          if (s5 !== peg$FAILED) {
            peg$currPos = s4;
            s4 = peg$c27;
          } else {
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c30(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsevariable2() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c25.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c26); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c25.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c26); }
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c31(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseinteger() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (peg$c33.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c34); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c33.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c34); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c35(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }

      return s0;
    }

    function peg$parsefunction() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsefun_and();
        if (s2 === peg$FAILED) {
          s2 = peg$parsefun_or();
          if (s2 === peg$FAILED) {
            s2 = peg$parsefun_not();
            if (s2 === peg$FAILED) {
              s2 = peg$parsefun_isblank();
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefun_and() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (peg$c36.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c37); }
      }
      if (s2 !== peg$FAILED) {
        if (peg$c38.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c39); }
        }
        if (s3 !== peg$FAILED) {
          if (peg$c40.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s4 !== peg$FAILED) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 40) {
            s3 = peg$c19;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseparameter();
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseparameter();
                }
              } else {
                s5 = peg$c0;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c21;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c22); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c42(s1, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefun_or() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (peg$c43.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c44); }
      }
      if (s2 !== peg$FAILED) {
        if (peg$c45.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c46); }
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 40) {
            s3 = peg$c19;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseparameter();
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseparameter();
                }
              } else {
                s5 = peg$c0;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c21;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c22); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c42(s1, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefun_not() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c47) {
        s1 = peg$c47;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c48); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 40) {
            s3 = peg$c19;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseparameter();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c21;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c22); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c49(s1, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefun_isblank() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c50) {
        s1 = peg$c50;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c51); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 40) {
            s3 = peg$c19;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseparameter();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c21;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c22); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c49(s1, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseparameter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsecomma();
      if (s1 === peg$FAILED) {
        s1 = peg$c52;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsecomparison();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c53(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsews() {
      var s0;

      if (peg$c54.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsews();
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsews();
      }

      return s0;
    }

    function peg$parsecomma() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 44) {
          s2 = peg$c56;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c57); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }


      function create(type, left, right) {
        return {Type: type, Children: [left,right]};
      }

      function createOne(type, one) {
        return {Type: type, Children: [one]};
      }

      function createAtomic(val) {
        return {Type: "atomic", Value: val};
      }


      function createVar(name) {
        return {Type: "variable", ConceptName: name};
      }

      
      function createFun(name, params) {
        return {Type: "function", Name: name, Params: [params]};
      }



    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})()});