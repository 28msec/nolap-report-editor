/*global browser:false, element:false, by:false */
'use strict';

function Filters(id){
    this.id = id;

    this.filterTooGenericWarning = element.all(by.id('filter-too-generic'));

    // left set filters panel
    this.setFilters = {};
    this.setFilters.entity = element(by.model('entityName'));
    this.setFilters.tags = element.all(by.repeater('t in tags'));
    this.setFilters.sic = element(by.model('sicCode'));
    this.setFilters.fiscalYears = element.all(by.repeater('y in years'));
    this.setFilters.fiscalPeriods = element.all(by.repeater('p in periods'));

    // right selected filters panel
    this.selectedFilters = {};
    this.selectedFilters.cik = element.all(by.repeater('c in selection.cik'));
    this.selectedFilters.tag = element.all(by.repeater('tag in selection.tag'));
    this.selectedFilters.sic = element.all(by.repeater('s in selection.sic'));
    this.selectedFilters.fiscalYear = element.all(by.repeater('y in selection.fiscalYear'));
    this.selectedFilters.fiscalPeriod = element.all(by.repeater('p in selection.fiscalPeriod'));
    this.selectedFilters.reset = element(by.xpath('//a[./text() = "RESET"]'));
}

Filters.prototype.visitPage = function(){
    return browser.get('/' + this.id + '/filters');
};

Filters.prototype.resetSelectedFilters = function() {
    return this.selectedFilters.reset.click();
};

var ARROW_DOWN = '\uE015';
var ENTER = '\uE007';

var closeSelectedFiltersBox = function(boxes, text) {
    boxes
    .filter(function(box){
        return box.getText().then(function(t){
            return (t.indexOf(text, t.length - text.length) !== -1);
        });
    })
    .then(function(foundBoxes){
        foundBoxes.forEach(function(box){ box.element(by.css('a')).click();});
    });
    return browser.waitForAngular();
};

Filters.prototype.closeSelectedFiltersTag = function(text) {
    return closeSelectedFiltersBox(this.selectedFilters.tag, text);
};

Filters.prototype.closeSelectedFiltersEntity = function(text) {
    return closeSelectedFiltersBox(this.selectedFilters.cik, text);
};

Filters.prototype.closeSelectedFiltersSIC = function(text) {
    return closeSelectedFiltersBox(this.selectedFilters.sic, text);
};

Filters.prototype.closeSelectedFiltersYear = function(text) {
    return closeSelectedFiltersBox(this.selectedFilters.fiscalYear, text);
};

Filters.prototype.closeSelectedFiltersPeriod = function(text) {
    return closeSelectedFiltersBox(this.selectedFilters.fiscalPeriod, text);
};

Filters.prototype.setFiltersEntityName = function(entityName, typeaheadPosition){
    this.setFilters.entity.clear();
    this.setFilters.entity.sendKeys(entityName);
    while(typeaheadPosition > 1){
        this.setFilters.entity.sendKeys(ARROW_DOWN);
        typeaheadPosition -= 1;
    }
    this.setFilters.entity.sendKeys(ENTER);
    return browser.waitForAngular();
};

Filters.prototype.clickFiltersTag = function(tag){
    this.setFilters.tags
    .filter(function(item){
        var a = item.element(by.css('a'));
        return a.getText().then(function(text){
            return (text === tag);
        });
    })
    .then(function (foundItems){
        foundItems.forEach(function(item){ item.element(by.css('a')).click(); });
    });
    return browser.waitForAngular();
};

Filters.prototype.setFiltersIndustryGroup = function(industryGroup, typeaheadPosition){
    this.setFilters.sic.clear();
    this.setFilters.sic.sendKeys(industryGroup);
    while(typeaheadPosition > 1){
        this.setFilters.sic.sendKeys(ARROW_DOWN);
        typeaheadPosition -= 1;
    }
    this.setFilters.sic.sendKeys(ENTER);
    return browser.waitForAngular();
};

var clickFiltersSelectors = function(list, value){
    list
    .filter(function(item){
        return item.getText().then(function(text){
            return (text === '' + value);
        });
    })
    .then(function (foundItems){
        foundItems.forEach(function(item){ item.click(); });
    });
    return browser.waitForAngular();
};

Filters.prototype.clickFiltersYear = function(year){
    return clickFiltersSelectors(this.setFilters.fiscalYears, year); 
};

Filters.prototype.clickFiltersPeriod = function(period){
    return clickFiltersSelectors(this.setFilters.fiscalPeriods, period); 
};

module.exports = Filters;
