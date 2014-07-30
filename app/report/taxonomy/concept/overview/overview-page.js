/*global browser:false, element:false, by:false */
'use strict';

function Overview(reportId, conceptName){
    this.reportId = reportId;
    this.conceptName = conceptName;
    this.form = {
        conceptLabel: element(by.model('conceptCopy.Label')),
        isAbstract: element(by.model('conceptCopy.IsAbstract'))
    };
}

Overview.prototype.visitPage = function(){
    browser.get('/' + this.reportId + '/concept/' + this.conceptName);
};

Overview.prototype.toggleAbstract = function(){
    this.form.isAbstract.click();
    //We wait for the report to be saved (no http requests pending)
    browser.waitForAngular();
};

Overview.prototype.deleteConcept = function(){
    element(by.css('.btn-danger')).click();
    //We wait for the report to be saved (no http requests pending)
    browser.waitForAngular();
};

Overview.prototype.changeLabel = function(label){
    this.form.conceptLabel.clear();
    this.form.conceptLabel.sendKeys(label);
    //We wait for the report to be saved (no http requests pending)
    browser.waitForAngular();
};

module.exports = Overview;
