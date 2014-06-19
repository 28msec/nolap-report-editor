module.exports = function(grunt) {
    'use strict';
    
    grunt.registerMultiTask('swagger', 'Generate Source from Swagger files', function(){
        var fs = require('fs');
        var request = require('request');
       
        var done = this.async();
        var options = this.options();
        var url = this.data.url || 'http://secxbrl.xbrl.io';
        var dest = options.dest;
        var failIfOffline = options.failIfOffline;
        grunt.file.mkdir(dest);
     
        var count = options.apis.length;
        grunt.log.writeln('Using api: ' + url);
        options.apis.forEach(function(api){
            var swagger = fs.readFileSync(api.swagger);
            request({
                uri: url + '/angular.jq',
                qs: { module: api.module, service: api.service, 'new-module': api.newModule },
                headers: { 'Content-Type': 'text/json; utf-8' },
                body: swagger
            }, function(error, response, body){
                if(response === undefined) {
                    if(failIfOffline === true) {
                        grunt.fail.fatal('Couldn\'t connect to server');
                    } else {
                        grunt.log.writeln('Skipped ' + dest + '/' + api.service + '.js');
                        count--;
                        if(count === 0) {
                            done();
                        }
                        return;
                    }
                }
                if(response.statusCode !== 200) {
                    grunt.fail.fatal('Server replied: ' + response.statusCode);
                }
                fs.writeFileSync(dest + '/' + api.filename + '.js', body);
                grunt.log.writeln(dest + '/' + api.filename + '.js written (' + api.module + '.' + api.service + ')');
                count--;
                if(count === 0) {
                    done();
                }
            });
        });
    });
};
