'use strict';

angular
.module('report-model', [])
.factory('GenericReport', function(AbstractReport) {

    var GenericReport = function(modelOrName, label, description, role, username, prefix){
        this.super(modelOrName, label, description, role, username, prefix);
    };

    GenericReport.prototype=new AbstractReport();
    GenericReport.prototype.type='GenericReport';

    GenericReport.prototype.newModel = function(id, label, description, username, role, prefix){
        return {
            '_id' : id,
            'Archive' : null,
            'Label' : label,
            'Description': description,
            'Owner': username,
            'Role' : role,
            'Prefix': prefix,
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
                'xbrl:DefaultHypercube': {
                    'Name': 'xbrl:DefaultHypercube',
                    'Label': label + ' [Table]',
                    'Aspects': {
                        'xbrl:Concept': {
                            'Name': 'xbrl:Concept',
                            'Label': 'Concept',
                            'Domains': {
                                'xbrl:ConceptDomain': {
                                    'Name': 'xbrl:ConceptDomain',
                                    'Label': 'Implicit XBRL Concept Domain',
                                    'Members': {
                                    }
                                }
                            }
                        },
                        'xbrl:Period': {
                            'Name': 'xbrl:Period',
                            'Label': 'Period'
                        },
                        'xbrl:Entity': {
                            'Name': 'xbrl:Entity',
                            'Label': 'Reporting Entity',
                            'Kind' : 'TypedDimension',
                            'Type' : 'string'
                        },
                        'xbrl:Unit': {
                            'Name': 'xbrl:Unit',
                            'Label': 'Unit',
                            'Default': 'xbrl:NonNumeric'
                        },
                        'xbrl28:Archive': {
                            'Name': 'xbrl28:Archive',
                            'Label': 'Archive ID'
                        }
                    }
                }
            },
            'Rules' : [],
            'Filters' : {
                'cik' : [  ],
                'tag' : [ ],
                'fiscalYear' : [ ],
                'fiscalPeriod' : [ ],
                'fiscalPeriodType' : [ ],
                'sic' : [  ]
            }
        };
    };

    GenericReport.prototype.hasSufficientFilters = function(){
        return true;
    };

    GenericReport.prototype.newDefinitionModel = function(label, role, source) {
        return [ {
            'ModelKind' : 'DefinitionModel',
            'Labels' : [ label ],
            'Parameters' : {

            },
            'Breakdowns' : {
                'x' : [ {
                    'BreakdownLabels' : [ 'Reporting Entity Breakdown' ],
                    'BreakdownTrees' : [ {
                        'Kind' : 'Rule',
                        'Abstract' : true,
                        'Labels' : [ 'Reporting Entity [Axis]' ],
                        'Children' : [ {
                            'Kind' : 'Aspect',
                            'Aspect' : 'xbrl:Entity'
                        } ]
                    } ]
                }, {
                    'BreakdownLabels' : [ 'Reporting Period Breakdown' ],
                    'BreakdownTrees' : [ {
                        'Kind': 'Rule',
                        'Abstract': true,
                        'Labels': [ 'Period [Axis]' ],
                        'Children': [ {
                            'Kind': 'Aspect',
                            'Aspect': 'xbrl:Period'
                        } ]
                    }]
                } ],
                'y' : [ {
                    'BreakdownLabels' : [ 'Breakdown on concepts' ],
                    'BreakdownTrees' : [ {
                        'Kind' : 'ConceptRelationship',
                        'LinkName' : 'link:presentationLink',
                        'LinkRole' : role,
                        'ArcName' : 'link:presentationArc',
                        'ArcRole' : 'http://www.xbrl.org/2003/arcrole/parent-child',
                        'RelationshipSource' : source,
                        'FormulaAxis' : 'descendant',
                        'Generations' : 0
                    } ]
                } ]
            },
            'TableFilters' : {

            }
        } ];
    };

    return GenericReport;
});

