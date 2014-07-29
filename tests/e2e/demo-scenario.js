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
    
    it('Should create a new concept (1)', function(){
        conceptName = 'h:helloWorldID';
        report.taxonomy.visitPage();
        report.taxonomy.createConcept(conceptName);
        var concept = report.taxonomy.getConcept(conceptName);
        concept.visitPage();
        expect(concept.label.getText()).toBe('Hello World ID');
    });
    
    
    it('Should create a new concept (2)', function(){
        conceptName = 'h:assets';
        report.taxonomy.visitPage();
        report.taxonomy.createConcept(conceptName);
        var concept = report.taxonomy.getConcept(conceptName);
        concept.visitPage();
        expect(concept.label).toBe('Assets');
    });

    it('Creates a new element', function(){
        report.taxonomy.getConcept(conceptName).createElement();
        expect(report.taxonomy.elements.count()).toBe(1);
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
        browser.waitForAngular();
        report.factTable.visitPage();
        expect(report.factTable.lineCount()).toBeGreaterThan(0);
    });

    it('Should display the preview', function() {
        report.preview.visitPage();
        //browser.waitForAngular();
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
