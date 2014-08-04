describe('Check Presentation Tree Processing ', function () {
    'use strict';

    var scope, rootScope, createController, defaultRootElementId;
    var defaultConceptName = 'ReportLineItems';

    beforeEach(inject(function($rootScope, $controller, Report) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.report = new Report('My Report', 'Label', 'Description', 'Role', 'w@28.io');
        var elementIds = scope.report.findInTree('Presentation', defaultConceptName);
        defaultRootElementId = elementIds[0];
        createController = function() {
            return $controller('TaxonomyCtrl', {
                '$scope': scope
            });
        };
    }));
    

    it('Creates a presentation tree with a non abstract element.', function(){
        expect(defaultRootElementId).toBeDefined();
        createController();
        expect(scope.report.getNetwork('Presentation').Trees).toBeDefined();
        expect(scope.report.getNetwork('Presentation').Trees).not.toEqual({});
        scope.report.addConcept('mr:assets', 'Assets', false);
        var concept = scope.report.getConcept('mr:assets');
        scope.report.addElement('Presentation', defaultRootElementId, concept.Name, 0);
        scope.loadPresentationTree();
        var assetsElementId = scope.report.findInTree('Presentation', 'mr:assets')[0];
        var assetsElement = scope.report.getElementFromTree('Presentation', assetsElementId);
        expect(assetsElement.Name).toBe('mr:assets');
        expect(assetsElement).toBeDefined();
        expect(assetsElement.children).not.toBeDefined();
    });

    it('Should transform the presentation tree into another tree that can be processed by the UI.', function(){
        expect(defaultRootElementId).toBeDefined();
        createController();
        expect(scope.report.getNetwork('Presentation').Trees).toBeDefined();
        expect(scope.report.getNetwork('Presentation').Trees).not.toEqual({});
        scope.report.addConcept('mr:assets', 'Assets', true);
        var concept = scope.report.getConcept('mr:assets');
        scope.report.addElement('Presentation', defaultRootElementId, concept.Name, 0);
        scope.loadPresentationTree();
        var assetsElementId = scope.report.findInTree('Presentation', 'mr:assets')[0];
        var assetsElement = scope.report.getElementFromTree('Presentation', assetsElementId);
        expect(assetsElement.Name).toBe('mr:assets');
        expect(assetsElement).toBeDefined();
        expect(assetsElement.children).not.toBeDefined();
    });
});
