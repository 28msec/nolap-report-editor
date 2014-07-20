/*global browser:false, element:false, by:false */
'use strict';

var Reports = function(){
    browser.get('/');
    this.list = element.all(by.repeater('report in reports'));
    this.deleteBtn = element(by.id('delete-reports'));
    this.toggle = element(by.model('toggle'));
    this.checkboxes = element.all(by.model('selectedReports[report._id]'));
};

module.exports = Reports;