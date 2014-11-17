'use strict';

//GetAttribute() returns "boolean" values and will return either "true" or null
describe('Import-Export', function(){
    var _ = require('lodash');

    var Reports = require('../../app/reports/reports-page');
    var Report = require('../../app/report/report-page');
    var reports = new Reports();

    var path = require('path');
    var invalidReportFile = path.resolve(__dirname, './data/invalid-report.json');
    var validReportFile = path.resolve(__dirname, './data/Fundamental_Accounting_Concepts.xbrlb');
    var reportsCount;

    it('Should list reports', function() {
        reports.visitPage();
        reports.list.count().then(function(count){
          reportsCount = count;
          expect(count).toBeGreaterThan(1);
        });
    });

    it('Should not import invalid report', function() {
        reports.fillInImportReport(invalidReportFile, undefined);
        expect(reports.import.errorMsg.isDisplayed()).toBe(true);
        reports.import.btn.cancel.click();
        expect(reports.list.count()).toBe(reportsCount);
    });

    it('Should import valid report', function() {
        reports.fillInImportReport(validReportFile, "Import test");
        expect(reports.import.errorMsg.isDisplayed()).toBe(false);
        //browser.pause();
        reports.import.btn.ok.click();
        expect(reports.list.count()).toBe(reportsCount+1);
    });

});
