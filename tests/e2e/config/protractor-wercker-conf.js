'use strict';

var config = require('./protractor-shared-conf').config;

config.capabilities = {
    browserName: 'firefox'
};

exports.config = config;
