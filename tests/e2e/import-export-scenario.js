'use strict';

//GetAttribute() returns "boolean" values and will return either "true" or null
describe('Import-Export', function(){
    
    var Reports = require('../../app/reports/reports-page');
    var reports = new Reports();

    var path = require('path');
    var invalidReportFile = path.resolve(__dirname, './data/invalid-report.json');
    var validReportFile = path.resolve(__dirname, './data/Fundamental_Accounting_Concepts.xbrlb');
    var reportsCount;
    var reportName = 'Import test';

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
        reports.fillInImportReport(validReportFile, reportName);
        expect(reports.import.errorMsg.isDisplayed()).toBe(false);
        expect(reports.import.newReportNameChkbx.isSelected()).toBe(true);
        expect(reports.import.newReportName.getAttribute('value')).toBe(reportName);
        reports.import.btn.ok.click();
        reports.findReport(reportName).then(function(found){
          expect(found.length).toBeGreaterThan(0);
        });
        expect(reports.list.count()).toBe(reportsCount+1);
    });

    it('Should not display export button', function() {
        expect(reports.exportBtn.isDisplayed()).toBe(false);
    });

    it('Should display export button', function() {
        reports.selectReport(reportName);
        expect(reports.exportBtn.isDisplayed()).toBe(true);
    });

    it('Should not display export button in case more than one report', function() {
        reports.selectReport('Fundamental Accounting Concepts');
        expect(reports.exportBtn.isDisplayed()).toBe(false);
    });

    // reset
    it('Should remove imported report', function() {
        reports.visitPage();
        reports.deleteReport(reportName);
        expect(reports.list.count()).toBe(reportsCount);
        // export button should disappear after deletion
        expect(reports.exportBtn.isDisplayed()).toBe(false);
    });

});
