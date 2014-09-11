/*global browser:false, element:false, by:false */
'use strict';

var Computation = require('./computation/computation-page');

function Formula(reportId, conceptName){
    this.reportId = reportId;
    this.conceptName = conceptName;
    this.computation = new Computation(reportId, conceptName);
}

Formula.prototype.getComputation = function(){
    return this.computation;
};

module.exports = Formula;
