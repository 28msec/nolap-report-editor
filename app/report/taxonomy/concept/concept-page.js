/*global browser:false, element:false, by:false */
'use strict';

var Synonyms = require('./synonyms/synonyms-page');

function Concept(id, name){
    this.id = id;
    this.name = name;
    this.label = element(by.model('conceptCopy.Label')).getAttribute('value');
}

Concept.prototype.visitPage = function(){
    browser.get('/' + this.id + '/concept/' + this.name);
};

Concept.prototype.createElement = function(parent, offset){
    offset = offset ? offset : 0;
    browser.get('/' + this.id + '/concept/' + this.name +'?action=addElement&parent=' + parent + '&offset=' + offset);
};

Concept.prototype.getSynonyms = function(){
    return new Synonyms(this.id, this.name); 
};

module.exports = Concept;