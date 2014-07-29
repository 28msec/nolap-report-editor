/*global browser:false, element:false, by:false */
'use strict';

function Overview(reportId, conceptName){
    this.reportId = reportId;
    this.conceptName = conceptName;
    this.form = {};
    this.form.conceptLabel = element(by.model('conceptCopy.Label'));
    this.form.isAbstract = element(by.model('conceptCopy.IsAbstract'));
}

Overview.prototype.visitPage = function(){
    browser.get('/' + this.reportId + '/concept/' + this.conceptName);
};

Overview.prototype.changeLabel = function(label){
    this.form.conceptLabel.clear();
    this.form.conceptLabel.sendKeys(label);
};

module.exports = Overview;
