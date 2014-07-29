/*global browser:false */
'use strict';

function Preview(id){
    this.id = id;
}

Preview.prototype.visitPage = function(){
    return browser.get('/' + this.id + '/preview');  
};

module.exports = Preview;