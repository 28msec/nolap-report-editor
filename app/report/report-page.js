/*global browser:false, element:false, by:false */
'use strict';

var Taxonomy = require('./taxonomy/taxonomy-page');

function Report(id){
    this.id = id;
    this.taxonomy = new Taxonomy(this.id);
    this.label = element(by.binding('report.model.Label')).getText();
    this.searchBox = element(by.model('conceptName'));
}

Report.prototype.visitPage = function(){
    browser.get('/' + this.id);
};

module.exports = Report;