describe('Check Concept updating ', function () {
    'use strict';

    var scope, rootScope, createController;

    beforeEach(inject(function($rootScope, $controller, Report) {
        rootScope = $rootScope;
        scope = $rootScope.$new();

        scope.report = new Report('slfkjalrfjweoila', 'Hello World', 'Description', 'Role', 'd@28.io');
        scope.report.addConcept('hw:hierarchy', 'Hierarchy', true);
        scope.concept = scope.report.getConcept('hw:hierarchy');

        createController = function() {
            return $controller('ConceptOverviewCtrl', {
                '$scope': scope
            });
        };
    }));
    

    it('Basic checks on the Overview controller.', function(){
        //Controller instanciate smoothly
        createController();
        //The concept display in the form of the page is a copy
        expect(scope.concept).toEqual(scope.conceptCopy);
        expect(scope.concept === scope.conceptCopy).toBe(false);

        //Update Concept runs smoothly
        scope.conceptCopy.Label = 'Assets';
        expect(scope.concept).not.toEqual(scope.conceptCopy);
        scope.updateConcept();
    });

});
