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

    it('Add a Concept', function () {
        expect(report).not.toBeNull();
        var name = 'us-gaap:PensionAndOtherPostretirementBenefitsDisclosureTextBlock';
        var label = 'Pension and Other Postretirement Benefits Disclosure [Text Block]';
        report.addConcept(name, label, false);
                         
        var model = report.getModel();
        expect(report.existsConcept(name)).toBe(true);
    });
});
