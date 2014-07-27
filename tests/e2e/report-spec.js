'use strict';

//GetAttribute() returns "boolean" values and will return either "true" or null
describe('Report', function(){
    var Report = require('./pages/report');
    var report = new Report('1fueA5hrxIHxvRf7Btr_J6efDJ3qp-s9KV731wDc4OOaw');
    
    describe('Presentation Tree', function() {
        it('should have a Report Editor title', function(){
            report.get();
        });
    
        it('should have 107 elements', function(){
            expect(report.elementCount()).toBe(107);
        });
        
        it('last element should be scrollable to', function(){
            var last = report.elements.last();
            last.click();
        });
    });
});