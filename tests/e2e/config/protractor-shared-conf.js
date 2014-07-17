/*global browser:false */
'use strict';

exports.config = {
    allScriptsTimeout: 11000,

    baseUrl: 'http://localhost:9000',

    framework: 'jasmine',

    specs: ['../*_spec.js'],

    onPrepare: function() {
        // Disable animations so e2e tests run more quickly
        var disableNgAnimate = function() {
            angular.module('disableNgAnimate', []).run(function($animate) {
                $animate.enabled(false);
            });
        };

        browser.addMockModule('disableNgAnimate', disableNgAnimate);

        // Store the name of the browser that's currently being used.
        browser.getCapabilities().then(function(caps) {
            browser.params.browser = caps.get('browserName');
        });
    },

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
