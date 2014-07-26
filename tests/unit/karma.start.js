'use strict';

var Report;
var Rule;
beforeEach(module('report-editor', 'report-model', 'rules-model'));

beforeEach(inject(function ($rootScope, $controller, _Report_, _Rule_) {
    Report = _Report_;
    Rule = _Rule_;
}));

afterEach(function () {});
