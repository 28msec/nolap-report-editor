'use strict';

angular
.module('report-model', [])
.factory('Report', function(){

    //Constructor
    var Report = function(modelOrName, label, description, role, username, prefix){
        if (typeof modelOrName !== 'object' &&
                   typeof modelOrName !== 'string' &&
                   modelOrName !== undefined &&
                   modelOrName !== null) {
            throw new Error('new Report creation with invalid type ' + typeof modelOrName);
        } else if (typeof modelOrName === 'object') {
            this.model = modelOrName;
        } else if (typeof modelOrName === 'string' ||
                   modelOrName === undefined ||
                   modelOrName === null){
            ensureParameter(label, 'label', 'string', 'Report (Constructor)');
            ensureParameter(description, 'description', 'string', 'Report (Constructor)');
            ensureParameter(role, 'role', 'string', 'Report (Constructor)');
            ensureParameter(username, 'username', 'string', 'Report (Constructor)',
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'invalid username value passed "' + username + '" (its not a valid Email Address).');
            if(modelOrName === undefined || modelOrName === null){
                modelOrName = _uuid();
            }
            this.model =
                {
                    '_id' : modelOrName,
                    'Archive' : null,
                    'Label' : label,
                    'Description': description,
                    'Owner': username,
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
            if(prefix !== undefined && prefix !== null && typeof prefix === 'string'){
                this.model.Prefix = prefix;
            } else {
                // do a good guess
                var startingChars = '';
                label.split(/[^A-Za-z0-9]+/).forEach(function(elem){
                    var char = elem.substr(0,1);
                    if(/[A-Za-z]/.test(char) && elem.length > 1) {
                        startingChars += char.toLowerCase();
                    }
                });
                this.model.Prefix = startingChars;
            }
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

    var ensureConceptName = function(conceptName, paramName, functionName, errorMsg) {
        var regex = /^\w(\w|\d|[-_])*:(\w|\d|[-_])*$/g;
        if(errorMsg === undefined || errorMsg === null) {
            ensureParameter(conceptName, paramName, 'string', functionName, regex,
                    'function called with mandatory "' + paramName + '" parameter which is not a QName: ' + conceptName);
        } else {
            if(conceptName.match(regex) === null) {
                throw new Error(errorMsg);
            }
        }
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
        if(value === null || value === undefined || value === '') {
            throw new Error(functionName + ': ' + errorMessage);
        }
        if(typeof value !== valueType) {
            throw new Error(functionName + ': Type exception: Expected type "' + valueType + '"');
        }
    };

    // helper to create a unique id
    var _uuid = function () {
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

    Report.prototype.uuid = function(){
        return _uuid();
    };

    Report.prototype.getPrefix = function(){
        var model = this.getModel();
        ensureExists(model, 'object', 'getPrefix', 'Report doesn\'t have a model.');
        if(model.Prefix !== undefined && model.Prefix !== null && typeof model.Prefix === 'string'){
           return model.Prefix;
        }

        // try to guess the prefix
        var concepts = this.listConcepts();
        if(concepts.length === 0){
            // no chance to guess the prefix
            return null;
        }
        var map = concepts.reduce(function (prefixes, concept) {
            var found = concept.Name.indexOf(':');
            if(found !== -1){
                var prefix = concept.Name.substring(0,found);
                prefixes[prefix] = (prefixes[prefix] || 0) + 1;
            }
            return prefixes;
        }, {});
        var allPrefixes = Object.keys(map).sort(function (a, b) {
            return map[a] < map[b];
        });
        model.Prefix = allPrefixes[0];
        return model.Prefix;
    };

    Report.prototype.getModel = function(){
        return this.model;
    };

    /**********************
     ** Concepts API
     **********************/
    Report.prototype.addConcept = function(oname, label, abstract) {
        var name = this.alignConceptPrefix(oname);
        ensureConceptName(name, 'oname', 'addConcept');
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

    Report.prototype.updateConcept = function(oname, label, abstract) {
        var name = this.alignConceptPrefix(oname);
        ensureConceptName(name, 'oname', 'updateConcept');
        ensureParameter(label, 'label', 'string', 'updateConcept');
        abstract = abstract === true;

        if(!this.existsConcept(name)) {
            throw new Error('updateConcept: cannot update concept with name "' + name + '" because it doesn\'t exist.');
        }
       
        var concept = this.getConcept(name);
        concept.Label = label;
        concept.IsAbstract = abstract;
    };

    Report.prototype.removeConcept = function(oname) {
        var name = this.alignConceptPrefix(oname);
        ensureConceptName(name, 'oname', 'removeConcept');

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

    Report.prototype.existsConcept = function(oconceptName) {
        var conceptName = this.alignConceptPrefix(oconceptName);
        ensureConceptName(conceptName, 'oconceptName', 'existsConcept');

        var concept = this.getConcept(conceptName);
        if(concept !== null && typeof concept === 'object') {
            return true;
        }
        return false;
    };

    Report.prototype.getConcept = function(oconceptName) {
        var conceptName = this.alignConceptPrefix(oconceptName);
        ensureConceptName(conceptName, 'oconceptName', 'getConcept');

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
            Id: _uuid(),
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

    Report.prototype.addTreeChild = function(networkShortName, parentElementID, oconceptName, offset) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'addTreeChild');
        var conceptName = this.alignConceptPrefix(oconceptName);
        ensureConceptName(conceptName, 'oconceptName', 'addTreeChild');
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
    Report.prototype.getConceptMap = function(oconceptName) {
        var conceptName = this.alignConceptPrefix(oconceptName);
        ensureConceptName(conceptName, 'oconceptName', 'getConceptMap');

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

    Report.prototype.existsConceptMap = function(oconceptName) {
        var conceptName = this.alignConceptPrefix(oconceptName);
        ensureConceptName(conceptName, 'oconceptName', 'existsConceptMap');

        var map = this.getConceptMap(conceptName);
        if(map === null || map === undefined) {
            return false;
        }
        return true;
    };

    Report.prototype.addConceptMap = function(ofromConceptName, toConceptNamesArray) {
        var fromConceptName = this.alignConceptPrefix(ofromConceptName);
        ensureConceptName(fromConceptName, 'ofromConceptName', 'addConceptMap');
        var fromConcept = this.getConcept(fromConceptName);
        ensureExists(fromConcept, 'object', 'addConceptMap', 'concept with name "' + fromConceptName + '" doesn\'t exist.');
        if(fromConcept.IsAbstract) {
            throw new Error('addConceptMap: cannot add a concept map for concept "' + fromConceptName +
                '". Reason: Concept is abstract.');
        }

        var toObj = {};
        for(var i in toConceptNamesArray) {
            var name = this.alignConceptPrefix(toConceptNamesArray[i]);
            ensureConceptName(name, 'toConceptNamesArray', 'addConceptMap');
            toObj[name] = {
                'Id': _uuid(),
                'Name': name,
                'Order': parseInt(i, 10) + 1
            };
        }
        var conceptMap = {
            'Id': _uuid(),
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

    Report.prototype.updateConceptMap = function(ofromConceptName, toConceptNamesArray) {
        var fromConceptName = this.alignConceptPrefix(ofromConceptName);
        ensureConceptName(fromConceptName, 'ofromConceptName', 'updateConceptMap');
        var fromConcept = this.getConcept(fromConceptName);
        ensureExists(fromConcept, 'object', 'updateConceptMap', 'concept with name "' + fromConceptName + '" doesn\'t exist.');

        var conceptMap = this.getConceptMap(fromConceptName);
        ensureExists(conceptMap, 'object', 'updateConceptMap', 'No concept map exists for concept with name "' + fromConceptName + '".');

        var toObj = {};
        for(var i in toConceptNamesArray) {
            var name = this.alignConceptPrefix(toConceptNamesArray[i]);
            ensureConceptName(name, 'toConceptNamesArray', 'updateConceptMap');
            toObj[name] = {
                'Name': name,
                'Order': parseInt(i, 10) + 1
            };
        }
        conceptMap.To = toObj;
    };

    Report.prototype.findInConceptMap = function(oconceptName) {
        var conceptName = this.alignConceptPrefix(oconceptName);
        ensureConceptName(conceptName, 'oconceptName', 'findInConceptMap');
        
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

    Report.prototype.removeConceptMap = function(oconceptName) {
        var conceptName = this.alignConceptPrefix(oconceptName);
        ensureConceptName(conceptName, 'oconceptName', 'removeConceptMap');
        
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

    Report.prototype.validatedByRules = function(oconceptName) {
        var conceptName = this.alignConceptPrefix(oconceptName);
        ensureConceptName(conceptName, 'oconceptName', 'validatedByRules');

        var result = [];
        var model = this.getModel();
        ensureExists(model, 'object', 'validatedByRules', 'Report doesn\'t have a model.');

        if(model.Rules === null || model.Rules === undefined || model.Rules.length === 0) {
            return result;
        }

        for (var i in model.Rules) {
            var rule = model.Rules[i];
            if(rule.ValidatedConcepts !== undefined && rule.ValidatedConcepts !== null) {
                for (var j in rule.ValidatedConcepts) {
                    if (rule.ValidatedConcepts[j] === conceptName) {
                        result.push(rule);
                        break;
                    }
                }
            }
        }
        return result;
    };

     Report.prototype.computableByRules = function(oconceptName) {
         var conceptName = this.alignConceptPrefix(oconceptName);
         ensureConceptName(conceptName, 'oconceptName', 'computableByRules');

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

    Report.prototype.findInRules = function(oconceptName) {
        var conceptName = this.alignConceptPrefix(oconceptName);
        ensureConceptName(conceptName, 'oconceptName', 'findInRules');

        var result = [];
        var model = this.getModel();
        ensureExists(model, 'object', 'findInRules', 'Report doesn\'t have a model.');

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
        ensureRuleType(type, 'type', 'createNewRule');
        ensureParameter(formula, 'formula', 'string', 'createNewRule');
        ensureExists(computableConceptsArray, 'object', 'createNewRule', 'function called without computableConceptsArray.');

        for(var i in computableConceptsArray) {
            var cname = report.alignConceptPrefix(computableConceptsArray[i]);
            ensureConceptName(cname, 'computableConceptsArray', 'createNewRule');
            var rulesComputableConcepts = report.computableByRules(cname);
            if(rulesComputableConcepts.lenght > 0 && rulesComputableConcepts[0].Id !== id) {
                throw new Error('createNewRule: A rule which can compute facts of concept "' + cname + '" exists already: "' + rulesComputableConcepts[0] + '. Currently, only one rule must be able to compute a fact for a certain concept.');
            }
        }
        if(dependingConceptsArray !== null && typeof dependingConceptsArray === 'object') {
            for(var j in dependingConceptsArray) {
                var dname = report.alignConceptPrefix(dependingConceptsArray[j]);
                ensureConceptName(dname, 'dependingConceptsArray', 'createNewRule');
            }
        }
        if(validatedConceptsArray !== null && typeof validatedConceptsArray === 'object') {
            for(var x in validatedConceptsArray) {
                var vname = report.alignConceptPrefix(validatedConceptsArray[x]);
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

    var validate = function(report, errorMsgPrefix, action, id, label, type, description, formula, computableConceptsArray, dependingConceptsArray, validatedConceptsArray){
        ensureExists(id, 'string', errorMsgPrefix, 'Mandatory Id missing.');
        var existingRule = report.getRule(id);
        if(action === 'Create' && existingRule !== undefined && existingRule !== null){
            throw new Error(errorMsgPrefix + ': Rule with ID "' + id + '" already exists!');
        } else if(action === 'Update' && (existingRule === undefined || existingRule === null)){
            throw new Error(errorMsgPrefix + ': Rule with ID "' + id + '" doesn\'t exist!');
        } else if(action !== 'Create' && action !== 'Update'){
            throw new Error(errorMsgPrefix + ': Unknown action "' + action + '"!');
        }
        ensureExists(label, 'string', errorMsgPrefix, 'Mandatory Label missing.');
        ensureExists(formula, 'string', errorMsgPrefix, 'Cannot store rule with empty source code.');
        ensureExists(computableConceptsArray[0], 'string', errorMsgPrefix, 'Mandatory computable concept missing.');
        for(var i in computableConceptsArray) {
            if(computableConceptsArray.hasOwnProperty(i)) {
                var cname = report.alignConceptPrefix(computableConceptsArray[i]);
                ensureConceptName(cname, 'computableConceptsArray', errorMsgPrefix, 'The computable concept name ' + cname + ' is not a valid concept name (correct pattern e.g. fac:Revenues).');
                var cconcept = report.getConcept(cname);
                if (cconcept === undefined || cconcept === null) {
                    throw new Error(errorMsgPrefix + ': the computable concept with name "' + cname + '" does not exist. You need to <b>create this concept</b> or adapt it to an existing one before you can create the rule.');
                }
                var rulesComputableConcepts = report.computableByRules(cname);
                if (rulesComputableConcepts.lenght > 0 && rulesComputableConcepts[0].Id !== id) {
                    throw new Error(errorMsgPrefix + ': A rule which can compute facts for concept "' + cname + '" exists already: "' + rulesComputableConcepts[0].Id + '. Currently, only one rule must be able to compute a fact for a certain concept.');
                }
            }
        }
        if(dependingConceptsArray !== null && typeof dependingConceptsArray === 'object') {
            for (var j in dependingConceptsArray) {
                if(dependingConceptsArray.hasOwnProperty(j)) {
                    var dname = report.alignConceptPrefix(dependingConceptsArray[j]);
                    ensureConceptName(dname, 'dependingConceptsArray', errorMsgPrefix, 'The dependency concept name ' + dname + ' is not a valid concept name (correct pattern e.g. fac:Revenues).');
                    var dconcept = report.getConcept(dname);
                    if (dconcept === undefined || dconcept === null) {
                        throw new Error(errorMsgPrefix + ': A concept with name "' + dname + '" does not exist (as used in the dependencies). You need to create this concept or remove it from the dependencies before you can create the rule.');
                    }
                }
            }
        }
        if(validatedConceptsArray !== null && typeof validatedConceptsArray === 'object') {
            for(var x in validatedConceptsArray) {
                if(validatedConceptsArray.hasOwnProperty(x)) {
                    var vname = report.alignConceptPrefix(validatedConceptsArray[x]);
                    ensureConceptName(vname, 'validatedConceptsArray', errorMsgPrefix, 'The validated concept name ' + vname + ' is not a valid concept name (correct pattern e.g. fac:Revenues).');
                    var vconcept = report.getConcept(vname);
                    if (vconcept === undefined || vconcept === null) {
                        throw new Error(errorMsgPrefix + ': The validated concept with name "' + vname + '" does not exist. You need to create this concept or adapt it to an existing one before you can create the rule.');
                    }
                }
            }
        }
    };

    Report.prototype.updateRule = function(rule){
        var id = rule.Id;
        var label = rule.Label;
        var language = rule.OriginalLanguage;
        var type = rule.Type;
        var description = rule.Description;
        var formula = rule.Formula;
        var computableConceptsArray = rule.ComputableConcepts;
        var dependingConceptsArray = rule.DependsOn;
        var validatedConceptsArray = rule.ValidatedConcepts;
        validate(this, 'Rule Updating Error', 'Update', id, label, type, description, formula, computableConceptsArray, dependingConceptsArray, validatedConceptsArray);
        if(type === 'xbrl28:formula' && language === undefined){
            this.setFormulaRule(id, label, description, formula, computableConceptsArray, dependingConceptsArray);
        } else if (type === 'xbrl28:validation' && language === undefined) {
            this.setValidationRule(id, label, description, formula, computableConceptsArray, dependingConceptsArray, validatedConceptsArray);
        } else if (language === 'SpreadsheetFormula') {
            var model = this.getModel();
            ensureExists(model, 'object', 'updateRule', 'Report doesn\'t have a model.');

            this.removeRule(id);
            model.Rules.push(rule);
        }
    };

    Report.prototype.createRule = function(rule){
        var id = rule.Id;
        var label = rule.Label;
        var language = rule.OriginalLanguage;
        var type = rule.Type;
        var description = rule.Description;
        var formula = rule.Formula;
        var computableConceptsArray = rule.ComputableConcepts;
        var dependingConceptsArray = rule.DependsOn;
        var validatedConceptsArray = rule.ValidatedConcepts;
        validate(this, 'Rule Creation Error', 'Create', id, label, type, description, formula, computableConceptsArray, dependingConceptsArray, validatedConceptsArray);
        if(type === 'xbrl28:formula' && language === undefined){
            this.setFormulaRule(id, label, description, formula, computableConceptsArray, dependingConceptsArray);
        } else if (type === 'xbrl28:validation' && language === undefined) {
            this.setValidationRule(id, label, description, formula, computableConceptsArray, dependingConceptsArray, validatedConceptsArray);
        } else if (language === 'SpreadsheetFormula') {
            var model = this.getModel();
            ensureExists(model, 'object', 'createRule', 'Report doesn\'t have a model.');

            if(model.Rules === null || model.Rules === undefined) {
                model.Rules = [];
            }
            model.Rules.push(rule);
        }
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

    Report.prototype.listValidatingRules = function(concept){

        var result = [];
        var model = this.getModel();
        if (model === null || model === undefined || model.Rules === null || model.Rules === undefined) {
            return result;
        }
        if (concept !== undefined && concept !== null) {
            ensureParameter(concept, 'concept', 'string', 'listValidatingRules');
            result = this.validatedByRules(concept);
        }
        return result;
    };

    Report.prototype.listRules = function(concept, rulesType){

        if(rulesType === undefined || rulesType === null) {
            var result = [];
            var model = this.getModel();
            if (model === null || model === undefined || model.Rules === null || model.Rules === undefined) {
                return result;
            }
            if (concept !== undefined && concept !== null) {
                ensureParameter(concept, 'concept', 'string', 'listRules');
                result = this.computableByRules(concept);
            } else {
                result = model.Rules;
            }
            return result;
        }else if(rulesType === 'xbrl28:formula'){
            return this.listFormulaRules(concept);
        }else if(rulesType === 'xbrl28:validation'){
            return this.listValidationRules(concept);
        }else if(rulesType === 'SpreadsheetFormula'){
            return this.listSpreadsheetRules(concept);
        }
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

    Report.prototype.listSpreadsheetRules = function(concept){
        var result = [];
        var rules = this.listRules(concept);
        for(var i in rules) {
            var rule = rules[i];
            if(rule.OriginalLanguage === 'SpreadsheetFormula'){
                result.push(rule);
            }
        }
        return result;
    };

    Report.prototype.alignConceptPrefix = function(concept){
        var prefix = this.getPrefix();
        var result;
        if(concept !== undefined && concept !== null && typeof concept === 'string') {
            if (concept.indexOf(':') === -1) {
                result = prefix + ':' + concept;
            } else {
                result = concept;
            }
        }
        return result;
    };

    Report.prototype.hideDefaultConceptPrefix = function(concept){
        var prefix = this.getPrefix();
        var result;
        if(concept !== undefined && concept !== null && typeof concept === 'string') {
            if(concept.indexOf(prefix + ':') === 0){
                result = concept.substring(prefix.length + 1);
            } else {
                result = concept;
            }
        }
        return result;
    };

    Report.prototype.hideDefaultConceptPrefixes = function(conceptsArray){
        var result = [];
        if(conceptsArray !== undefined && conceptsArray !== null && typeof conceptsArray === 'object') {
            for (var i in conceptsArray) {
                if(conceptsArray.hasOwnProperty(i)) {
                    var concept = conceptsArray[i];
                    result.push(this.hideDefaultConceptPrefix(concept));
                }
            }
        }
        return result;
    };

    Report.prototype.alignConceptPrefixes = function(conceptsArray){
        var result = [];
        if(conceptsArray !== undefined && conceptsArray !== null && typeof conceptsArray === 'object') {
            for (var i in conceptsArray) {
                var concept = conceptsArray[i];
                result.push(this.alignConceptPrefix(concept));
            }
        }
        return result;
    };

    return Report;
});
