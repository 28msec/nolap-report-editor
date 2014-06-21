'use strict';

var config = require('./protractor-shared-conf').config;

config.specs = [
    '../*_spec.js'
];

config.capabilities = {
    browserName: 'chrome',
};

exports.config = config;
