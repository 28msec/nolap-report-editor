/*global browser:false, element:false, by:false */
'use strict';

//https://github.com/angular/protractor/blob/master/docs/api.md
//GetAttribute() returns "boolean" values and will return either "true" or null
browser.get('/');

describe('Authentication', function(){

    it('should have been redirected to the auth page', function() {
        browser.getCurrentUrl().then(function(url){
            expect(url.substring(url.length - '/auth/'.length)).toBe('/auth/');
        });
    });
    
    it('should login', function(){
        var form = element(by.name('loginForm'));
        var loginEmail = element(by.model('loginEmail'));
        var password = element(by.model('loginPassword'));
        loginEmail.sendKeys('w@28.io');
        password.sendKeys('foobar');
        form.submit().then(function(){
            browser.getCurrentUrl().then(function(url) {
                expect(url.substring(url.length - 1)).toBe('/');
            });
        });
    });
    
});