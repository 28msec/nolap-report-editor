/*global browser:false, element:false, by:false */
'use strict';

//https://github.com/angular/protractor/blob/master/docs/api.md
//GetAttribute() returns "boolean" values and will return either "true" or null
browser.get('/');

describe('Reports List', function() {
    it('should have a Report Editor title', function(){
        expect(browser.getTitle()).toBe('Report Editor');
    });
  
    it('Should show have at least one report', function() {
        var reportList = element.all(by.repeater('report in reports'));
        expect(reportList.count()).toBeGreaterThan(0);
    });
});

describe('Report Selection', function() {
    var toggle = element(by.model('toggle'));
    var checkboxes = element.all(by.model('selectedReports[report._id]'));
    
    it('should have all reports unchecked', function(){
        expect(toggle.getAttribute('checked')).toBe(null);
    });
    
    it('should select all reports when clicking on the toggle', function(){
        toggle.click();
        expect(toggle.getAttribute('checked')).toBe('true');
        checkboxes.each(function(element){
            expect(element.getAttribute('checked')).toBe('true');
        });
    });
    
    it('the toggle should be undeterminate if we unselect a report', function(){
        var report = checkboxes.first();
        report.click();
        expect(report.getAttribute('checked')).toBe(null);
        expect(toggle.getAttribute('indeterminate')).toBe('true');
    });
    
    it('the toggle shouldn\'t be undeterminate if all reports are selected or unselected', function(){
        var report = checkboxes.first();
        report.click();
        expect(report.getAttribute('checked')).toBe('true');
        checkboxes.each(function(element) {
            element.click(); 
            expect(element.getAttribute('checked')).toBe(null);
        });
        expect(toggle.getAttribute('indeterminate')).toBe(null);
        
        
        checkboxes.each(function(element) {
            element.click(); 
            expect(element.getAttribute('checked')).toBe('true');
        });
        expect(toggle.getAttribute('indeterminate')).toBe(null);
    });
});