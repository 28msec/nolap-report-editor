'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.taxonomy.concept', {
        url: '/:conceptId',
        Controller: 'ConceptCtrl',
        templateUrl: '/report/taxonomy/concept/concept.html',
        resolve: {
            report: [ 'report', function(report) {
                return report;
            }],
            concept: [ '$stateParams', 'report', function($stateParams, report) {
                var conceptId = $stateParams.conceptId;
                if(conceptId !== undefined && conceptId !== null && conceptId !== '') {
                    var element = report.getElementFromTree('Presentation', conceptId);
                    if(element !== undefined && element !== null){
                        return report.getConcept(element.Name);
                    }
                } else {
                    return undefined;
                }
            }],
            conceptName: [ 'concept' , function(concept){
                if(concept !== undefined && concept !== null) {
                    return concept.Name;
                } else {
                    return undefined;
                }
            }]
        }
    });
})
;