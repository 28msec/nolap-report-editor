/*global browser:false, element:false, by:false */
'use strict';

var AuthPage = function(){
    browser.get('/');
    this.form = element(by.name('loginForm'));
    this.loginEmail = element(by.model('loginEmail'));
    this.password = element(by.model('loginPassword'));
};

AuthPage.prototype.login = function(email, password){
    this.loginEmail.clear();
    this.loginEmail.sendKeys(email);
    this.password.clear();
    this.password.sendKeys(password);
    return this.form.submit();
};

AuthPage.prototype.wrongCombinasionMessage = function(){
    return element(by.id('wrong-combinasion'));
};

module.exports = AuthPage;