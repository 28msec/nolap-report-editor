/*global browser:false, element:false, by:false */
'use strict';

var Taxonomy = require('./taxonomy/taxonomy-page');
var Filters = require('./filters/filters-page');
var Spreadsheet = require('./spreadsheet/spreadsheet-page');
var FactTable = require('./fact-table/fact-table-page');

function Report(id){
    this.id        = id;
    this.taxonomy  = new Taxonomy(this.id);
    this.spreadsheet   = new Spreadsheet(this.id);
    this.filters   = new Filters(this.id);
    this.factTable = new FactTable(this.id);
    this.label     = element(by.binding('report.model.Label'));
    this.searchBox = element(by.model('conceptName'));
}

Report.prototype.visitPage = function(){
    browser.get('/' + this.id);
};

module.exports = Report;