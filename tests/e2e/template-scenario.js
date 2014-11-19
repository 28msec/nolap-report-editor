'use strict';

//GetAttribute() returns "boolean" values and will return either "true" or null
describe('Report Templates', function(){
    var _ = require('lodash');

    var Reports = require('../../app/reports/reports-page');
    var Report = require('../../app/report/report-page');
    var reports = new Reports();
    var report, reportName, conceptName;

    it('Should create a new report from a template', function(){
        reports.visitPage();
        reportName = 'Hello Template ' + Math.floor((Math.random() * 10) + 1);
        reports.createReport(reportName, 'FundamentalAccountingConcepts');
        reports.getCurrentUrl()
        .then(function(url){
            var id = _.last(url.split('/'));
            report = new Report(id);
            expect(report.searchBox.isPresent()).toBe(true);
            expect(report.label.getText()).toBe(reportName);
        });
    });
    
    it('Should already contain an element fac:FundamentalAccountingConceptsLineItems', function(){
        report.goToTaxonomy().concepts.goToConcept('fac:FundamentalAccountingConceptsLineItems');
        var concept = report.taxonomy.getConcept('fac:FundamentalAccountingConceptsLineItems');
        expect(concept.label.getAttribute('value')).toBe('Fundamental Accounting Concepts [Line Items]');
        expect(report.taxonomy.elements.count()).toBe(107);
        expect(report.taxonomy.rootElements.count()).toBe(1);
    });

    it('Should delete created report', function() {
        reports.visitPage();
        reports.list.count().then(function(count){
            reports.deleteReport(reportName).then(function(){
                expect(reports.list.count()).toBe(count - 1);
            });
        });
    });
});
