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
        this.dirtyModel = null;
    };

    Report.prototype.getModel = function(){
        return this.model;    
    };

    Report.prototype.getDirtyModel = function(){
        if(this.dirtyModel === null) {
            this.dirtyModel = this.model;
        }// else model already dirty
        return this.dirtyModel;
    };

    Report.prototype.commitDirtyModel = function(){
        if(this.dirtyModel !== null) {
            this.model = this.dirtyModel;
            this.dirtyModel = null;
        }// else no dirty model
    };

    Report.prototype.addConcept = function(name, label, abstract) {
        if(name === null) 
            throw new Error('addConcept: function called without mandatory name parameter');
        if(typeof name !== 'string')
            throw new Error('addConcept: function called with mandatory name parameter of type ' + typeof name + ' instead of string.');
        if(name.match(/^\w(\w|\d|[-_])*:(\w|\d|[-_])*$/g) === null)
            throw new Error('addConcept: function called with mandatory name parameter which is not a QName: ' + name );
        
        if(this.existsConcept(name))
            throw new Error('addConcept: concept with name "' + name + '" already exists.');

        var model = this.getDirtyModel();
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
        var model = this.getDirtyModel();

        if(!this.existsConcept(name))
            throw new Error('updateConcept: cannot update concept with name "' + name + '" because it doesn\'t exist.');
       
        var concept = this.getConcept(name);
        concept.Label = label;
        concept.IsAbstract = abstract;
    };

    Report.prototype.removeConcept = function(name) {
        var model = this.getDirtyModel();

        if(!this.existsConcept(name))
            throw new Error('removeConcept: cannot remove concept with name "' + name + '" from model because it doesn\'t exist.');

        delete model.Hypercubes['xbrl:DefaultHypercube']
            .Aspects['xbrl:Concept']
            .Domains['xbrl:ConceptDomain']
            .Members[name];
    };

    Report.prototype.existsConcept = function(conceptName) {
        var model = this.getDirtyModel();
        var concept = this.getConcept(conceptName);
        if(concept !== null && typeof concept === 'object')
          return true;
        return false;
    };

    Report.prototype.getConcept = function(conceptName) {
        var model = this.getDirtyModel();
        var concept = 
          model.Hypercubes['xbrl:DefaultHypercube']
              .Aspects['xbrl:Concept']
              .Domains['xbrl:ConceptDomain']
              .Members[conceptName];
        return concept;
    };

    return Report;
});
