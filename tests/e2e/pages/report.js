/*global browser:false, element:false, by:false */
'use strict';

var Taxonomy = require('./taxonomy');
var FactTable = require('./fact-table');
var FiltersPage = require('./filters');

var Report = function(id){
    this.id = id;
    this.elements = element(by.id('presentation-tree')).all(by.css('.angular-ui-tree-node'));
    this.taxonomy = new Taxonomy(this.id);
    this.factTable = new FactTable(this.id);
    this.filters = new FiltersPage(this.id);
};

Report.prototype.get = function(){
    return browser.get('/' + this.id);  
};

Report.prototype.elementCount = function(){
    return this.elements.count();
};

module.exports = Report;