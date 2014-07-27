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
    var that = this;
    return browser.get('/' + this.id).then(function(){
        that.label = element(by.binding('report.model.Label')).getText();
        that.elements = element(by.id('presentation-tree')).all(by.css('.angular-ui-tree-node'));
        that.searchBox = element(by.model('conceptName'));
    });
};

Report.prototype.elementCount = function(){
    return this.elements.count();
};

module.exports = Report;