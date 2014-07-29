/*global browser:false, element:false, by:false */
'use strict';

function Concept(id, name){
    this.id = id;
    this.name = name;
    this.label = element(by.model('conceptCopy.Label')).getAttribute('value');
}

Concept.prototype.visitPage = function(){
    browser.get('/' + this.id + '/concept/' + this.name);
};


module.exports = Concept;