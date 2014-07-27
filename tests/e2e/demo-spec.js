/*global browser:false */
'use strict';

//GetAttribute() returns "boolean" values and will return either "true" or null
describe('Report', function(){
    var _ = require('lodash');

    var Reports = require('./pages/reports');
    var Report = require('./pages/report');
    var reports = new Reports();
    var report, reportName, conceptName;
    
        it('Should create a new empty report', function(){
            reports.get();
            reportName = 'HelloWorld' + Math.floor((Math.random() * 10) + 1);
            reports.createReport(reportName);
            browser.getCurrentUrl()
            .then(function(url){
                var id = _.last(url.split('/'));
                report = new Report(id);
                return report.get();
            })
            .then(function(){
                expect(report.searchBox.isPresent()).toBe(true);
                expect(report.label).toBe(reportName);
            });
        });
        
        it('Should create a new concept', function(){
            conceptName = 'h:assets';
            report.taxonomy.get();
            report.taxonomy.createConcept(conceptName);
            expect(report.taxonomy.conceptName).toBe(conceptName);
        });
        
        it('Creates a new element', function(){
            report.taxonomy.createElement(conceptName);
            expect(report.elementCount()).toBe(1);
        });
        
        it('Creates a us-gaap:Assets synonym', function(){
            var synonyms = report.taxonomy.getSynonyms(conceptName);
            synonyms.get();
            synonyms.addSynonym('us-gaap:Assets');
            expect(synonyms.count()).toBe(1);
        });
        
        it('Should display the fact table', function() {
            report.filters.get();
            browser.waitForAngular();
            report.factTable.get();
            expect(report.factTable.lineCount()).toBeGreaterThan(0);
        });
        
        it('Should delete report', function() {
            reports.get();
            reports.list.count().then(function(count){
                reports.deleteReport(reportName).then(function(){
                    expect(reports.list.count()).toBe(count - 1);
                });
            });
        });
});
