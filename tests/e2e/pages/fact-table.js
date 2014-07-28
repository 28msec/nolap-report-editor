/*global browser:false, element:false, by:false */
'use strict';

var FactTable = function(id){
    this.id = id;
};

FactTable.prototype.get = function(){
    return browser.get('/' + this.id + '/fact-table');  
};

FactTable.prototype.lineCount = function(){
    return element.all(by.repeater('item in data | filter : search')).count();
};

module.exports = FactTable;
