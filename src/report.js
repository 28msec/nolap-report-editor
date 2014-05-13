angular
.module('nolapReportEditor')
.factory('Report', function(){

    //Constructor
    var Report = function(model_or_name, label, description, role){
        if ( model_or_name === null) {
            throw new Error('new Report creation with null');
        } else if (typeof model_or_name !== 'object' &&
                   typeof model_or_name !== 'string') {
            throw new Error('new Report creation with invalid type ' + typeof model_or_name);
        } else if (typeof model_or_name === 'object') {
            this.model = model_or_name;
        } else if (typeof model_or_name === 'string'){
            this.model =
                {
                    '_id' : model_or_name,
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
                        }],
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

    // helper function to check parameters
    var ensureNetworkShortName = function(networkShortName, paramName, functionName) {
        ensureParameter(networkShortName, paramName, 'string', functionName, /^(Presentation)|(ConceptMap)$/g, 
            'invalid networkShortName parameter value passed "' + networkShortName + '" (allowed values: Presentation).');
    };

    var ensureConceptName = function(conceptName, paramName, functionName) {
        ensureParameter(conceptName, paramName, 'string', functionName, /^\w(\w|\d|[-_])*:(\w|\d|[-_])*$/g, 
            'function called with mandatory "' + paramName + '" parameter which is not a QName: ' + conceptName);
    };

    var ensureParameter = function(paramValue, paramName, paramType, functionName, regex, regexErrorMessage) {
        if(paramValue === null || paramValue === undefined) {
            throw new Error(functionName + ': function called without mandatory ' + paramName + ' parameter.');
        }
        if(typeof paramValue !== paramType) {
            throw new Error(functionName + ': function called with mandatory name parameter of type ' + typeof paramValue + ' instead of ' + paramType + '.');
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
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        return s.join("");
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
        
        if(this.existsConcept(name))
            throw new Error('addConcept: concept with name "' + name + '" already exists.');

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
        ensureParameter(abstract, 'abstract', 'boolean', 'updateConcept');

        if(!this.existsConcept(name))
            throw new Error('updateConcept: cannot update concept with name "' + name + '" because it doesn\'t exist.');
       
        var model = this.getModel();
        var concept = this.getConcept(name);
        concept.Label = label;
        concept.IsAbstract = abstract;
    };

    Report.prototype.removeConcept = function(name) {
        ensureConceptName(name, 'name', 'removeConcept');

        if(!this.existsConcept(name))
            throw new Error('removeConcept: cannot remove concept with name "' + name + '" from model because it doesn\'t exist.');

        var model = this.getModel();
        delete model.Hypercubes['xbrl:DefaultHypercube']
            .Aspects['xbrl:Concept']
            .Domains['xbrl:ConceptDomain']
            .Members[name];
    };

    Report.prototype.existsConcept = function(conceptName) {
        ensureConceptName(conceptName, 'conceptName', 'existsConcept');

        var model = this.getModel();
        var concept = this.getConcept(conceptName);
        if(concept !== null && typeof concept === 'object')
          return true;
        return false;
    };

    Report.prototype.getConcept = function(conceptName) {
        ensureConceptName(conceptName, 'conceptName', 'getConcept');

        var model = this.getModel();
        var concept = 
          model.Hypercubes['xbrl:DefaultHypercube']
              .Aspects['xbrl:Concept']
              .Domains['xbrl:ConceptDomain']
              .Members[conceptName];
        return concept;
    };

    /**********************
     ** Trees API
     **********************/
    Report.prototype.getNetwork = function(networkShortName) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'getNetwork');
        
        var model = this.getModel();
        var networks = model.Networks;
        for(var i in networks) {
            var network = networks[i];
            if(networks.hasOwnProperty(i) &&
                network.ShortName === networkShortName){
                return network;
            }
        }
    };

    Report.prototype.findInSubTree = function(conceptName, subtree) {
        var result = [];
        if(subtree.Name == conceptName){
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
                if(childresult !== null)
                    return childresult;
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
                if(childresult !== null)
                    element = childresult;
            }
        }
        return element;
    };

    var getParentElementFromSubTree = function(elementID, subtree) {
        var children = subtree.To;
        for(var child in children){
            if(children.hasOwnProperty(child)) {
                if(children[child].Id === elementID) {
                  return subtree;
                } else {
                  var childresult = getParentElementFromSubTree(elementID, children[child]);
                  if(childresult !== null)
                      return childresult;
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
                if(result !== null)
                    parent = result;
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

    Report.prototype.createNewElement = function(concept, order) {
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

    Report.prototype.addTreeChild = function(networkShortName, parentElementID, conceptName, order) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'addTreeChild');
        ensureConceptName(conceptName, 'conceptName', 'addTreeChild');
        var concept = this.getConcept(conceptName);
        ensureExists(concept, 'object', 'addTreeChild', 'concept with name "' + conceptName + '" doesn\'t exist.');

        if(parentElementID === undefined || parentElementID === null) {
            // add a root element
            var network = this.getNetwork(networkShortName);
            var rootElement = this.createNewElement(concept, order);
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

            var element = this.createNewElement(concept, order);
            if(parent.To === undefined || parent.To === null) {
              parent.To = {};
            }
            parent.To[conceptName] = element;

            return element;
        }
    };

    Report.prototype.setTreeElementOrder = function(networkShortName, elementID, order) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'setTreeElementOrder');
        ensureParameter(elementID, 'elementID', 'string', 'setTreeElementOrder');
        var _order = 1;
        if(order !== undefined) {
            ensureParameter(order, 'order', 'number', 'setTreeElementOrder'); 
            _order = order;
        }
        var element = this.getElementFromTree(networkShortName, elementID);
        ensureExists(element, 'object', 'setTreeElementOrder', 'Cannot set order. Element with id "' + elementID + '" doesn\'t exist.');
        element.Order = _order;
    };

    Report.prototype.moveTreeBranch = function(networkShortName, subtreeRootElementID, newParentElementID) {
        ensureNetworkShortName(networkShortName, 'networkShortName', 'moveTreeBranch');
        ensureParameter(subtreeRootElementID, 'subtreeRootElementID', 'string', 'moveTreeBranch');
        ensureParameter(newParentElementID, 'newParentElementID', 'string', 'moveTreeBranch');

        var newParent = this.getElementFromTree(networkShortName, newParentElementID);
        ensureExists(newParent, 'object', 'moveTreeBranch', 'Cannot move element with id "' + subtreeRootElementID + '" to new parent element with id "' + newParentElementID + '": Parent element doesn\'t exist.');
        var parentConcept = this.getConcept(newParent.Name);
        if(!parentConcept.IsAbstract) {
            throw new Error('moveTreeBranch: cannot move element to target parent "' + newParentElementID + 
                '". Reason: Parent concept "' + newParent.Name  + '" is not abstract.');
        }

        var element = this.removeTreeBranch(networkShortName, subtreeRootElementID);
        if(newParent.To === undefined || newParent.To === null) {
            newParent.To = {};
        }
        newParent.To[element.Name] = element;
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

    return Report;
});
