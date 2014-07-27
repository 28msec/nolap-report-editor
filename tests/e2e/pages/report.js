/*global browser:false, element:false, by:false */
'use strict';

var Taxonomy = require('./taxonomy');
var FactTable = require('./fact-table');
var FiltersPage = require('./filters');

var Report = function(id){
    this.id = id;
    this.taxonomy = new Taxonomy(this.id);
    this.factTable = new FactTable(this.id);
    this.filters = new FiltersPage(this.id);
};

Report.prototype.get = function(){
    browser.get('/' + this.id);
    this.label = element(by.binding('report.model.Label')).getText();
    this.elements = element(by.id('presentation-tree')).all(by.css('.angular-ui-tree-node'));
    this.searchBox = element(by.model('conceptName'));
};

Report.prototype.elementCount = function(){
    return this.elements.count();
};

module.exports = Report;