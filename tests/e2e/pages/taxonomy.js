/*global browser:false, element:false, by:false */
'use strict';

var Synonyms = require('./synonyms');

var Taxonomy = function(id){
    this.id = id;
};

Taxonomy.prototype.getSynonyms = function(conceptName) {
    var synonyms = new Synonyms(this.id, conceptName);
    synonyms.get();
    return synonyms;
};

Taxonomy.prototype.get = function(){
    return browser.get('/' + this.id);  
};

Taxonomy.prototype.createConcept = function(conceptName){
    var input = element(by.model('conceptName'));
    input.clear();
    input.sendKeys(conceptName);
    var createConceptBtn = element.all(by.repeater('match in matches track by $index')).last();
    createConceptBtn.click();
};

Taxonomy.prototype.createElement = function(conceptName, parent, offset){
    offset = offset ? offset : 0;
    browser.get('/' + this.id + '/concept/' + conceptName +'?action=addElement&parent=' + parent + '&offset=' + offset);
    browser.waitForAngular();
    this.get();
};

module.exports = Taxonomy;
