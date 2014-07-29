/*global browser:false, element:false, by:false */
'use strict';

var Concept = require('./concept/concept-page');

function Taxonomy(id){
    this.id = id;
}

Taxonomy.prototype.visitPage = function(){
    browser.get('/' + this.id);
};

Taxonomy.prototype.createConcept = function(conceptName){
    var input = element(by.model('conceptName'));
    input.clear();
    input.sendKeys(conceptName);
    var createConceptBtn = element.all(by.repeater('match in matches track by $index')).last();
    createConceptBtn.click();
    this.conceptName = element(by.id('concept')).element(by.binding('concept.Name')).getText();
    this.conceptLabel = element(by.model('conceptCopy.Label')).getAttribute('value');
};

Taxonomy.prototype.createElement = function(conceptName, parent, offset){
    offset = offset ? offset : 0;
    browser.get('/' + this.id + '/concept/' + conceptName +'?action=addElement&parent=' + parent + '&offset=' + offset);
    browser.waitForAngular();
    this.get();
};

Taxonomy.prototype.getConcept = function(conceptName){
    return new Concept(this.id, conceptName);
};

module.exports = Taxonomy;