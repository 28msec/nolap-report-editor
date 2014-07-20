/*global browser:false, element:false, by:false */
'use strict';

var Report = function(id){
    this.id = id;
    this.elements = element.all(by.css('.angular-ui-tree-node'));
};

Report.prototype.get = function(){
    return browser.get('/' + this.id);  
};

Report.prototype.elementCount = function(){
    return this.elements.count();
};

module.exports = Report;