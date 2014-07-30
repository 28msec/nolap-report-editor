/*global browser:false, element:false, by:false */
'use strict';

var Overview = require('./overview/overview-page');
var Synonyms = require('./synonyms/synonyms-page');

function Concept(id, name){
    this.id = id;
    this.name = name;
    this.label = element(by.model('conceptCopy.Label')).getAttribute('value');
    this.overview = new Overview(this.id, this.name);
    this.synonyms = new Synonyms(this.id, this.name);
}

Concept.prototype.visitPage = function(){
    browser.get('/' + this.id + '/concept/' + this.name);
};

Concept.prototype.createElement = function(parent, offset){
    offset = offset ? offset : 0;
    browser.get('/' + this.id + '/concept/' + this.name +'?action=addElement&parent=' + parent + '&offset=' + offset);
    browser.waitForAngular();
    this.visitPage();
};

Concept.prototype.getOverview = function(){
    return this.overview;
};

Concept.prototype.getSynonyms = function(){
    return this.synonyms;
};

module.exports = Concept;
