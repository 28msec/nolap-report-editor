/*global browser:false */
'use strict';

var Recompile = require('./recompile/recompile-page');

function Concepts(reportId){
    this.reportId = reportId;
    this.recompile = new Recompile(this.reportId);
}

Concepts.prototype.visitPage = function(){
    browser.get('/' + this.reportId + '/');
};

Concepts.prototype.getRecompile = function(){
    return this.recompile;
};

module.exports = Concepts;
