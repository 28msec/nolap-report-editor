'use strict';

var config = require('./protractor-shared-conf').config;

config.sauceUser = process.env.SAUCE_USERNAME;
config.sauceKey = process.env.SAUCE_ACCESS_KEY;

config.multiCapabilities = [{
    'browserName': 'firefox',
    'name': 'NoLAP Report Editor',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'version': '28'
}];

exports.config = config;
