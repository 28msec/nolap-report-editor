/*global browser:false, element:false, by:false */
'use strict';

function Edit(reportId, conceptName, ruleId){
    this.reportId = reportId;
    this.conceptName = conceptName;
    this.ruleId = ruleId;
    this.form = {
        hiddenRules: element(by.id('hiddenRules'))
    };
}

Edit.prototype.visitPage = function(){
    browser.get('/' + this.reportId + '/concept/' + this.conceptName + '/formula/computation/edit/' + this.ruleId);
};

module.exports = Edit;
