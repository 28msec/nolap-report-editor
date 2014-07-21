/*global browser:false, element:false, by:false */
'use strict';

var FiltersPage = function(id){
    this.id = id;
    this.entity = element(by.model('entityName'));
    this.selectedCIK = element.all(by.repeater('c in selection.cik'));
};

FiltersPage.prototype.get = function(){
    return browser.get('/' + id + '/filters');
};

FiltersPage.prototype.setEntity = function(entityName){
    this.entity.clear();
    this.entity.sendKeys(entityName);
};

module.exports = FiltersPage;