/*global browser:false */
'use strict';

//https://github.com/angular/protractor/blob/master/docs/api.md
//GetAttribute() returns "boolean" values and will return either "true" or null

describe('Filters', function(){

    var FiltersPage = require('./pages/filters');
    var filters = new FiltersPage('1fueA5hrxIHxvRf7Btr_J6efDJ3qp-s9KV731wDc4OOaw');

    it('should have entities to select', function() {
        filters.entities.then(function(entities){
            expect(entities.length).toBeGreaterThan(0);
        });
    });

    it('should select COCA Cola', function() {
        filters.get();
        filters.setEntity('Coca Cola');
        
    });
});
