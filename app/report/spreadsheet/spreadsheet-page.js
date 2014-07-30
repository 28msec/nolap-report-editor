/*global browser:false, element:false, by:false */
'use strict';

function Spreadsheet(id){
    this.id = id;
    this.table = element(by.css('table.rendering'));
}

Spreadsheet.prototype.visitPage = function(){
    return browser.get('/' + this.id + '/spreadsheet');  
};

Spreadsheet.prototype.getCellValueByCss = function(css){
    return this.table.element(by.css(css)).getText();
};

module.exports = Spreadsheet;