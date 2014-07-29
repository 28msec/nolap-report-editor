/*global browser:false, element:false, by:false */
'use strict';

var Synonyms = function(id, conceptName){
    this.id = id;
    this.conceptName = conceptName;
    this.list = element.all(by.repeater('key in synonyms'));
};

Synonyms.prototype.visitPage = function(){
    browser.get('/' + this.id + '/concept/' + this.conceptName + '/synonyms');  
};

Synonyms.prototype.addSynonym = function(synonym){
    var form = element(by.name('add-synonym-form'));
    var input = form.element(by.name('synonym-value'));
    input.clear();
    input.sendKeys(synonym);
    form.submit();
};

Synonyms.prototype.getName = function(synonym){
    return synonym.element(by.binding('key')).getText();
};

module.exports = Synonyms;