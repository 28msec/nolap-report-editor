describe('Check Concept updating ', function () {
    'use strict';

    var scope, rootScope, createController;
    var assetsElement;

    beforeEach(inject(function($rootScope, $controller, Report) {
        rootScope = $rootScope;
        scope = $rootScope.$new();

        // create report
        scope.report = new Report('slfkjalrfjweoila', 'Hello World', 'Description', 'Role', 'd@28.io');

        //create concepts
        scope.report.addConcept('hw:hierarchy', 'Hierarchy', true);
        scope.report.addConcept('hw:Assets', 'Revenues', false);

        // add concepts to presentation tree
        var hierarchyElement = scope.report.createNewElement('hw:hierarchy');
        assetsElement = scope.report.createNewElement('hw:Assets');
        scope.report.addElement('Presentation', null, hierarchyElement, 0);
        scope.report.addElement('Presentation', null, assetsElement, 0);

        // put concept into scope
        scope.concept = scope.report.getConcept('hw:Assets');

        createController = function() {
            return $controller('ConceptOverviewCtrl', {
                '$scope': scope
            });
        };
    }));
    

    it('changes the label in the presentation tree elements when changing a concept label.', function(){
        createController();
        expect(scope.report.getNetwork('Presentation').Trees).toBeDefined();
        expect(scope.report.findInTree('Presentation','hw:Assets').length).toEqual(1);
        expect(assetsElement.Label).toEqual('Revenues');
        expect(scope.concept).toEqual(scope.conceptCopy);

        scope.conceptCopy.Label = 'Assets';
        expect(scope.concept).not.toEqual(scope.conceptCopy);

        scope.updateConcept();

        expect(scope.report.findInTree('Presentation','hw:Assets').length).toEqual(1);
        expect(scope.concept).toEqual(scope.conceptCopy);
        expect(assetsElement.Label).toEqual('Assets');
    });

});
