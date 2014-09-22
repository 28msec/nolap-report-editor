'use strict';

var Edit = require('./edit/edit-page');

function Computation(reportId, conceptName){
    this.reportId = reportId;
    this.conceptName = conceptName;
}

Computation.prototype.getEdit = function(ruleId){
    return new Edit(this.reportId, this.conceptName, ruleId);
};

module.exports = Computation;
