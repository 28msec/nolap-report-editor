/*global browser:false, element:false, by:false */
'use strict';

function Recompile(reportId){
    this.reportId = reportId;
    this.recompileBtn = element(by.id('btn-recompile'));
    this.errorMessages = 
        element.all(
            by.xpath('//div[contains(@class, "recompile-message") and contains(@class, "bg-danger")]'));
    this.successMessages = 
        element.all(
            by.xpath('//div[contains(@class, "recompile-message") and contains(@class, "bg-success")]'));
}

Recompile.prototype.visitPage = function(){
    browser.get('/' + this.reportId + '/recompile');
};

Recompile.prototype.recompileAndValidateFormulas = function(){
    this.recompileBtn.click();
};

module.exports = Recompile;
