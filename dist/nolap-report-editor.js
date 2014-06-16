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
                })
                .catch(function(error){
                    $rootScope.$emit('savingError');
                    console.error(error);
                    $scope.dirtyModel = angular.copy($scope.model);
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
                    //var concept = ui.item.sortable.moved;
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

/*
            $scope.$watch(function(){
                return reportCtrl.getConcepts();
            }, function(concepts){
                $scope.concepts = [];
                concepts.forEach(function(concept){
                    $scope.concepts.push(concept.Name);
                });
            });
            */

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

.constant("PresentationTreeTpl", "<div ng-if=\"!conceptName\">\n    <p>No concept is selected. You can pick one on the left end side or create a new concept.</p>\n    <button ng-click=\"newConcept()\" class=\"btn btn-primary\"><i class=\"fa fa-plus\"></i> Concept</button>\n</div>\n<div ng-if=\"conceptName\">\n    <p>Drag and drop the concept in the presentation tree.</p>\n    <ul class=\"list-group sortable-container\" ui-sortable=\"sortableOptions\" ng-model=\"conceptName\">\n        <li class=\"list-group-item sortable\" ng-bind=\"conceptName\"></li>\n    </ul>\n</div>\n<ul class=\"nav nav-list nav-pills nav-stacked abn-tree sortable-container\" ui-sortable=\"sortableOptions\" ng-model=\"rows\">\n    <li ng-repeat=\"row in rows\"  ng-class=\"'level-' + {{ row.level }} + (selected.Id === row.branch.Id ? ' active':'')\" class=\"abn-tree-row sortable\" id=\"{{row.branch.Id}}\">\n        <a ng-click=\"select(row)\">\n            <i ng-class=\"{ 'fa-caret-right': !row.branch.expanded && row.branch.To, 'fa-caret-down': row.branch.expanded && row.branch.To }\" class=\"indented tree-icon fa\"></i>\n            <span class=\"indented tree-label\">{{row.branch.Label}} ({{row.branch.Name}})</span>\n            <span class=\"remove-concept indented fa fa-times\" ng-click=\"remove(row.branch.Id)\"></span>\n        </a>\n    </li>\n</ul>")

.constant("ConceptMapTpl", "<div ng-if=\"map === undefined\">\n    <h3 ng-bind=\"concept.Name\"></h3>\n    <div ng-if=\"concept.IsAbstract !== true\">\n        <p>There is no concept map associated to <i ng-bind=\"conceptName\"></i>.</p>\n        <button ng-click=\"addConceptMap()\" class=\"btn btn-primary\">Add concept Map</button>\n    </div>\n    <div ng-if=\"concept.IsAbstract === true\">\n        <p>This concept is abstract.</p>\n    </div>\n</div>\n<div ng-if=\"map !== undefined\">\n    <button class=\"pull-right btn btn-default\"><i class=\"fa fa-times\" ng-click=\"removeConceptMap()\"></i></button>\n    <h3 ng-bind=\"concept.Name\"></h3>\n    <p ng-bind=\"concept.Label\"></p>\n    <ul class=\"list-group\">\n        <li class=\"list-group-item clearfix\" ng-repeat=\"key in map\">\n            <span ng-bind=\"key\"></span>\n            <div class=\"btn-group pull-right\">\n                <button class=\"btn btn-default\" type=\"button\" ng-click=\"moveTo(key, $index - 1)\" ng-if=\"$last === false\"><i class=\"fa fa-long-arrow-down\"></i></button>\n                <button class=\"btn btn-default\" type=\"button\" ng-click=\"moveTo(key, $index + 1)\" ng-if=\"$first === false\"><i class=\"fa fa-long-arrow-up\"></i></button>\n                <button class=\"btn btn-default\" type=\"button\" ng-click=\"removeValue(key)\"><i class=\"fa fa-times\"></i></button>\n            </div>\n        </li>\n    </ul>\n    <form class=\"form-inline\" role=\"form\" ng-submit=\"addValue(newConceptValue)\" ui-keypress=\"{ 13:'addValue(newConceptValue)' }\">\n        <div class=\"form-group\">\n            <div class=\"row\">\n                <div class=\"col-lg-6\">\n                    <div class=\"input-group\">\n                        <input type=\"text\" class=\"form-control\" id=\"conceptValue\" placeholder=\"Concept Name\" ng-model=\"newConceptValue\" typeahead=\"concept for concept in concepts | filter:$viewValue | limitTo:8\">\n                        <span class=\"input-group-btn\">\n                            <button type=\"submit\" class=\"btn btn-primary\">Add</button>\n                        </span>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </form>\n</div>")

.constant("ConceptTpl", "<form name=\"editConceptForm\" ng-submit=\"ok\" role=\"form\" spellcheck=\"false\" novalidate>\n    <div class=\"modal-header\">\n    <button class=\"pull-right btn btn-default\"><i class=\"fa fa-times\" ng-click=\"remove()\"></i></button>\n        <h3 class=\"modal-title\" ng-bind=\"concept.Name\"></h3>\n    </div>\n    <div class=\"modal-body\">\n        <div class=\"form-group\">\n            <label for=\"label\">Label</label>\n           <input type=\"text\" class=\"form-control\" id=\"label\" ng-model=\"concept.Label\" placeholder=\"Label\" required>\n        </div>\n        <div class=\"checkbox\">\n            <label>\n                <input type=\"checkbox\" ng-model=\"concept.IsAbstract\"> Abstract\n            </label>\n        </div>\n    </div>\n</form>")

;'use strict';

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
            if(networkShortName !== 'ConceptMap' && !parentConcept.IsAbstract) {
                throw new Error('moveTreeBranch: cannot move element to target parent "' + newParentElementID +
                    '". Reason: Parent concept "' + newParent.Name  + '" is not abstract.');
            } else if(networkShortName === 'ConceptMap' && parentConcept.IsAbstract) {
                throw new Error('moveTreeBranch: cannot move element to target parent "' + newParentElementID +
                    '" in ConceptMap. Reason: Parent concept "' + newParent.Name  + '" is abstract.');
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
                'Id': uuid(),
                'Name': name,
                'Order': parseInt(i, 10) + 1
            };
        }
        var conceptMap = {
            'Id': uuid(),
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

    Report.prototype.listRules = function(){

        var result = [];
        var model = this.getModel();
        if(model === null || model === undefined || model.Rules === null || model.Rules === undefined) {
            return result;
        }
        return model.Rules;
    };

    Report.prototype.listFormulaRules = function(){
        var result = [];
        var rules = this.listRules();
        for(var i in rules) {
            var rule = rules[i];
            if(rule.Type === 'xbrl28:formula'){
                result.push(rule);
            }
        }
        return result;
    };

    Report.prototype.listValidationRules = function(){
        var result = [];
        var rules = this.listRules();
        for(var i in rules) {
            var rule = rules[i];
            if(rule.Type === 'xbrl28:validation'){
                result.push(rule);
            }
        }
        return result;
    };

    return Report;
});
