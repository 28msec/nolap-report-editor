/*global browser:false, element:false, by:false */
'use strict';

var _ = require('lodash');

var AppPage = require('../app-page.js').AppPage;

function Reports(){
    AppPage.call(this);
    this.list = element.all(by.repeater('report in reports'));
    this.deleteBtn = element(by.id('delete-reports'));
    this.exportBtn = element(by.id('export-report'));
    this.createBtn = element(by.id('create-report'));
    this.toggle = element(by.model('toggle'));
    this.checkboxes = element.all(by.model('selectedReports[report._id]'));

    this.importBtn = element(by.id('import-report'));
    this.import = {};
    this.import.form = element(by.name('importReportForm'));
    this.import.fileUpload = element(by.css('input.fileUploadBtn'));
    this.import.errorMsg = element(by.id('import-error-message'));
    this.import.btn = {};
    this.import.btn.ok = element(by.id('import-ok'));
    this.import.btn.cancel = element(by.id('import-cancel'));
}
Reports.prototype = _.create(AppPage.prototype);

Reports.prototype.visitPage = function(){
    return browser.get('/');
};

Reports.prototype.selectTemplate = function(reportId){
    element(by.id('template-' + reportId)).click();
};

Reports.prototype.createReport = function(reportName, templateReportId){
    this.createBtn.click();
    var createReportBtn = element(by.id('create-report-btn'));
    var reportNameField = element(by.model('report.name'));
    if(templateReportId !== undefined){
        this.selectTemplate(templateReportId);
    }
    reportNameField.clear();
    reportNameField.sendKeys(reportName);
    createReportBtn.click();
};

Reports.prototype.fillInImportReport = function(reportFilePath){
    this.importBtn.click();
    this.import.fileUpload.sendKeys(reportFilePath);
};

Reports.prototype.getLastModified = function(report) {
    return report.element(by.css('td[data-last-modified]')).getAttribute('data-last-modified');
};

Reports.prototype.findReport = function(reportName){
    return this.list.map(function(report){
        return {
            name: report.element(by.binding('report.Label')).getText(),
            checkbox: report.element(by.model('selectedReports[report._id]'))
        };
    })
    .then(function(reports){
        return reports.filter(function(report){
            return report.name === reportName;
        });
    });
};

Reports.prototype.selectReport = function(reportName){
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
    }).then(function(report){
        if(report === undefined){
            console.log('checkbox not found for report: ' + reportName);
            return;
        }
        return report.checkbox.click();
    });
};

Reports.prototype.deleteReport = function(reportName){
  this.selectReport(reportName);
  this.deleteBtn.click();
  return element(by.id('confirm-delete-reports')).click();
};


module.exports = Reports;
