/*global browser:false, element:false, by:false */
'use strict';

var Preview = function(id){
    this.id = id;
};

Preview.prototype.get = function(){
    return browser.get('/' + this.id + '/preview');  
};

module.exports = Preview;
