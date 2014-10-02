'use strict';

//https://github.com/angular/protractor/blob/master/docs/api.md
//GetAttribute() returns "boolean" values and will return either "true" or null

describe('Filters', function(){

    var FiltersPage = require('../../app/report/filters/filters-page');
    var filters;

    it('should reset the filters', function() {
        filters = new FiltersPage('supportFundamentalAccountingConcepts');
        filters.visitPage()
        .then(function(){
            filters.resetSelectedFilters()
            .then(function(){
                expect(filters.selectedFilters.cik.count()).toBe(0);
                expect(filters.selectedFilters.tag.count()).toBe(1);
                expect(filters.selectedFilters.sic.count()).toBe(0);
                expect(filters.selectedFilters.fiscalYear.count()).toBe(1);
                expect(filters.selectedFilters.fiscalPeriod.count()).toBe(1);
            });
        });
    });

    it('should have filters to select', function() {
        expect(filters.setFilters.tags.count()).toBe(4);
        expect(filters.setFilters.fiscalYears.count()).toBeGreaterThan(2);
        expect(filters.setFilters.fiscalPeriods.count()).toBe(4);
    });

    it('should issue a too generic filter warning', function() {
        expect(filters.filterTooGenericWarning.count()).toBe(0);
        filters.closeSelectedFiltersTag('DOW30')
        .then(function(){
            expect(filters.selectedFilters.tag.count()).toBe(0);
            expect(filters.filterTooGenericWarning.count()).toBe(1);
        });
    });

    it('should select COCA Cola', function() {
        filters.setFiltersEntityName('Coca Cola', 2)
        .then(function(){
            expect(filters.setFilters.entity.getAttribute('value')).toBe('');
            expect(filters.selectedFilters.cik.count()).toBe(1);
            expect(filters.selectedFilters.cik.get(0).getText()).toMatch('COCA COLA');
        });
    });

    it('should select FORTUNE100', function() {
        filters.closeSelectedFiltersEntity('COCA COLA CO')
        .then(function(){
            //expect(filters.filterTooGenericWarning.count()).toBe(1);
            filters.clickFiltersTag('FORTUNE100')
            .then(function(){
                expect(filters.filterTooGenericWarning.count()).toBe(0);
                expect(filters.selectedFilters.tag.count()).toBe(1);
                expect(filters.selectedFilters.tag.get(0).getText()).toBe('\u00D7\nFORTUNE100');
            });
        });
    });

    it('should select Beverages', function() {
        filters.closeSelectedFiltersTag('FORTUNE100')
        .then(function(){
            //expect(filters.filterTooGenericWarning.count()).toBe(1);
            filters.setFiltersIndustryGroup('bev', 3)
            .then(function(){
                expect(filters.filterTooGenericWarning.count()).toBe(0);
                expect(filters.setFilters.sic.getAttribute('value')).toBe('');
                expect(filters.selectedFilters.sic.count()).toBe(1);
                expect(filters.selectedFilters.sic.get(0).getText()).toMatch('BEVERAGES');
            });
        });
    });

    it('should select year', function() {
        filters.clickFiltersYear(2012)
        .then(function(){
            expect(filters.selectedFilters.fiscalYear.count()).toBe(2);
        });
    });

    it('should select period', function() {
        filters.clickFiltersPeriod('Q3')
        .then(function(){
            expect(filters.selectedFilters.fiscalPeriod.count()).toBe(2);
        });
    });

    it('should reset the filters', function() {
        filters.resetSelectedFilters()
        .then(function(){
            expect(filters.selectedFilters.cik.count()).toBe(0);
            expect(filters.selectedFilters.tag.count()).toBe(1);
            expect(filters.selectedFilters.sic.count()).toBe(0);
            expect(filters.selectedFilters.fiscalYear.count()).toBe(1);
            expect(filters.selectedFilters.fiscalPeriod.count()).toBe(1);
        });
    });
});
