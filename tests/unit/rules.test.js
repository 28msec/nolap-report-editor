describe('Rules Model API Tests', function () {
    'use strict';

    /* global rule and report */
    var report = null;
    var rule = null;

    it('Instantiate a New Rule', function () {
        var name = 'Report Name';
        var label = 'Report for Testing';
        var description = 'This Report is not intended to be used in production';
        var role = 'http://www.28.io/nolap/test';
        var prefix = 'test';
        report = new Report(name, label, description, role, prefix);

        var type = 'xbrl28:formula';
        var computableConcept = 'Assets';
        var language = 'SpreadsheetFormula';
        try {
            rule = new Rule(type, report, computableConcept, language);
        } catch (ex) {
            expect(ex.message.match(/Concept with name Assets does not exist/g)).not.toBeNull();
        }
        report.addConcept('Assets', 'Assets', false);
        rule = new Rule(type, report, computableConcept, language);
        var ruleLabel = 'Assets imputation';
        var ruleDesc = 'Rule to compute Assets (test:Assets).';
        var model = rule.getModel();
        model.Label = ruleLabel;
        model.Description = ruleDesc;
    });

    it('Add alternatives', function () {
        var model = rule.getModel();
        expect(model.Formulae.length).toEqual(1);
        var alt1 = model.Formulae[0];
        alt1.SourceFact = [ 'LiabilitiesAndEquity' ];
        alt1.PrereqSrc = 'CurrentAssets = LiabilitiesAndEquity';
        alt1.BodySrc = 'CurrentAssets';
        
        rule.addAlternative();
        expect(model.Formulae.length).toEqual(2);
        var alt2 = model.Formulae[1];
        alt2.SourceFact = [ 'LiabilitiesAndEquity' ];
        alt2.PrereqSrc = 'and(isblank(NoncurrentAssets),LiabilitiesAndEquity=Equity+Liabilities)';
        alt2.BodySrc = 'CurrentAssets';
           
        // dependent concepts missing
        rule.compile();
        expect(rule.validate('Create')).toEqual(false);
        expect(model.DependsOnErr.match(/The following depending concepts do not exist/g)).not.toBeNull();
        expect(model.DependsOnErr.match(/test:CurrentAssets/g)).not.toBeNull();
        expect(model.DependsOnErr.match(/test:LiabilitiesAndEquity/g)).not.toBeNull();
        expect(model.DependsOnErr.match(/test:NoncurrentAssets/g)).not.toBeNull();
        expect(model.DependsOnErr.match(/test:Equity/g)).not.toBeNull();
        expect(model.DependsOnErr.match(/test:Liabilities/g)).not.toBeNull();
        expect(model.valid).toBe(false);
    });

    it('Add missing concepts', function () {
        var model = rule.getModel();
        report.addConcept('LiabilitiesAndEquity', 'LiabilitiesAndEquity', false);
        report.addConcept('CurrentAssets', 'CurrentAssets', false);
        report.addConcept('NoncurrentAssets', 'NoncurrentAssets', false);
        report.addConcept('Equity', 'Equity', false);

        // still one concept missing
        rule.compile();
        expect(rule.validate('Create')).toEqual(false);
        expect(model.DependsOnErr.match(/The depending concept "test:Liabilities" does not exist/g)).not.toBeNull();
        expect(model.valid).toBe(false);

        report.addConcept('Liabilities', 'Liabilities', false);
        rule.compile();
        expect(rule.validate('Create')).toEqual(true);
        expect(model.IdErr).not.toBeDefined();
        expect(model.LabelErr).not.toBeDefined();
        expect(model.DescriptionErr).not.toBeDefined();
        expect(model.OriginalLanguageErr).not.toBeDefined();
        expect(model.ComputableConceptsErr).not.toBeDefined();
        expect(model.DependsOnErr).not.toBeDefined();
        expect(model.Err).not.toBeDefined();
        expect(model.FormulaErr).not.toBeDefined();
        expect(model.FormulaeErr).not.toBeDefined();
        expect(model.Formulae[0].valid).toBe(true);
        expect(model.Formulae[1].valid).toBe(true);
        expect(model.valid).toBe(true);
    });

    it('Add rule to report', function () {
        var ruleLabel = 'Assets imputation';
        var ruleDesc = 'Rule to compute Assets (test:Assets).';
        var model = rule.getModel();
        var id = model.Id;
        expect(report.existsRule(id)).toBe(false);

        report.createRule(rule.getRule());
        expect(report.existsRule(id)).toBe(true);
        var persistedRule = report.model.Rules[0];
        expect(persistedRule.Id).toEqual(id);
        expect(persistedRule.Label).toEqual(ruleLabel);
        expect(persistedRule.Description).toEqual(ruleDesc);
        expect(persistedRule.Type).toEqual('xbrl28:formula');
        expect(persistedRule.OriginalLanguage).toEqual('SpreadsheetFormula');
        expect(persistedRule.ComputableConcepts).toContain('test:Assets');
        expect(persistedRule.DependsOn).toContain('test:CurrentAssets');
        expect(persistedRule.DependsOn).toContain('test:LiabilitiesAndEquity');
        expect(persistedRule.DependsOn).toContain('test:NoncurrentAssets');
        expect(persistedRule.DependsOn).toContain('test:Equity');
        expect(persistedRule.DependsOn).toContain('test:Liabilities');
        expect(persistedRule.AllowCrossPeriod).toBe(true);
        expect(persistedRule.AllowCrossBalance).toBe(true);
        expect(persistedRule.Formula).toBeDefined();
        expect(persistedRule.Formula).not.toBeNull();

        //console.log(JSON.stringify(rule.getRule()));
        //console.log(JSON.stringify(report.getModel()));
    });

});
