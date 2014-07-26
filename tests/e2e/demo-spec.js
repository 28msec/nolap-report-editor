/*global browser:false, element:false, by:false */
'use strict';

//GetAttribute() returns "boolean" values and will return either "true" or null
describe('Report', function(){
    var _ = require('lodash');

    var Reports = require('./pages/reports');
    var Report = require('./pages/report');
    var reports = new Reports();
    var report, conceptName;
    
    describe('Report Creation', function(){
        it('Should create a new empty report', function(){
            reports.get();
            var reportName = 'HelloWorld' + Math.floor((Math.random() * 10) + 1);
            reports.createReport(reportName).then(function(){
                expect(element(by.model('conceptName')).isPresent()).toBe(true);
                expect(element(by.binding('report.model.Label')).getText()).toBe(reportName);
                browser.getCurrentUrl().then(function(url){
                    var id = _.last(url.split('/'));
                    report = new Report(id);
                });
            });
        });
        
        it('Should create a new concept', function(){
            conceptName = 'h:assets';
            report.taxonomy.createConcept(conceptName);
            expect(element(by.id('concept')).element(by.binding('concept.Name')).getText()).toBe(conceptName);
        });
        
        it('Creates a new element', function(){
            report.taxonomy.createElement(conceptName);
            expect(report.elementCount()).toBe(1);
        });
        
        it('Creates a us-gaap:Assets synonym', function(){
            var synonyms = report.taxonomy.getSynonyms(conceptName);
            synonyms.addSynonym('us-gaap:Assets');
            expect(synonyms.count()).toBe(1);
        });
        
        it('Should display the fact table', function() {
            report.filters.get();
            browser.waitForAngular();
            report.factTable.get();
            expect(report.factTable.lineCount()).toBeGreaterThan(0);
        });
    });
});