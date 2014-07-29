/*global browser:false, element:false, by:false */
'use strict';

function Filters(id){
    this.id = id;
    this.entity = element(by.model('entityName'));
    this.entities = element.all(by.repeater('entity in entities'));
    this.selectedCIK = element.all(by.repeater('c in selection.cik'));
}

Filters.prototype.visitPage = function(){
    browser.get('/' + this.id + '/filters');
    //We wait for angular because not only the page must be visited but the report needs to be saved.
    browser.waitForAngular();
};

Filters.prototype.setEntity = function(entityName){
    this.entity.clear();
    var ARROW_DOWN = '\uE015';
    var ENTER = '\uE007';
    var NULL = '\uE000';
    this.entity.sendKeys(entityName, NULL, ARROW_DOWN, NULL, ENTER, NULL);
    console.log(JSON.stringify(this.entity));
};

module.exports = Filters;