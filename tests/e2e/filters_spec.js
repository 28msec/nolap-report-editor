/*global browser:false */
'use strict';

//https://github.com/angular/protractor/blob/master/docs/api.md
//GetAttribute() returns "boolean" values and will return either "true" or null

describe('Filters', function(){

    var FiltersPage = require('./pages/filters');
    var filters = new FiltersPage();

    it('it should select COCA Cola', function() {
        filters.get();
        filters.setEntity('Coca Cola');
        
    });
});