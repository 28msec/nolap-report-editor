'use strict';

//GetAttribute() returns "boolean" values and will return either "true" or null
describe('Report', function(){
    var _ = require('lodash');

    var Reports = require('../../app/reports/reports-page');
    var Report = require('../../app/report/report-page');
    var reports = new Reports();
    var report, reportName, conceptName;

    it('Should create a new empty report', function(){
        reports.visitPage();
        reportName = 'HelloWorld' + Math.floor((Math.random() * 10) + 1);
        reports.createReport(reportName);
        reports.getCurrentUrl()
        .then(function(url){
            var id = _.last(url.split('/'));
            report = new Report(id);
            report.visitPage();
            expect(report.searchBox.isPresent()).toBe(true);
            expect(report.label.getText()).toBe(reportName);
        });
    });
    
    it('Should already contain an element', function(){
        var concept = report.taxonomy.getConcept('h:ReportLineItems');
        concept.visitPage();
        expect(concept.label.getAttribute('value')).toBe(reportName);
        expect(report.taxonomy.elements.count()).toBe(1);
        expect(report.taxonomy.rootElements.count()).toBe(1);
    });

    it('Shouldn\'t create a new concept with an invalid name', function(){
        conceptName = 'hello World';
        var concepts = report.taxonomy.concepts;
        concepts.visitPage();
        concepts.createConcept(conceptName);
        expect(concepts.errorMessage.isDisplayed()).toBe(true);
        expect(concepts.errorMessage.getText()).toBe('Invalid Concept Name');
    });
    
    it('Should create a new concept (1)', function(){
        conceptName = 'h:helloWorldID';
        var concepts = report.taxonomy.concepts;
        concepts.visitPage();
        concepts.createConcept(conceptName);
        var concept = report.taxonomy.getConcept(conceptName);
        concept.visitPage();
        expect(concept.label.getAttribute('value')).toBe('Hello World ID');
    });
    
    
    it('Should create a new concept (2)', function(){
        conceptName = 'h:assets';
        var concepts = report.taxonomy.concepts;
        concepts.visitPage();
        concepts.createConcept(conceptName);
        var concept = report.taxonomy.getConcept(conceptName);
        concept.visitPage();
        expect(concept.label.getAttribute('value')).toBe('Assets');
    });

    it('Creates a new element', function(){
        // this should fail because only one root element is allowed:
        report.taxonomy.getConcept(conceptName).createElement();
        expect(report.taxonomy.elements.count()).toBe(1);
        expect(report.taxonomy.rootElements.count()).toBe(1);
        // as a child it should work:
        report.taxonomy.getConcept(conceptName).createElement('h:ReportLineItems');
        expect(report.taxonomy.elements.count()).toBe(2);
        expect(report.taxonomy.rootElements.count()).toBe(1);
    });
    
    it('Renames the concept label', function(){
        var overview = report.taxonomy.getConcept(conceptName).getOverview();
        overview.visitPage();
        expect(overview.form.conceptLabel.getAttribute('value')).toBe('Assets');
        overview.changeLabel('Assets Label');
        expect(overview.form.conceptLabel.getAttribute('value')).toBe('Assets Label');
    });

    it('Creates a us-gaap:Assets synonym', function(){
        var synonyms = report.taxonomy.getConcept(conceptName).getSynonyms();
        synonyms.visitPage();
        expect(synonyms.list.count()).toBe(0);
        synonyms.addSynonym('us-gaap:Assets');
        synonyms.addSynonym('us-gaap:AssetsCurrent');
        synonyms.addSynonym('us-gaap:AssetsCurrent');
        expect(synonyms.list.count()).toBe(2);
        expect(synonyms.getName(synonyms.list.first())).toBe('us-gaap:Assets');
        expect(synonyms.getName(synonyms.list.last())).toBe('us-gaap:AssetsCurrent');
    });
    
    it('Should display the fact table', function() {
        report.filters.visitPage();
        report.facts.visitPage()
        .then(function(){
            expect(report.facts.lineCount()).toBeGreaterThan(0);
        });
    });

    it('Should display the preview', function() {
        report.spreadsheet.visitPage();
        expect(report.spreadsheet.getCellValueByCss('.first-row-header-row > td > span')).toBe(reportName);
    });

    it('Should delete report', function() {
        reports.visitPage();
        reports.list.count().then(function(count){
            reports.deleteReport(reportName).then(function(){
                expect(reports.list.count()).toBe(count - 1);
            });
        });
    });
});
