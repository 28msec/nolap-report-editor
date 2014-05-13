angular
.module('nolapReportEditor', [])
;angular
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
    Report.prototype.ensureNetworkShortName = function(networkShortName, paramName, functionName) {
        this.ensureParameter(networkShortName, paramName, 'string', functionName, /^Presentation$/g, 
            'invalid networkShortName parameter value passed "' + networkShortName + '" (allowed values: Presentation).');
    };

    Report.prototype.ensureConceptName = function(conceptName, paramName, functionName) {
        this.ensureParameter(conceptName, paramName, 'string', functionName, /^\w(\w|\d|[-_])*:(\w|\d|[-_])*$/g, 
            'function called with mandatory "' + paramName + '" parameter which is not a QName: ' + conceptName);
    };

    Report.prototype.ensureParameter = function(paramValue, paramName, paramType, functionName, regex, regexErrorMessage) {
        if(paramValue === null || paramValue === undefined) {
            throw new Error(functionName + ': function called without mandatory ' + paramName + ' parameter.');
        };
        if(typeof paramValue !== paramType) {
            throw new Error(functionName + ': function called with mandatory name parameter of type ' + typeof paramValue + ' instead of ' + paramType + '.');
        };
        if(regex !== undefined && paramValue.match(regex) === null) {
            throw new Error(functionName + ': ' + regexErrorMessage);
        };
    };

    Report.prototype.ensureExists = function(value, valueType, functionName, errorMessage) {
        if(value === null || value === undefined) {
            throw new Error(functionName + ': ' + errorMessage);
        }
        if(typeof value !== valueType) {
            throw new Error(functionName + ': Type exception: Expected type "' + valueType + '"');
        }
    };

    // helper to create a unique id
    Report.prototype.uuid = function () {
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
        this.ensureConceptName(name, 'name', 'addConcept');
        this.ensureParameter(label, 'label', 'string', 'addConcept');
        this.ensureParameter(abstract, 'abstract', 'boolean', 'addConcept');
        
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
        this.ensureConceptName(name, 'name', 'updateConcept');
        this.ensureParameter(label, 'label', 'string', 'updateConcept');
        this.ensureParameter(abstract, 'abstract', 'boolean', 'updateConcept');

        if(!this.existsConcept(name))
            throw new Error('updateConcept: cannot update concept with name "' + name + '" because it doesn\'t exist.');
       
        var model = this.getModel();
        var concept = this.getConcept(name);
        concept.Label = label;
        concept.IsAbstract = abstract;
    };

    Report.prototype.removeConcept = function(name) {
        this.ensureConceptName(name, 'name', 'removeConcept');

        if(!this.existsConcept(name))
            throw new Error('removeConcept: cannot remove concept with name "' + name + '" from model because it doesn\'t exist.');

        var model = this.getModel();
        delete model.Hypercubes['xbrl:DefaultHypercube']
            .Aspects['xbrl:Concept']
            .Domains['xbrl:ConceptDomain']
            .Members[name];
    };

    Report.prototype.existsConcept = function(conceptName) {
        this.ensureConceptName(conceptName, 'conceptName', 'existsConcept');

        var model = this.getModel();
        var concept = this.getConcept(conceptName);
        if(concept !== null && typeof concept === 'object')
          return true;
        return false;
    };

    Report.prototype.getConcept = function(conceptName) {
        this.ensureConceptName(conceptName, 'conceptName', 'getConcept');

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
        this.ensureNetworkShortName(networkShortName, 'networkShortName', 'getNetwork');
        
        var model = this.getModel();
        var networks = model.Networks
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
        for(child in children){
            if(children.hasOwnProperty(child)) {
                var childresult = this.findInSubTree(conceptName, children[child]);
                Array.prototype.push.apply(result, childresult);
            }
        }
        return result;
    };
    
    Report.prototype.findInTree = function(networkShortName, conceptName) {
        this.ensureNetworkShortName(networkShortName, 'networkShortName', 'findInTree');
        
        var network = this.getNetwork(networkShortName);
        var result = [];
        var children = network.Trees;
        for(child in children){
            if(children.hasOwnProperty(child)) {
                var childresult = this.findInSubTree(conceptName, children[child]);
                Array.prototype.push.apply(result, childresult);
            }
        }
        return result;
    };

    Report.prototype.getElementByIdFromSubTree = function(elementID, subtree) {
        if(subtree.Id === elementID){
            return subtree;
        }
        var children = subtree.To;
        for(child in children){
            if(children.hasOwnProperty(child)) {
                var childresult = this.getElementByIdFromSubTree(elementID, children[child]);
                if(childresult !== null)
                    return childresult;
            }
        }
        return null;
    };

    Report.prototype.getElementFromTree = function(networkShortName, elementID) {
        this.ensureNetworkShortName(networkShortName, 'networkShortName', 'getElementFromTree');
        this.ensureParameter(elementID, 'elementID', 'string', 'getElementFromTree');  
        
        var network = this.getNetwork(networkShortName);
        var element = null;
        var children = network.Trees;
        for(child in children){
            if(children.hasOwnProperty(child)) {
                var childresult = this.getElementByIdFromSubTree(elementID, children[child]);
                if(childresult !== null)
                    element = childresult;
            }
        }
        return element;
    };

    Report.prototype.getParentElementFromSubTree = function(elementID, subtree) {
        var children = subtree.To;
        for(child in children){
            if(children.hasOwnProperty(child)) {
                if(children[child].Id === elementID) {
                  return subtree;
                } else {
                  var childresult = this.getParentElementFromSubTree(elementID, children[child]);
                  if(childresult !== null)
                      return childresult;
                }
            }
        }
        return null;
    };

    Report.prototype.getParentElementFromTree = function(networkShortName, elementID) {
        this.ensureNetworkShortName(networkShortName, 'networkShortName', 'getParentElementFromTree');
        this.ensureParameter(elementID, 'elementID', 'string', 'getParentElementFromTree');  
        
        var network = this.getNetwork(networkShortName);
        var parent = null;
        var children = network.Trees;
        for(child in children){
            if(children.hasOwnProperty(child)) {
                var result = this.getParentElementFromSubTree(elementID, children[child]);
                if(result !== null)
                    parent = result;
            }
        }
        return parent;
    };

    Report.prototype.existsElementInTree = function(networkShortName, elementID) {
        this.ensureNetworkShortName(networkShortName, 'networkShortName', 'existsElementInTree');
        this.ensureParameter(elementID, 'elementID', 'string', 'existsElementInTree');  
        
        var element = this.getElementFromTree(networkShortName, elementID);
        if(element !== null && typeof element === 'object') {
          return true;
        }
        return false;
    };

    Report.prototype.createNewElement = function(concept, order) {
        this.ensureParameter(concept, 'concept', 'object', 'createNewElement'); 
        var _order = 1;
        if(order !== undefined) {
            this.ensureParameter(order, 'order', 'number', 'createNewElement'); 
            _order = order;
        }
        var element = {
            Id: this.uuid(),
            Name : concept.Name,
            Label : concept.Label,
            Order : _order
        };
        return element;
    };

    Report.prototype.addTreeChild = function(networkShortName, parentElementID, conceptName, order) {
        this.ensureNetworkShortName(networkShortName, 'networkShortName', 'addTreeChild');
        this.ensureConceptName(conceptName, 'conceptName', 'addTreeChild');
        var concept = this.getConcept(conceptName);
        this.ensureExists(concept, 'object', 'addTreeChild', 'concept with name "' + conceptName + '" doesn\'t exist.');

        if(parentElementID === undefined || parentElementID === null) {
            // add a root element
            var network = this.getNetwork(networkShortName);
            var element = this.createNewElement(concept, order);
            network.Trees[conceptName] = element;
            return element;

        } else {
            // add child to existing tree
            this.ensureParameter(parentElementID, 'parentElementID', 'string', 'addTreeChild');  
        
            var parent = this.getElementFromTree(networkShortName, parentElementID);
            this.ensureExists(parent, 'object', 'addTreeChild', 'cannot add child to tree. Parent with id "' + parentElementID + '" doesn\'t exist.');
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
        this.ensureNetworkShortName(networkShortName, 'networkShortName', 'setTreeElementOrder');
        this.ensureParameter(elementID, 'elementID', 'string', 'setTreeElementOrder');
        var _order = 1;
        if(order !== undefined) {
            this.ensureParameter(order, 'order', 'number', 'setTreeElementOrder'); 
            _order = order;
        }
        var element = this.getElementFromTree(networkShortName, elementID);
        this.ensureExists(element, 'object', 'setTreeElementOrder', 'Cannot set order. Element with id "' + elementID + '" doesn\'t exist.');
        element.Order = _order;
    };

    Report.prototype.moveTreeBranch = function(networkShortName, subtreeRootElementID, newParentElementID) {
        this.ensureNetworkShortName(networkShortName, 'networkShortName', 'moveTreeBranch');
        this.ensureParameter(subtreeRootElementID, 'subtreeRootElementID', 'string', 'moveTreeBranch');
        this.ensureParameter(newParentElementID, 'newParentElementID', 'string', 'moveTreeBranch');

        var newParent = this.getElementFromTree(networkShortName, newParentElementID);
        this.ensureExists(newParent, 'object', 'moveTreeBranch', 'Cannot move element with id "' + subtreeRootElementID + '" to new parent element with id "' + newParentElementID + '": Parent element doesn\'t exist.');
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
        this.ensureNetworkShortName(networkShortName, 'networkShortName', 'removeTreeBranch');
        this.ensureParameter(subtreeRootElementID, 'subtreeRootElementID', 'string', 'removeTreeBranch');

        var element = this.getElementFromTree(networkShortName, subtreeRootElementID);
        this.ensureExists(element, 'object', 'removeTreeBranch', 'Cannot remove element with id "' + subtreeRootElementID + '" from network: Element doesn\'t exist.');
        var parent = this.getParentElementFromTree(networkShortName, subtreeRootElementID);
        if(parent === null || parent === undefined) {
          var network = this.getNetwork(networkShortName);
          delete network.Trees[element.Name];
        } else {
          delete parent.To[element.Name];
        }
        return element;
    };

    return Report;
});
