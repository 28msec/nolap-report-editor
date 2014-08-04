'use strict';

//https://github.com/angular/protractor/blob/master/docs/api.md
//GetAttribute() returns "boolean" values and will return either "true" or null
describe('Reports', function(){

    var id = '1fueA5hrxIHxvRf7Btr_J6efDJ3qp-s9KV731wDc4OOaw';
    var Report = require('../../app/report/report-page');
    var FiltersPage = require('../../app/report/filters/filters-page');

    it('Should throw an exception if we reloading while saving the report', function(){
        var report = new Report(id);
        var filters = report.filters;
        filters.visitPage();
        //Let's do an illegal update where we don't wait for angularjs to finish
        //See https://github.com/angular/protractor/issues/308
        filters.resetSelectedFilters();
        filters.visitPage().then(function(){
            expect(true).toBe(false);
        }, function(){
            expect(true).toBe(true);
        });
        //browser.switchTo().alert().then(function(alert) {
        //    alert.accept();
        //});
    });
});
