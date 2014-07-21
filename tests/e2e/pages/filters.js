/*global browser:false, element:false, by:false */
'use strict';

var FiltersPage = function(id){
    //browser.waitForAngular();
    this.id = id;
    this.entity = element(by.model('entityName'));
    this.selectedCIK = element.all(by.repeater('c in selection.cik'));
};

FiltersPage.prototype.get = function(){
    return browser.get('/' + this.id + '/filters');
};

FiltersPage.prototype.setEntity = function(entityName){
    this.entity.clear();
    var ARROW_DOWN = '\uE015';
    var ENTER = '\uE007';
    var NULL = '\uE000';
    this.entity.sendKeys(entityName, NULL, ARROW_DOWN, NULL, ENTER, NULL);
    console.log(JSON.stringify(this.entity));
};

module.exports = FiltersPage;
