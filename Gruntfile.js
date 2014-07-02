module.exports = function (grunt) {
    'use strict';
    
    var config = {
        app: 'app',
        dist: 'dist'
    };

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    grunt.task.loadTasks('tasks');
    
    var LIVERELOAD_PORT = 35729;
    var lrSnippet = require('connect-livereload')({
        port: LIVERELOAD_PORT
    });
    var mountFolder = function (connect, dir) {
        return connect.static(require('path').resolve(dir));
    };
    var modRewrite = require('connect-modrewrite');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        api: grunt.file.readJSON('grunt-api.json'),
        registration: grunt.file.readJSON('grunt-registration.json'),
        config: config,
        watch: {
            less: {
                files:  ['<%= config.app %>/styles/{,*/}*.less'],
                tasks: ['less']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= config.app %>/**/*.html',
                    '{.tmp,<%= config.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= config.app %>}/**/*.js',
                    '<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        //Connect
        connect: {
            options: {
                port: 9000,
                hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            modRewrite([
                                '!\\.html|\\.xml|\\images|\\.js|\\.css|\\.png|\\.jpg|\\.woff|\\.ttf|\\.svg|\\.ico /index.html [L]'
                            ]),
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, config.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    keepalive: false,
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            modRewrite([
                                '!\\.html|\\.xml|\\images|\\.js|\\.css|\\.png|\\.jpg|\\.woff|\\.ttf|\\.svg|\\.ico /index.html [L]'
                            ]),
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, config.app)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.options.port %>'
            }
        },
        less: {
            dist: {
                options: {
                },
                files: {
                    '<%= config.app %>/styles/index.css': ['<%= config.app %>/styles/index.less']
                }
            }
        },
        peg: {
            options: { trackLineAndColumn: true },
            excelGrammar : {
                src: 'pegjs/excelGrammar.pegjs',
                dest: '<%= config.app %>/modules/excel-parser.js',
                angular: {
                    module: 'excel-parser',
                    factory: 'ExcelParser'
                }
            },
            formulaGrammar : {
                src: 'pegjs/formulaGrammar.pegjs',
                dest: '<%= config.app %>/modules/formula-parser.js',
                angular: {
                    module: 'formula-parser',
                    factory: 'FormulaParser'
                }
            }
        },
        'swagger-js-codegen': {
            options: {
                apis: [
                    {
                        swagger: 'swagger/reports.json',
                        moduleName: 'report-service',
                        className: 'ReportService',
                        fileName: 'report-service.js',
                        angularjs: true
                    },
                    {
                        swagger: 'swagger/session.json',
                        moduleName: 'session-service',
                        className: 'SessionService',
                        fileName: 'session-service.js',
                        angularjs: true
                    }
                ],
                dest: '<%= config.app %>/modules/swagger'
            },
            all: {}
        },
        clean: {
            pre: ['dist/', 'coverage/', 'out/'],
            post: []
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: ['Gruntfile.js',
                  '<%= config.app %>/modules/**/*.js',
                  '<%= config.app %>/report/**/*.js',
                  '<%= config.app %>/reports/**/*.js',
                  'tasks/**/*.js',
                  'tests/**/*.js'
            ]
        },
        karma: {
            options: {
                configFile: './karma.conf.js'
            },
            dev: {
                browsers: ['Chrome'],
                autoWatch: true,
                singleRun: false
            },
            '1.2.9': {
                options: {
                    files: [
                        '<%= config.app %>/bower_components/angular/angular.js',
                        '<%= config.app %>/bower_components/angular-mocks-1.2.9/angular-mocks.js',
                        '<%= config.app %>/modules/excel-parser.js',
                        '<%= config.app %>/modules/formula-parser.js',
                        '<%= config.app %>/modules/report-api.js',
                        '<%= config.app %>/modules/report-model.js',
                        '<%= config.app %>/modules/rules-model.js',
                        'tests/unit/karma.start.js',
                        'tests/unit/*.js'
                    ]
                }
            }
        },
        coveralls: {
            options: {
                'coverage_dir': 'coverage'
            }
        },
        protractor: {
            travis: 'tests/e2e/config/protractor-travis-conf.js',
            local: 'tests/e2e/config/protractor-conf.js'
        },
        ngconstant: {
            options: {
                space: '    '
            },
            server: {
                dest: '<%= config.app %>/constants.js',
                name: 'constants',
                wrap: '/*jshint quotmark:double */\n"use strict";\n\n<%= __ngModule %>',
                constants: {
                    'APPNAME': 'report-editor',
                    'API_URL': '//<%= api.server %>/v1',
                    'REGISTRATION_URL': '<%= registration.server %>',
                    'DEBUG': true
                }
            },
            test: {
                dest: '<%= config.app %>/constants.js',
                name: 'constants',
                wrap: '/*jshint quotmark:double */\n"use strict";\n\n<%= __ngModule %>',
                constants: {
                    'APPNAME': 'report-editor',
                    'API_URL': '//<%= api.test %>/v1',
                    'REGISTRATION_URL': '<%= registration.test %>',
                    'DEBUG': true
                }
            },
            beta: {
                dest: '<%= config.app %>/constants.js',
                name: 'constants',
                wrap: '/*jshint quotmark:double */\n"use strict";\n\n<%= __ngModule %>',
                constants: {
                    'APPNAME': 'report-editor',
                    'API_URL': '//<%= api.beta %>/v1',
                    'REGISTRATION_URL': '<%= registration.beta %>',
                    'DEBUG': false
                }
            },
            prod: {
                dest: '<%= config.app %>/constants.js',
                name: 'constants',
                wrap: '/*jshint quotmark:double */\n"use strict";\n\n<%= __ngModule %>',
                constants: {
                    'APPNAME': 'report-editor',
                    'API_URL': '//<%= api.prod %>/v1',
                    'REGISTRATION_URL': '<%= registration.prod %>',
                    'DEBUG': false
                }
            }
        },
        jsonlint: {
            all: {
                src: [
                    'package.json',
                    'grunt-api.json',
                    'bower.json',
                    'swagger/*'
                ]
            }
        }
    });

    grunt.registerTask('e2e', function(){
        var target = process.env.TRAVIS_JOB_NUMBER ? 'travis' : 'local';
        grunt.task.run([
            'webdriver',
            'connect:test',
            'protractor:' + target
        ]); 
    });

    grunt.registerTask('server', function (target) {
        if(target === 'dist'){
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.file.mkdir(config.app + '/modules/swagger');
        grunt.task.run([
            'peg',
            'ngconstant:server',
            'swagger-js-codegen',
            'less',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('unit-tests', ['clean:pre', 'less', 'karma:1.2.9', 'clean:post']);
    grunt.registerTask('test', ['clean:pre', 'less', 'karma:1.2.9', 'clean:post', 'e2e']);
    grunt.registerTask('build', ['clean:pre', 'peg', 'swagger-js-codegen']);
    grunt.registerTask('default', ['jsonlint', 'jshint', 'build', 'test']);
};
