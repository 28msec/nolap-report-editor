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

Spreadsheet.prototype.getCellValue = function(cell){
    return cell.element(by.css('div > span.ng-binding'));
};

Spreadsheet.prototype.getFactDetailsModal = function(){
    return element.all(by.css('div.fact-details'));
};

Spreadsheet.prototype.getValidationStampsDetails = function(success){
    if (success === true){
        return element.all(by.css('tr.validation-stamp-row.bg-success'));
    } else if (success === false){
        return element.all(by.css('tr.validation-stamp-row.bg-warning'));
    }
    return element.all(by.css('tr.validation-stamp-row'));
};

module.exports = Spreadsheet;
