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
        swagger: {
            options: {
                apis: [
                    {
                        swagger: 'swagger/reports.json',
                        module: 'report-api',
                        newModule: true,
                        service: 'ReportAPI',
                        filename: 'report-api'
                    }
                ],
                dest: '<%= config.app %>/modules'
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
            src: ['Gruntfile.js', '<%= config.app %>/modules/**/*.js', '<%= config.app %>/reports/**/*.js', 'tasks/**/*.js', 'tests/**/*.js'],
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

        grunt.task.run([
            'peg',
            'swagger',
            'less',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('test', ['clean:pre', 'less', 'karma:1.2.9', 'clean:post', 'e2e']);
    grunt.registerTask('build', ['clean:pre', 'peg', 'swagger']);
    grunt.registerTask('default', ['jshint', 'build', 'test']);
};
