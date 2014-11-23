'use strict';

//GetAttribute() returns "boolean" values and will return either "true" or null
describe('Report', function() {
    var _ = require('lodash');

    var reportName, filters;

    var Reports = require('../../app/reports/reports-page');
    var reports;

    var Report = require('../../app/report/report-page');
    var report;

    it('Create an fac report', function(){
        reportName = 'supportFundamentalAccountingConcepts' + Math.floor((Math.random() * 10) + 1);

        reports = new Reports();
        reports.createReport(reportName, 'FundamentalAccountingConcepts');
        reports.getCurrentUrl().then(function(url){
            var id = _.last(url.split('/'));
            report = new Report(id);
        });
    });

    it('should have 107 elements', function(){
        expect(report.taxonomy.elements.count()).toBe(107);
    });
    
    it('should have the proper css properties', function() {
        var abstractElement = report.taxonomy.getElementName(report.taxonomy.elements.get(0));
        var concreteElement = report.taxonomy.getElementName(report.taxonomy.elements.get(4));
        expect(abstractElement.getCssValue('font-weight')).toMatch(/bold|700/);
        expect(abstractElement.getCssValue('padding-left')).toBe('5px');
        expect(concreteElement.getCssValue('font-weight')).toMatch(/normal|400/);
        expect(concreteElement.getCssValue('padding-left')).toBe('30px');
    });
    
    it('last element should be scrollable to', function(){
        var last = report.taxonomy.elements.last();
        last.click();
    });

    it('should contain a computation rule for Revenues with a hidden Concept OtherOperatingIncomeExpenses', function(){
        var editFormulaPage = report.taxonomy.getConcept('fac:Revenues').formula.computation.getEdit('fd810901-ee86-46ad-8c55-ec933c27169a');
        editFormulaPage.visitPage();
        expect(editFormulaPage.form.hiddenRules.getAttribute('value')).toBe('OtherOperatingIncomeExpenses');
    });

    it('should only contain formulas that compile without error', function(){
        var recompilePage = report.taxonomy.concepts.recompile;
        recompilePage.visitPage();
        recompilePage.recompileAndValidateFormulas();
        expect(recompilePage.errorMessages.count()).toBe(0);
        expect(recompilePage.successMessages.count()).toBe(66);
    });

    it('should select Coca Cola on filters page', function(){
        report.filters.visitPage();
        report.filters.resetSelectedFilters();
        report.filters.closeSelectedFiltersTag('DOW30');
        report.filters.setFiltersEntityName('Coca Cola', 1);
        expect(report.filters.selectedFilters.cik.count()).toBe(1);
        report.filters.closeSelectedFiltersYear(2014);
        report.filters.clickFiltersYear(2013);
        expect(report.filters.selectedFilters.fiscalYear.count()).toBe(1);
    });

    it('should render ratios as decimals', function(){
        report.spreadsheet.visitPage();
        var roas = report.spreadsheet.getValueTDsByHeaderContainingText('(ROA)');
        expect(roas.count()).toBe(1);
        var value = report.spreadsheet.getCellValue(roas.get(0));
        expect(value.getText()).toBe('0.10');
    });

    it('should display validation and fact details on fact click', function(){
        report.spreadsheet.visitPage();
        var income = report.spreadsheet.getValueTDsByHeaderContainingText('Operating Income (Loss)');
        expect(income.count()).toBe(1);
        income.get(0).click();
        var factDetails = report.spreadsheet.getFactDetailsModal();
        expect(factDetails.count()).toBe(1);

        // there should be 2 failing stamps for operating income
        var failingStamps = report.spreadsheet.getValidationStampsDetails(false);
        expect(failingStamps.count()).toBe(2);
    });

    it('should reset the filters', function() {
        filters = report.filters;
        filters.visitPage()
            .then(function(){
                filters.resetSelectedFilters()
                    .then(function(){
                        expect(filters.selectedFilters.cik.count()).toBe(0);
                        expect(filters.selectedFilters.tag.count()).toBe(1);
                        expect(filters.selectedFilters.sic.count()).toBe(0);
                        expect(filters.selectedFilters.fiscalYear.count()).toBe(1);
                        expect(filters.selectedFilters.fiscalPeriod.count()).toBe(1);
                        expect(filters.selectedFilters.fiscalPeriodTypeYTD.getAttribute('class')).toMatch(/active/);
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
        filters.setFiltersEntityName('Coca Cola', 1)
            .then(function(){
                expect(filters.setFilters.entity.getAttribute('value')).toBe('');
                expect(filters.selectedFilters.cik.count()).toBe(1);
                expect(filters.selectedFilters.cik.get(0).getText()).toMatch('COCA COLA CO');
            });
    });

    it('should select FORTUNE100', function() {
        filters.closeSelectedFiltersEntity('COCA COLA CO')
            .then(function(){
                expect(filters.filterTooGenericWarning.count()).toBe(1);
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
                expect(filters.filterTooGenericWarning.count()).toBe(1);
                filters.setFiltersIndustryGroup('bev', 1)
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

    it('Should delete report', function() {
        reports.visitPage();
        reports.list.count().then(function(count){
            reports.deleteReport(reportName).then(function(){
                expect(reports.list.count()).toBe(count - 1);
            });
        });
    });
});
