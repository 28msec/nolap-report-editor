describe('Concepts Model API Tests', function () {

    var report = null;

    it('Create a New Report', function () {
        var name = 'Report Name';
        var label = 'Report for Testing';
        var description = 'This Report is not intended to be used in production';
        var role = 'http://www.28.io/nolap/test';
        report = new Report(name, label, description, role);
        var model = report.getModel();
        expect(model._id).toBeDefined();
        expect(model._id).toEqual(name);
    });

    // concepts
    it('Add a Concept', function () {
        expect(report).not.toBeNull();
        var name = 'us-gaap:PensionAndOtherPostretirementBenefitsDisclosureTextBlock';
        var label = 'Pension and Other Postretirement Benefits Disclosure [Text Block]';
        report.addConcept(name, label, false);
                         
        expect(report.existsConcept(name)).toBe(true);
        expect(report.getConcept(name).Name).toBe(name);
        expect(report.getConcept(name).Label).toBe(label);
        expect(report.getConcept(name).IsAbstract).toBe(false);
    });

    it('Add an abstract Concept', function () {
        expect(report).not.toBeNull();
        var name = 'fac:Test';
        var label = 'A Test Concept';
        report.addConcept(name, label, true);
                         
        expect(report.existsConcept(name)).toBe(true);
        expect(report.getConcept(name).Name).toBe(name);
        expect(report.getConcept(name).Label).toBe(label);
        expect(report.getConcept(name).IsAbstract).toBe(true);
    });

    it('Add another non-abstract Concept', function () {
        expect(report).not.toBeNull();
        var name = 'fac:Leaf';
        var label = 'A reportable Concept';
        report.addConcept(name, label, false);
                         
        expect(report.existsConcept(name)).toBe(true);
        expect(report.getConcept(name).Name).toBe(name);
        expect(report.getConcept(name).Label).toBe(label);
        expect(report.getConcept(name).IsAbstract).toBe(false);
    });

    it('Update a Concept', function () {
        expect(report).not.toBeNull();
        var name = 'us-gaap:PensionAndOtherPostretirementBenefitsDisclosureTextBlock';
        var label = 'Pensions';
        report.updateConcept(name, label, true);
                         
        expect(report.existsConcept(name)).toBe(true);
        expect(report.getConcept(name).Name).toBe(name);
        expect(report.getConcept(name).Label).toBe(label);
        expect(report.getConcept(name).IsAbstract).toBe(true);
    });

    it('Remove a Concept', function () {
        expect(report).not.toBeNull();
        var name = 'us-gaap:PensionAndOtherPostretirementBenefitsDisclosureTextBlock';
        report.removeConcept(name);
                         
        expect(report.existsConcept(name)).toBe(false);
    });

    // trees
    it('Add a presentation element', function () {
        expect(report).not.toBeNull();
        var name = 'fac:Test';
        var element = report.addTreeChild('Presentation', null, name, 4);
                      
        expect(element).not.toBeNull();
        expect(element.Id).not.toBeNull();
        expect(element.Id).toBeDefined();
        expect(report.existsElementInTree('Presentation',element.Id)).toBe(true);
    });

    it('Add another presentation element', function () {
        expect(report).not.toBeNull();
        var name = 'fac:Leaf';
        var parentID = report.findInTree('Presentation','fac:Test');
        var element = report.addTreeChild('Presentation', parentID[0], name, 3);
                      
        expect(element).not.toBeNull();
        expect(element.Id).not.toBeNull();
        expect(element.Id).toBeDefined();
        expect(report.existsElementInTree('Presentation',element.Id)).toBe(true);
    });

    it('Add duplicate presentation element', function () {
        expect(report).not.toBeNull();
        var name = 'fac:Test';
        var parentID = report.findInTree('Presentation','fac:Test');
        var element = report.addTreeChild('Presentation', parentID[0], name, 2);
                      
        expect(element).not.toBeNull();
        expect(element.Id).not.toBeNull();
        expect(element.Id).toBeDefined();
        expect(report.existsElementInTree('Presentation',element.Id)).toBe(true);
    });

    it('Add presentation element to non-abstract', function () {
        expect(report).not.toBeNull();
        var name = 'fac:Test';
        var parentID = report.findInTree('Presentation','fac:Leaf');
        try {
            report.addTreeChild('Presentation', parentID[0], name, 2);
        } catch (ex) {
          expect(ex.message.match(/"fac:Leaf" is not abstract/g)).not.toBeNull();
        }
                      
        console.log(JSON.stringify(report));
    });

});
