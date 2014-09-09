module.exports = function (grunt) {
    'use strict';

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
    var rewriteRules = [
        '!\\.html|\\.xml|\\images|\\.js|\\.css|\\.png|\\.jpg|\\.woff|\\.ttf|\\.svg|\\.ico /index.html [L]'
    ];

    var readConfigJson = function() {
        var _ = require('lodash');

        var isCustomEndpoint = _.findIndex(process.argv, function (val) {
            return val === 'ngconstant:custom';
        }) > -1;

        var buildId;
        var idx = _.findIndex(process.argv, function (val) {
            return val.substring(0, '--build-id='.length) === '--build-id=';
        });
        buildId = idx > -1 ? process.argv[idx].substring('--build-id='.length) : undefined;
        if (buildId) {
            buildId = buildId.replace('.', '-');
        } else if (isCustomEndpoint) {
            grunt.fail.fatal('Unable to find --build-id=myfeature. ngconstant:custom only works with arg --build-id.');
        }
        var id = buildId === '' ? 'secxbrl' : 'secxbrl-' + buildId;
        grunt.log.writeln('Build ID: ' + id);
        var config = grunt.file.readJSON('config.json');
        config.custom = {};
        if (buildId) {
            config.custom.buildId = id;
        }
        return config;
    };

    // Project configuration.
    grunt.initConfig({
        config: readConfigJson(),
        watch: {
            less: {
                files:  ['app/**/*.less'],
                tasks: ['less']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    'app/**/*.html',
                    '{.tmp,app}/styles/{,*/}*.css',
                    '{.tmp,app}/**/*.js',
                    'app/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        //Connect
        connect: {
            options: {
                port: grunt.option('port') || 9000,
                hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            modRewrite(rewriteRules),
                            mountFolder(connect, 'app'),
                            mountFolder(connect, '')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    keepalive: false,
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            modRewrite(rewriteRules),
                            mountFolder(connect, 'dist')
                        ];
                    }
                }
            },
            'dist-dev': {
                options: {
                    keepalive: false,
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            modRewrite(rewriteRules),
                            mountFolder(connect, 'app'),
                            mountFolder(connect, '')
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
                    'app/styles/index.css': ['app/styles/index.less']
                }
            }
        },
        peg: {
            options: { trackLineAndColumn: true },
            excelGrammar : {
                src: 'pegjs/excelGrammar.pegjs',
                dest: 'app/modules/excel-parser.js',
                angular: {
                    module: 'excel-parser',
                    factory: 'ExcelParser'
                }
            },
            formulaGrammar : {
                src: 'pegjs/formulaGrammar.pegjs',
                dest: 'app/modules/formula-parser.js',
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
                        moduleName: 'report-api',
                        className: 'ReportAPI',
                        fileName: 'report-api.js',
                        angularjs: true
                    },
                    {
                        swagger: 'swagger/session.json',
                        moduleName: 'session-api',
                        className: 'SessionAPI',
                        fileName: 'session-api.js',
                        angularjs: true
                    },
                    {
                        swagger: 'swagger/queries.json',
                        moduleName: 'queries-api',
                        className: 'QueriesAPI',
                        fileName: 'queries-api.js',
                        angularjs: true
                    }
                ],
                dest: 'app/modules'
            },
            all: {}
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: ['.tmp', 'dist/*', '!/.git*']
                }]  
            },  
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: ['Gruntfile.js',
                  'app/**/*.js',
                  'tasks/**/*.js',
                  'tests/**/*.js'
            ]
        },
        karma: {
            options: {
                configFile: './karma.conf.js'
            },
            dev: {
                options: {
                    files: [
                        'bower_components/angular/angular.js',
                        'bower_components/angular-mocks-1.2.9/angular-mocks.js',
                        'bower_components/ngprogress-lite/ngprogress-lite.js',
                        'bower_components/angular-ui-router/release/angular-ui-router.js',
                        'bower_components/angular-sanitize/angular-sanitize.js',
                        'bower_components/angular-ui-bootstrap-bower/ui-bootstrap.js',
                        'bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
                        'bower_components/angular-cache/dist/angular-cache.js',
                        'bower_components/layoutmodel-renderer-angular/app/directive/layoutmodel.js',
                        'bower_components/layoutmodel-renderer-angular/app/directive/layoutmodeltemplate.js',
                        'bower_components/flexy-layout/flexy-layout.debug.js',
                        'bower_components/angular-ui-router/release/angular-ui-router.js',
                        'bower_components/angular-ui-tree/dist/angular-ui-tree.js',

                        'app/constants.js',
                        'app/modules/report-api.js',
                        'app/modules/session-api.js',
                        'app/modules/queries-api.js',
                        'app/modules/api.js',
                        'app/modules/excel-parser.js',
                        'app/modules/formula-parser.js',
                        'app/modules/report-api.js',
                        'app/modules/report-model.js',
                        'app/modules/rules-model.js',
                        'app/app.js',
                        'app/modules/excel-parser.js',
                        'app/modules/session-model.js',
                        'app/modules/rules-model.js',
                        'app/modules/filter-model.js',
                        'app/modules/ui/api-status.js',
                        'app/modules/ui/forms.js',
                        'app/modules/ui/account.js',
                        'app/modules/ui/resize.js',
                        'app/modules/formula-parser.js',
                        
                        'app/report/taxonomy/taxonomy.js',
                        'app/report/taxonomy/concept/overview/overview.js',
                        
                        'tests/unit/karma.start.js',
                        'app/**/*-test.js'
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
            travis: 'tests/e2e/config/protractor-travis-nosaucelabs-conf.js',
            local: 'tests/e2e/config/protractor-conf.js'
        },
        ngconstant: {
            options: {
                space: '    '
            },
            server: {
                dest: 'app/constants.js',
                name: 'constants',
                wrap: '/*jshint quotmark:double */\n"use strict";\n\n<%= __ngModule %>',
                constants: {
                    'APPNAME': 'report-editor',
                    'API_URL': '//<%= config.server.api %>/v1',
                    'REGISTRATION_URL': '<%= config.server.registration %>',
                    'ACCOUNT_URL': '<%= config.server.account %>',
                    'DEBUG': true
                }
            },
            test: {
                dest: 'app/constants.js',
                name: 'constants',
                wrap: '/*jshint quotmark:double */\n"use strict";\n\n<%= __ngModule %>',
                constants: {
                    'APPNAME': 'report-editor',
                    'API_URL': '//<%= config.test.api %>/v1',
                    'REGISTRATION_URL': '<%= config.test.registration %>',
                    'ACCOUNT_URL': '<%= config.test.account %>',
                    'DEBUG': true
                }
            },
            beta: {
                dest: 'app/constants.js',
                name: 'constants',
                wrap: '/*jshint quotmark:double */\n"use strict";\n\n<%= __ngModule %>',
                constants: {
                    'APPNAME': 'report-editor',
                    'API_URL': '//<%= config.beta.api %>/v1',
                    'REGISTRATION_URL': '<%= config.beta.registration %>',
                    'ACCOUNT_URL': '<%= config.beta.account %>',
                    'DEBUG': false
                }
            },
            prod: {
                dest: 'app/constants.js',
                name: 'constants',
                wrap: '/*jshint quotmark:double */\n"use strict";\n\n<%= __ngModule %>',
                constants: {
                    'APPNAME': 'report-editor',
                    'API_URL': '//<%= config.prod.api %>/v1',
                    'REGISTRATION_URL': '<%= config.prod.registration %>',
                    'ACCOUNT_URL': '<%= config.prod.account %>',
                    'DEBUG': false
                }
            },
            custom: {
                dest: 'app/constants.js',
                name: 'constants',
                wrap: '/*jshint quotmark:double */\n"use strict";\n\n<%= __ngModule %>',
                constants: {
                    'APPNAME': 'report-editor',
                    'API_URL': '//<%= config.custom.buildId %>.28.io/v1',
                    'REGISTRATION_URL': 'http://<%= config.custom.buildId %>.s3-website-us-east-1.amazonaws.com/auth',
                    'ACCOUNT_URL': 'http://<%= config.custom.buildId %>.s3-website-us-east-1.amazonaws.com/account/info',
                    'DEBUG': true
                }
            }
        },
        s3: {
            options: {
                access: 'public-read',
                maxOperations: 5,
                gzip: true,
                gzipExclude: ['.jpg', '.jpeg', '.png', '.xml', '.json', '.pdf', '.txt', '.ico']
            },
            prod: {
                bucket: 'reports.secxbrl.info',
                upload: [{
                    src: 'dist/**/*',
                    dest: '',
                    rel: 'dist/',
                }]
            }
        },
        jsonlint: {
            all: {
                src: [
                    'package.json',
                    'config.json',
                    'bower.json',
                    '.bowerrc',
                    'swagger/*'
                ]
            }
        },
        useminPrepare: {
            html: [ 'app/**/*.html' ],
            css: 'app/styles/**/*.css',
            options: {
                dest: 'dist'
            }
        },
        usemin: {
            html: [ 'dist/*.html' ],
            css: 'dist/styles/**/*.css',
            options: {
                dirs: ['dist']
            }
        },
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'app/images',
                    src: '*.{png,jpg,jpeg,svg}',
                    dest: 'dist/images'
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {},
                files: [{
                    expand: true,
                    cwd: 'app',
                    src: [ '**/*.html'],
                    dest: 'dist'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'app',
                    dest: 'dist',
                    src: [
                        '*.{ico,png,txt}',
                        'images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                    ]
                }, {
                    expand: true,
                    cwd: 'bower_components/font-awesome/fonts',
                    dest: 'dist/fonts',
                    src: ['*']
                }, {
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    dest: 'dist/scripts',
                    src: ['*']
                }]
            }
        },
        concurrent: {
            server: [],
            test: [],
            dist: [
                'less',
                'imagemin',
                'htmlmin'
            ]
        },
        rev: {
            dist: {
                files: {
                    src: [
                        'dist/scripts/**/*.js',
                        'dist/styles/**/*.css',
                        'dist/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        'dist/styles/fonts/*'
                    ]
                }
            }
        },
        uglify: {
            options: {
                //sourceMap: true,
                //sourceMapIncludeSources: true
            }
        }
    });
    
    grunt.registerTask('deploy', function() {
        if(process.env.TRAVIS_BRANCH === 'master' && process.env.TRAVIS_PULL_REQUEST === 'false') {
            grunt.task.run(['s3:prod']);
        }
    });
    
    grunt.registerTask('e2e', function(){
        var target = process.env.TRAVIS_JOB_NUMBER ? 'travis' : 'local';
        grunt.task.run([
            'webdriver',
            'connect:dist',
            'protractor:' + target
        ]);
    });

    grunt.registerTask('e2e-dev', function(){
        var target = process.env.TRAVIS_JOB_NUMBER ? 'travis' : 'local';
        grunt.task.run([
            'webdriver',
            'connect:dist-dev',
            'protractor:' + target
        ]);
    });

    grunt.registerTask('server', function (target) {
        if(target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'peg',
            'swagger-js-codegen',
            'less',
            'concurrent:server',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('build', function () {
        //var env = (target ? target : 'server');

        grunt.task.run([
            'ngconstant:server',
            'clean:dist',
            'less',
            'peg',
            'swagger-js-codegen',
            'useminPrepare',
            'concurrent:dist',
            'concat',
            'copy',
            'ngmin',
            'cssmin',
            'uglify',
            'rev',
            'usemin'
        ]);
    });

    grunt.registerTask('test', ['build', 'karma', 'e2e']);
    grunt.registerTask('default', ['jsonlint', 'jshint', 'test', 'deploy']);
};
