/*global browser:false, element:false, by:false */
'use strict';

function Spreadsheet(id){
    this.id = id;
    this.table = element(by.css('table.rendering'));
    this.dataRows = element.all(by.repeater('headerGroup in yHeaderGroups'));
}

Spreadsheet.prototype.visitPage = function(){
    return browser.get('/' + this.id + '/spreadsheet');  
};

Spreadsheet.prototype.getValueTDsByHeaderContainingText = function(containedText){
    return element.all(
        by.xpath('//table[@class="rendering"]' +
                 '/tbody/tr[@ng-repeat="headerGroup in yHeaderGroups"]' +
                 '[contains(./td[@ng-include="headerTemplate"]/span/text(),' +
                            '"' + containedText + '")]' +
                 '/td[@ng-include="dataTemplate"]'));
};

Spreadsheet.prototype.getCellValueByCss = function(css){
    return this.table.element(by.css(css)).getText();
};

module.exports = Spreadsheet;
