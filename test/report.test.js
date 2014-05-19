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

    it('List concepts', function () {
        expect(report).not.toBeNull();
        var concepts = report.listConcepts();
                         
        expect(concepts.length).toBe(2);
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

    it('Add another root presentation element', function () {
        expect(report).not.toBeNull();
        var name = 'fac:Root2';
        var label = 'Another root';
        report.addConcept(name, label, true);

        var element = report.addTreeChild('Presentation', null, name);
        expect(element).not.toBeNull();
        expect(element.Id).not.toBeNull();
        expect(element.Id).toBeDefined();
        expect(element.Order).toBe(1);
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
    });

    it('Change order of element', function () {
        expect(report).not.toBeNull();
        var name = 'fac:Leaf';
        var order = 2;
        var elementID = report.findInTree('Presentation',name)[0];
        var element = report.getElementFromTree('Presentation',elementID);
        expect(element.Order).toBe(3);

        report.setTreeElementOrder('Presentation',elementID, 2);
        expect(element.Order).toBe(2);
    });

    it('Move Subtree', function () {
        expect(report).not.toBeNull();
        var name1 = 'fac:Leaf';
        var name2 = 'fac:Root2';
        var subtreeID = report.findInTree('Presentation',name1)[0];
        var oldParent = report.getParentElementFromTree('Presentation', subtreeID);
        var newParentID = report.findInTree('Presentation',name2)[0];
        var newParent = report.getElementFromTree('Presentation', newParentID);

        expect(Object.keys(oldParent.To).length).toBe(2);
        expect(newParent.To === undefined).toBe(true);

        report.moveTreeBranch('Presentation', subtreeID, newParentID);

        expect(Object.keys(oldParent.To).length).toBe(1);
        expect(Object.keys(newParent.To).length).toBe(1);
    });

    it('List trees', function () {
        expect(report).not.toBeNull();
        var trees = report.listTrees('Presentation');
        expect(trees.length).toBe(2);
    });

    // concept maps
    it('add a concept map', function () {
        expect(report).not.toBeNull();
        var from = 'fac:Leaf';
        var to = [ 'us-gaap:Assets', 'us-gaap:Something' ];
        report.addConceptMap(from, to);

        expect(report.existsConceptMap(from)).toBe(true);
        expect(report.findInConceptMap('us-gaap:Assets')[0]).toBe('fac:Leaf');
        expect(report.findInConceptMap('us-gaap:Something')[0]).toBe('fac:Leaf');
        expect(report.listConceptMaps().length).toBe(1);
    });

    it('create concept, add it to the presentation and in another concept map', function () {
        expect(report).not.toBeNull();
        var from = 'fac:Leaf2';
        var label = 'Another test leaf';
        var to = [ 'us-gaap:Revenues', 'us-gaap:Liabilities' ];
        report.addConcept(from, label, false);
        var root2ID = report.findInTree('Presentation','fac:Root2')[0];
        var element = report.addTreeChild('Presentation', root2ID, from, 3);
        report.addConceptMap(from, to);

        expect(report.existsConceptMap(from)).toBe(true);
        expect(report.findInConceptMap('us-gaap:Assets')[0]).toBe('fac:Leaf');
        expect(report.findInConceptMap('us-gaap:Something')[0]).toBe('fac:Leaf');
        expect(report.findInConceptMap('us-gaap:Revenues')[0]).toBe('fac:Leaf2');
        expect(report.findInConceptMap('us-gaap:Liabilities')[0]).toBe('fac:Leaf2');
        expect(report.listConceptMaps().length).toBe(2);
    });

    it('update concept map', function () {
        expect(report).not.toBeNull();
        var from = 'fac:Leaf';
        var to = [ 'us-gaap:CurrentAssets', 'us-gaap:Something2' ];
        report.updateConceptMap(from, to);

        expect(report.existsConceptMap(from)).toBe(true);
        expect(report.findInConceptMap('us-gaap:Assets')[0]).not.toBeDefined();
        expect(report.findInConceptMap('us-gaap:Something')[0]).not.toBeDefined();
        expect(report.findInConceptMap('us-gaap:CurrentAssets')[0]).toBe('fac:Leaf');
        expect(report.findInConceptMap('us-gaap:Something2')[0]).toBe('fac:Leaf');
        expect(report.findInConceptMap('us-gaap:Revenues')[0]).toBe('fac:Leaf2');
        expect(report.findInConceptMap('us-gaap:Liabilities')[0]).toBe('fac:Leaf2');
        expect(report.listConceptMaps().length).toBe(2);
    });

    it('remove concept map', function () {
        expect(report).not.toBeNull();
        var name = 'fac:Leaf';
        report.removeConceptMap(name);

        expect(report.existsConceptMap(name)).toBe(false);
        expect(report.findInConceptMap('us-gaap:Assets')[0]).not.toBeDefined();
        expect(report.findInConceptMap('us-gaap:Something')[0]).not.toBeDefined();
        expect(report.findInConceptMap('us-gaap:CurrentAssets')[0]).not.toBeDefined();
        expect(report.findInConceptMap('us-gaap:Something2')[0]).not.toBeDefined();
        expect(report.findInConceptMap('us-gaap:Revenues')[0]).toBe('fac:Leaf2');
        expect(report.findInConceptMap('us-gaap:Liabilities')[0]).toBe('fac:Leaf2');
        expect(report.listConceptMaps().length).toBe(1);
    });

    // rules
    it('create a formula rule', function () {
        expect(report).not.toBeNull();
        var id = 'bs_Equity';
        var label = 'Equity imputation';
        var description = 'If equity wasn\'t reported by the filer this rule will impute the value automatically.';
        var formula = 'upps';
        var computableConcepts = ['fac:Equity'];
        var dependingOn = ['fac:EquityAttributableToNoncontrollingInterest','fac:EquityAttributableToParent'];

        expect(report.existsRule(id)).toBe(false);
        report.setFormulaRule(id, label, description, formula, computableConcepts, dependingOn);

        expect(report.existsRule(id)).toBe(true);
        var rule = report.getRule(id);
        expect(rule.Id).toBe(id);
        expect(rule.Label).toBe(label);
        expect(rule.Description).toBe(description);
        expect(rule.Type).toBe('xbrl28:formula');
        expect(rule.Formula).toBe(formula);
        expect(rule.ComputableConcepts[0]).toBe(computableConcepts[0]);
        expect(rule.DependsOn[0]).toBe(dependingOn[0]);
        expect(report.listRules().length).toBe(1);
        expect(report.listFormulaRules().length).toBe(1);
        expect(report.listValidationRules().length).toBe(0);
    });

    it('create another formula rule', function () {
        expect(report).not.toBeNull();
        var id = 'bs_Assets';
        var label = 'Assets imputation';
        var description = 'If assets were not reported by the filer this rule will impute the value automatically.';
        var formula = 'for $facts in facts:facts-for-internal(( "fac:Assets", "fac:CurrentAssets", "fac:NoncurrentAssets", "fac:Liabilities", "fac:LiabilitiesAndEquity", "fac:Equity"), $hypercube, $aligned-filter, $concept-maps, $rules, $cache, $options) group by $canonical-filter-string := facts:canonically-serialize-object($facts, ($facts:CONCEPT, "_id", "IsInDefaultHypercube", "Type", "Value", "Decimals", "AuditTrails", "xbrl28:Type", "Balance")) let $Assets as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:Assets"] let $CurrentAssets as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:CurrentAssets"] let $NoncurrentAssets as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:NoncurrentAssets"] let $Liabilities as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:Liabilities"] let $LiabilitiesAndEquity as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:LiabilitiesAndEquity"] let $Equity as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:Equity"] let $unit := ($facts.$facts:ASPECTS.$facts:UNIT)[1] return switch (true) case exists($Assets) return $Assets case (exists($LiabilitiesAndEquity)) and (rules:decimal-value ($CurrentAssets) eq rules:decimal-value($LiabilitiesAndEquity)) return let $computed-value := rules:decimal-value($CurrentAssets) let $audit-trail-message := rules:fact-trail({ "Aspects" : { "xbrl:Unit" : $unit, "xbrl:Concept" : "fac:Assets" }, Value: $computed-value }) || " = " || rules:fact-trail($CurrentAssets, "CurrentAssets") let $source-facts := $CurrentAssets return rules:create-computed-fact( $LiabilitiesAndEquity, "fac:Assets", $computed-value, $rule, $audit-trail-message, $source-facts, $options) case (empty($NoncurrentAssets)) and (exists($LiabilitiesAndEquity)) and (rules:decimal-value($LiabilitiesAndEquity) eq (rules:decimal-value($Equity) + rules:decimal-value($Liabilities))) return let $computed-value := rules:decimal-value($CurrentAssets) let $audit-trail-message := rules:fact-trail({ "Aspects" : { "xbrl:Unit" : $unit, "xbrl:Concept" : "fac:Assets" }, Value: $computed-value }) || " = " || rules:fact-trail($CurrentAssets, "CurrentAssets") let $source-facts := $CurrentAssets return rules:create-computed-fact( $LiabilitiesAndEquity, "fac:Assets", $computed-value, $rule, $audit-trail-message, $source-facts, $options) default return ()';
        var computableConcepts = ['fac:Assets'];
        var dependingOn = ['fac:CurrentAssets','fac:NoncurrentAssets','fac:Liabilities','fac:LiabilitiesAndEquity','fac:Equity'];

        expect(report.existsRule(id)).toBe(false);
        report.setFormulaRule(id, label, description, formula, computableConcepts, dependingOn);

        expect(report.existsRule(id)).toBe(true);
        expect(report.existsRule('bs_Equity')).toBe(true);
        var rule = report.getRule(id);
        expect(rule.Id).toBe(id);
        expect(rule.Label).toBe(label);
        expect(rule.Description).toBe(description);
        expect(rule.Type).toBe('xbrl28:formula');
        expect(rule.Formula).toBe(formula);
        expect(rule.ComputableConcepts[0]).toBe(computableConcepts[0]);
        expect(rule.DependsOn[0]).toBe(dependingOn[0]);
        expect(report.listRules().length).toBe(2);
        expect(report.listFormulaRules().length).toBe(2);
        expect(report.listValidationRules().length).toBe(0);
    });

    it('update a formula rule', function () {
        expect(report).not.toBeNull();
        var id = 'bs_Equity';
        var label = 'Equity imputation';
        var description = 'If equity wasn\'t reported by the filer this rule will impute the value automatically.';
        var formula = 'for $facts in facts:facts-for-internal(( "fac:Equity", "fac:EquityAttributableToNoncontrollingInterest", "fac:EquityAttributableToParent"), $hypercube, $aligned-filter, $concept-maps, $rules, $cache, $options) group by $canonical-filter-string := facts:canonically-serialize-object($facts, ($facts:CONCEPT, "_id", "IsInDefaultHypercube", "Type", "Value", "Decimals", "AuditTrails", "xbrl28:Type", "Balance")) let $Equity as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:Equity"] let $EquityAttributableToNoncontrollingInterest as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:EquityAttributableToNoncontrollingInterest"] let $EquityAttributableToParent as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:EquityAttributableToParent"] let $unit := ($facts.$facts:ASPECTS.$facts:UNIT)[1] return switch(true) case (exists($Equity)) return $Equity case (exists($EquityAttributableToNoncontrollingInterest) or exists($EquityAttributableToParent)) return let $computed-value := rules:decimal-value($EquityAttributableToNoncontrollingInterest) + rules:decimal-value($EquityAttributableToParent) let $audit-trail-message := rules:fact-trail({ "Aspects" : { "xbrl:Unit" : $unit, "xbrl:Concept" : "fac:Equity" }, Value: $computed-value }) || " = " || rules:fact-trail($EquityAttributableToNoncontrollingInterest, "EquityAttributableToNoncontrollingInterest") || " + " || rules:fact-trail($EquityAttributableToParent, "EquityAttributableToParent") let $source-facts := ($EquityAttributableToNoncontrollingInterest, $EquityAttributableToParent) return rules:create-computed-fact( $source-facts[1], "fac:Equity", $computed-value, $rule, $audit-trail-message, $source-facts, $options) default return ()';
        var computableConcepts = ['fac:Equity', 'fac:Leaf2'];
        var dependingOn = ['fac:EquityAttributableToNoncontrollingInterest','fac:EquityAttributableToParent'];

        expect(report.existsRule(id)).toBe(true);
        report.setFormulaRule(id, label, description, formula, computableConcepts, dependingOn);

        expect(report.existsRule(id)).toBe(true);
        expect(report.existsRule('bs_Assets')).toBe(true);
        var rule = report.getRule(id);
        expect(rule.Id).toBe(id);
        expect(rule.Label).toBe(label);
        expect(rule.Description).toBe(description);
        expect(rule.Type).toBe('xbrl28:formula');
        expect(rule.Formula).toBe(formula);
        expect(rule.ComputableConcepts[0]).toBe(computableConcepts[0]);
        expect(rule.DependsOn[0]).toBe(dependingOn[0]);
        expect(report.listRules().length).toBe(2);
        expect(report.listFormulaRules().length).toBe(2);
        expect(report.listValidationRules().length).toBe(0);
    });

    it('remove a formula rule', function () {
        expect(report).not.toBeNull();
        var id = 'bs_Assets';
        expect(report.existsRule(id)).toBe(true);
        report.removeRule(id);
        expect(report.existsRule(id)).toBe(false);
        expect(report.listRules().length).toBe(1);
        expect(report.listFormulaRules().length).toBe(1);
        expect(report.listValidationRules().length).toBe(0);
    });

    it('create a validation rule', function () {
        expect(report).not.toBeNull();
        var id = 'BS1';
        var label = 'Equity validation';
        var description = 'Equity validation';
        var formula = 'upps';
        var computableConcepts = ['fac:EquityValidation'];
        var dependingOn = ['fac:EquityAttributableToNoncontrollingInterest','fac:EquityAttributableToParent'];
        var validatedConcepts = ['fac:Equity'];

        expect(report.existsRule(id)).toBe(false);
        report.setValidationRule(id, label, description, formula, computableConcepts, dependingOn,validatedConcepts);

        expect(report.existsRule(id)).toBe(true);
        var rule = report.getRule(id);
        expect(rule.Id).toBe(id);
        expect(rule.Label).toBe(label);
        expect(rule.Description).toBe(description);
        expect(rule.Type).toBe('xbrl28:validation');
        expect(rule.Formula).toBe(formula);
        expect(rule.ComputableConcepts[0]).toBe(computableConcepts[0]);
        expect(rule.DependsOn[0]).toBe(dependingOn[0]);
        expect(report.listRules().length).toBe(2);
        expect(report.listFormulaRules().length).toBe(1);
        expect(report.listValidationRules().length).toBe(1);
    });

    it('update a validation rule', function () {
        expect(report).not.toBeNull();
        var id = 'BS1';
        var label = 'Equity validation';
        var description = 'Equity validation';
        var formula = 'for $facts in facts:facts-for-internal(( "fac:Equity", "fac:EquityAttributableToParent", "fac:EquityAttributableToNoncontrollingInterest"), $hypercube, $aligned-filter, $concept-maps, $rules, $cache, $options) group by $canonical-filter-string := facts:canonically-serialize-object($facts, ($facts:CONCEPT, "_id", "IsInDefaultHypercube", "Type", "Value", "Decimals", "AuditTrails", "xbrl28:Type", "Balance")) let $Equity as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:Equity"] let $EquityAttributableToParent as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:EquityAttributableToParent"] let $EquityAttributableToNoncontrollingInterest as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "fac:EquityAttributableToNoncontrollingInterest"] where exists($Equity) return let $test := rules:decimal-value($Equity) eq ( rules:decimal-value($EquityAttributableToParent) + rules:decimal-value($EquityAttributableToNoncontrollingInterest)) let $audit-trail-message := rules:fact-trail($Equity) || (if($test) then " = " else " != ") || "( " || rules:fact-trail($EquityAttributableToParent,"EquityAttributableToParent") || " + " || rules:fact-trail($EquityAttributableToNoncontrollingInterest,"EquityAttributableToNoncontrollingInterest") || ")" let $source-facts := ( $EquityAttributableToParent, $EquityAttributableToNoncontrollingInterest) return rules:create-computed-fact( $Equity, "fac:EquityValidation", $test, $rule, $audit-trail-message, $source-facts, $options, $Equity, $test)';
        var computableConcepts = ['fac:EquityValidation'];
        var dependingOn = ['fac:EquityAttributableToNoncontrollingInterest','fac:EquityAttributableToParent', 'fac:Leaf2'];
        var validatedConcepts = ['fac:Equity', 'fac:Leaf2'];

        expect(report.existsRule(id)).toBe(true);
        report.setValidationRule(id, label, description, formula, computableConcepts, dependingOn,validatedConcepts);

        expect(report.existsRule(id)).toBe(true);
        var rule = report.getRule(id);
        expect(rule.Id).toBe(id);
        expect(rule.Label).toBe(label);
        expect(rule.Description).toBe(description);
        expect(rule.Type).toBe('xbrl28:validation');
        expect(rule.Formula).toBe(formula);
        expect(rule.ComputableConcepts[0]).toBe(computableConcepts[0]);
        expect(rule.DependsOn[0]).toBe(dependingOn[0]);
        expect(report.listRules().length).toBe(2);
        expect(report.listFormulaRules().length).toBe(1);
        expect(report.listValidationRules().length).toBe(1);
    });

    it('remove a concept which is still used in the report', function () {
        expect(report).not.toBeNull();
        var name = 'fac:Leaf2';
        try {
            report.removeConcept(name);
        } catch (ex) {
            if (ex !== null && ex !== undefined && ex.name === 'ConceptIsStillReferencedError') {
                expect(ex.message.match(/"fac:Leaf2".*is still referenced in the report/g)).not.toBeNull();
                var refs = ex.references;
                expect(refs.Presentation.length).toBe(1);
                expect(refs.ConceptMaps.length).toBe(1);
                expect(refs.Rules.length).toBe(2);
            }else{
                throw ex;
            }
        }

        // console.log(JSON.stringify(report));
    });

});
