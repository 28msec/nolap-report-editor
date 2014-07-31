/*global browser:false, element:false, by:false */
'use strict';

function Filters(id){
    this.id = id;
    this.entity = element(by.model('entityName'));
    this.entities = element.all(by.repeater('entity in entities'));
    this.selectedFilters = {};
    this.selectedFilters.ciks = element.all(by.repeater('c in selection.cik'));
    this.selectedFilters.tags = element.all(by.repeater('tag in selection.tag'));
}

Filters.prototype.visitPage = function(){
    browser.get('/' + this.id + '/filters');
};

Filters.prototype.selectedFiltersCloseTag = function(text) {
    this.selectedFilters.tags
        .then(
            function(tags){
                var tag;
                angular.forEach(tags, function
                return tag;
        })
        .then(
            function(tag){
                tag.element(by.css('a')).click()
        });
};

Filters.prototype.setEntity = function(entityName){
    this.entity.clear();
    this.entity.sendKeys(entityName, ARROW_DOWN, ENTER);
};

Filters.prototype.typeaheadEntityArrowDown = function(){
    var ARROW_DOWN = '\uE015';
    this.entity.sendKeys(ARROW_DOWN);
};

Filters.prototype.typeaheadEntitySelect = function(){
    var ENTER = '\uE007';
    this.entity.sendKeys(ENTER);
};

module.exports = Filters;
