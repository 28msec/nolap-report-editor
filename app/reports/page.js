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
    browser.get('/');  
};

Reports.prototype.createReport = function(reportName){
    this.createBtn.click();
    var form = element(by.name('newReportForm'));
    var reportNameField = element(by.model('report.name'));
    reportNameField.clear();
    reportNameField.sendKeys(reportName);
    form.submit();
};

Reports.prototype.getLastModified = function(report) {
    return report.element(by.css('td[data-last-modified]')).getAttribute('data-last-modified');
};

Reports.prototype.deleteReport = function(reportName){
    var that = this;
    return this.list.map(function(report){
        return {
            name: report.element(by.binding('report.Label')).getText(),
            checkbox: report.element(by.model('selectedReports[report._id]'))
        };
    })
    .then(function(reports){
        return reports.filter(function(report){
            return report.name === reportName;
        })[0];
    })
    .then(function(report){
        report.checkbox.click();
        that.deleteBtn.click();
        return element(by.id('confirm-delete-reports')).click();
    });
};


module.exports = Reports;