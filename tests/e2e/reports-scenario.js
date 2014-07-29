'use strict';

//https://github.com/angular/protractor/blob/master/docs/api.md
//GetAttribute() returns "boolean" values and will return either "true" or null
describe('Reports', function(){
    
    var Reports = require('../../app/reports/page.js');
    var reports = new Reports();
    
    describe('Reports List', function() {

        it('should have a Report Editor title', function(){
            reports.visitPage();
            expect(reports.getTitle()).toBe('Report Editor');
        });
      
        it('Should show have at least one report', function() {
            reports.list.then(function(reportList){
                expect(reportList.length).toBeGreaterThan(0);
                reportList.forEach(function(report, index){
                    if(index > 0) {
                        var previousLastModified = reports.getLastModified(report);
                        var lastModified = reports.getLastModified(reportList[index - 1]);
                        expect(previousLastModified).toBeLessThan(lastModified);
                    }
                });
            });
        });
    });
    
    describe('Report Selection', function() {
        
        it('should have all reports unchecked', function(){
            expect(reports.toggle.getAttribute('checked')).toBe(null);
            expect(reports.deleteBtn.isDisplayed()).toBe(false);
        });
        
        it('should select all reports when clicking on the toggle', function(){
            reports.toggle.click();
            expect(reports.toggle.getAttribute('checked')).toBe('true');
            expect(reports.deleteBtn.isDisplayed()).toBe(true);
            reports.checkboxes.each(function(element){
                expect(element.getAttribute('checked')).toBe('true');
            });
        });
        
        it('the toggle should be undeterminate if we unselect a report', function(){
            var report = reports.checkboxes.first();
            report.click();
            expect(report.getAttribute('checked')).toBe(null);
            reports.checkboxes.count().then(function(count){
                if(count === 1) {
                    expect(reports.toggle.getAttribute('indeterminate')).toBe(null);
                } else {
                    expect(reports.toggle.getAttribute('indeterminate')).toBe('true');
                }
            });
        });
        
        it('the toggle shouldn\'t be undeterminate if all reports are selected or unselected', function(){
            var report = reports.checkboxes.first();
            report.click();
            expect(report.getAttribute('checked')).toBe('true');
            reports.checkboxes.each(function(element) {
                element.click(); 
                expect(element.getAttribute('checked')).toBe(null);
            });
            expect(reports.toggle.getAttribute('indeterminate')).toBe(null);
            expect(reports.deleteBtn.isDisplayed()).toBe(false);
            
            
            reports.checkboxes.each(function(element) {
                element.click(); 
                expect(element.getAttribute('checked')).toBe('true');
            });
            expect(reports.deleteBtn.isDisplayed()).toBe(true);
            expect(reports.toggle.getAttribute('indeterminate')).toBe(null);
        });
    });

});
