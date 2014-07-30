describe('Check Presentation Tree Processing ', function () {
    'use strict';

    var scope, rootScope, createController;

    beforeEach(inject(function($rootScope, $controller, Report) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.report = new Report('My Report', 'Label', 'Description', 'Role', 'w@28.io');
        createController = function() {
            return $controller('TaxonomyCtrl', {
                '$scope': scope
            });
        };
    }));
    

    it('Creates a presentation tree with a non abstract element.', function(){
        createController();
        expect(scope.report.getNetwork('Presentation').Trees).toBeDefined();
        expect(scope.report.getNetwork('Presentation').Trees).toEqual({});
        scope.report.addConcept('mr:assets', 'Assets', false);
        var concept = scope.report.getConcept('mr:assets');
        scope.report.addElement('Presentation', undefined, concept.Name, 0);
        scope.loadPresentationTree();
        expect(scope.report.getNetwork('Presentation').Trees['mr:assets'].children).not.toBeDefined();
    });

    it('Should transform the presentation tree into another tree that can be processed by the UI.', function(){
        createController();
        expect(scope.report.getNetwork('Presentation').Trees).toBeDefined();
        expect(scope.report.getNetwork('Presentation').Trees).toEqual({});
        scope.report.addConcept('mr:assets', 'Assets', true);
        var concept = scope.report.getConcept('mr:assets');
        scope.report.addElement('Presentation', undefined, concept.Name, 0);
        scope.loadPresentationTree();
        expect(scope.report.getNetwork('Presentation').Trees['mr:assets'].children).not.toBeDefined();
    });
});