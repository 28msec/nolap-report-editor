'use strict';

//https://github.com/angular/protractor/blob/master/docs/api.md
/*global browser:false, element:false, by:false */
describe('Reports List', function() {
  
    it('Should have a report editor title', function(){
        browser.get('/');
        expect(browser.getTitle()).toBe('Report Editor');
    });
  
    it('Should show have at least one report', function() {
        browser.get('/');
        var reportList = element.all(by.repeater('report in reports'));
        expect(reportList.count()).toBeGreaterThan(0);
    });

});
