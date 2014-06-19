'use strict';

//https://github.com/angular/protractor/blob/master/docs/api.md
/*global browser:false, element:false, by:false */
describe('Reports List', function() {
  
    it('Should have a Report Editor title', function(){
        browser.get('/');
        expect(browser.getTitle()).toBe('Report Editor');
    });
  
    it('Should show have at least one report', function() {
        browser.get('/');
        var reportList = element.all(by.repeater('report in reports'));
        expect(reportList.count()).toBeGreaterThan(0);
    });
});

describe('Report Selection', function() {
    browser.get('/');
    var toggle = element(by.model('toggle'));
    var checkboxes = element.all(by.model('selectedReports[report._id]'));
    
    it('Should have all reports unchecked', function(){
        expect(toggle.getAttribute('checked')).toBe(null);
    });
    
    it('Should select all reports when clicking on the toggle', function(){
        toggle.click().then(function(){
            expect(toggle.getAttribute('checked')).toBe('true');
            checkboxes.each(function(element){
                expect(element.getAttribute('checked')).toBe('false');
            });
        });
    });
});