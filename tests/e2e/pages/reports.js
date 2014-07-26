/*global browser:false, element:false, by:false */
'use strict';

var Reports = function(){
    browser.waitForAngular();
    this.list = element.all(by.repeater('report in reports'));
    this.deleteBtn = element(by.id('delete-reports'));
    this.createBtn = element(by.id('create-report'));
    this.toggle = element(by.model('toggle'));
    this.checkboxes = element.all(by.model('selectedReports[report._id]'));
};


Reports.prototype.get = function(){
    return browser.get('/');  
};

Reports.prototype.createReport = function(reportName){
    this.createBtn.click();
    var form = element(by.name('newReportForm'));
    var reportNameField = element(by.model('report.name'));
    reportNameField.clear();
    reportNameField.sendKeys(reportName);
    return form.submit();
};

module.exports = Reports;
