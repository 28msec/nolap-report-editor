"use strict";

var fail = function (msg) {
    expect('should not reach this!: ' + msg).toEqual('failure');
};

var Report;
beforeEach(module('nolapReportEditor'));

beforeEach(inject(function (_Report_) {
    Report = _Report_;
}));

afterEach(function () {});
