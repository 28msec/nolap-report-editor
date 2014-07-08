'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    .state('report.taxonomy.concept', {
        url: '/:elementId',
        templateUrl: '/report/taxonomy/concept/concept.html',
        controller: 'ConceptCtrl',
        resolve: {
            element: [ '$stateParams', 'report', function($stateParams, report) {
                var elementId = $stateParams.elementId;
                if(elementId !== undefined && elementId !== null && elementId !== '') {
                    return report.getElementFromTree('Presentation', elementId);
                } else {
                    return undefined;
                }
            }],
            concept: [ '$stateParams', 'report', 'element', function($stateParams, report, element) {
                if(element !== undefined && element !== null){
                    return report.getConcept(element.Name);
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