/*global browser:false, element:false, by:false */
'use strict';

var Concepts = require('./concepts/concepts-page');
var Concept = require('./concept/concept-page');

function Taxonomy(id){
    this.id = id;
    this.concepts = new Concepts(this.id);
    this.elements = element(by.id('presentation-tree')).all(by.css('.angular-ui-tree-node'));
    this.rootElements = element.all(by.repeater('element in presentationTree'));
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

Taxonomy.prototype.getElementName = function(element){
    return element.all(by.binding('element.Name')).get(0);
};

Taxonomy.prototype.removeElement = function(element){
    element.click();
    element.element(by.css('.btn-danger')).click();
    //We wait for the report to save
    browser.waitForAngular();
};

Taxonomy.prototype.getConcepts = function(){
    return this.concepts;
};

Taxonomy.prototype.getConcept = function(conceptName){
    return new Concept(this.id, conceptName);
};

module.exports = Taxonomy;
