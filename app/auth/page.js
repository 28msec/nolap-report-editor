/*global browser:false, element:false, by:false */
'use strict';

function AuthPage(){
    this.form = element(by.name('loginForm'));
    this.loginEmail = element(by.model('loginEmail'));
    this.password = element(by.model('loginPassword'));
}

AuthPage.prototype.visitPage = function(){
    return browser.get('/');
};

AuthPage.prototype.login = function(email, password){
    this.loginEmail.clear();
    this.loginEmail.sendKeys(email);
    this.password.clear();
    this.password.sendKeys(password);
    this.form.submit();
};

AuthPage.prototype.logout = function(){
    return browser.get('/logout');
};

AuthPage.prototype.getCurrentUrl = function(){
    return browser.getCurrentUrl();
};

AuthPage.prototype.wrongCombinasionMessage = function(){
    return element(by.id('wrong-combinasion'));
};

module.exports = AuthPage;