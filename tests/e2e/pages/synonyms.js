/*global browser:false, element:false, by:false */
'use strict';

var Synonyms = function(id, conceptName){
    this.id = id;
    this.conceptName = conceptName;
};

Synonyms.prototype.get = function(){
    return browser.get('/' + this.id + '/concept/' + this.conceptName + '/synonyms');  
};

Synonyms.prototype.addSynonym = function(synonym){
    var form = element(by.name('add-synonym-form'));
    var input = form.element(by.name('synonym-value'));
    input.clear();
    input.sendKeys(synonym);
    return form.submit();
};

Synonyms.prototype.count = function(){
    return element.all(by.repeater('key in synonyms')).count();
};

module.exports = Synonyms;
