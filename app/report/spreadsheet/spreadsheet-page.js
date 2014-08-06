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

Spreadsheet.prototype.getValuesByHeaderContainingText = function(containedText){
    return this.dataRows
        .filter(function(elem){
            return elem.element(by.css('td.header > span'))
                   .getText()           
                   .then(function(text){                
                       return text.indexOf(containedText) > -1;            
                   });
        })
        .then(function(foundElems){     
            var results = [];
            foundElems
            .forEach(function(elem){
                elem.element(by.css('td.NumericValue > div > span.ng-binding'))
                .getText()    
                .then(function(text){         
                    results.push(text);    
                });
            });
            return results;
        });
};

Spreadsheet.prototype.getCellValueByCss = function(css){
    return this.table.element(by.css(css)).getText();
};

module.exports = Spreadsheet;
