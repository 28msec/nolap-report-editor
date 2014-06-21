'use strict';

var util = require('./utils.js');

module.exports = function(grunt) {
    grunt.registerMultiTask('protractor', 'Run Protractor integration tests', function() {
        util.startProtractor.call(util, this.data, this.async());
    });
};
