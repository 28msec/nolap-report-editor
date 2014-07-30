/*global browser:false, element:false, by:false */
'use strict';

function Facts(id){
    this.id = id;
}

Facts.prototype.visitPage = function(){
    return browser.get('/' + this.id + '/facts'); 
};

Facts.prototype.lineCount = function(){
    return element.all(by.repeater('item in data | filter : search')).count();
};

module.exports = Facts;
