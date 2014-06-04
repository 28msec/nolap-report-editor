module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.task.loadTasks('tasks');
    
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        peg: {
            // https://github.com/dvberkel/grunt-peg
            options: { trackLineAndColumn: true },
            excelGrammar : {
                src: 'pegjs/excelGrammar.pegjs',
                dest: 'src/pegjs/excelParser.js',
                angular: {
                    module: 'excelParser',
                    factory: 'ExcelParser'
                }
            },
            formulaGrammar : {
                src: 'pegjs/formulaGrammar.pegjs',
                dest: 'src/pegjs/formulaParser.js',
                angular: {
                    module: 'formulaParser',
                    factory: 'FormulaParser'
                }
            }
        },
        ngconstant: {
            options: {
                space: '    ',
                deps: false
            },
            tpl: {
                name: 'nolapReportEditor',
                dest: 'src/tpl.js',
                constants: {
                    PresentationTreeTpl: grunt.file.read('tpl/tree.html'),
                    ConceptMapTpl: grunt.file.read('tpl/concept-map.html'),
                    BusinessRuleTpl: grunt.file.read('tpl/business-rule.html'),
                    RulesEditorTpl: grunt.file.read('tpl/rules-editor.html'),
                    ConceptTpl: grunt.file.read('tpl/concept.html')
                }
            }
        },
        swagger: {
            options: {
                apis: [
                    {
                        swagger: 'swagger/reports.json',
                        module: 'reports.api.28.io',
                        newModule: true,
                        service: 'ReportAPI'
                    }
                ],
                dest: 'src/swagger'
            },
            all: {}
        },
        jsdoc: {
            docs: {
                src: ['src/editor.js', 'src/report.js'],
                options: {
                    destination: 'out'
                }
            }
        },
        'gh-pages': {
            docs: {
                src: '**/*',
                options: {
                    base: 'out'
                }
            }
        },
        clean: {
            pre: ['dist/', 'coverage/', 'out/'],
            post: []
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: ['Gruntfile.js', 'src/**/*.js', 'test/*.js', 'tasks/*.js'],
        },
        concat: {
            options: {
                separator: ''
            },
            dist: {
                src: ['src/editor.js', 'src/swagger/ReportAPI.js', 'src/tpl.js', 'src/formula.js', 'src/report.js', 'src/pegjs/excelParser.js'],
                dest: 'dist/nolap-report-editor.js'
            }
        },
        uglify: {
            main: {
                options: {
                    
                },
                files: {
                    'dist/nolap-report-editor.min.js': ['dist/nolap-report-editor.js']
                }
            }
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
            '1.0.4': {
                options: {
                    files: [
                        'bower_components/angular-1.0.4/angular.js',
                        'bower_components/angular-mocks-1.0.4/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.0.5': {
                options: {
                    files: [
                        'bower_components/angular-1.0.5/angular.js',
                        'bower_components/angular-mocks-1.0.5/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.0.6': {
                options: {
                    files: [
                        'bower_components/angular-1.0.6/angular.js',
                        'bower_components/angular-mocks-1.0.6/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.0.7': {
                options: {
                    files: [
                        'bower_components/angular-1.0.7/angular.js',
                        'bower_components/angular-mocks-1.0.7/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.0.8': {
                options: {
                    files: [
                        'bower_components/angular-1.0.8/angular.js',
                        'bower_components/angular-mocks-1.0.8/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.1.4': {
                options: {
                    files: [
                        'bower_components/angular-1.1.4/angular.js',
                        // hopefully this works. 1.1.4 isn't available on bower
                        'bower_components/angular-mocks-1.1.5/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.1.5': {
                options: {
                    files: [
                        'bower_components/angular-1.1.5/angular.js',
                        'bower_components/angular-mocks-1.1.5/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.2.0': {
                options: {
                    files: [
                        'bower_components/angular-1.2.0/angular.js',
                        'bower_components/angular-mocks-1.2.0/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.2.1': {
                options: {
                    files: [
                        'bower_components/angular-1.2.1/angular.js',
                        'bower_components/angular-mocks-1.2.1/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.2.2': {
                options: {
                    files: [
                        'bower_components/angular-1.2.2/angular.js',
                        'bower_components/angular-mocks-1.2.2/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.2.3': {
                options: {
                    files: [
                        'bower_components/angular-1.2.3/angular.js',
                        'bower_components/angular-mocks-1.2.3/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.2.4': {
                options: {
                    files: [
                        'bower_components/angular-1.2.4/angular.js',
                        'bower_components/angular-mocks-1.2.4/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.2.5': {
                options: {
                    files: [
                        'bower_components/angular-1.2.5/angular.js',
                        'bower_components/angular-mocks-1.2.5/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.2.6': {
                options: {
                    files: [
                        'bower_components/angular-1.2.6/angular.js',
                        'bower_components/angular-mocks-1.2.6/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            },
            '1.2.7': {
                options: {
                    files: [
                        'bower_components/angular-1.2.7/angular.js',
                        'bower_components/angular-mocks-1.2.7/angular-mocks.js',
                        'dist/nolap-report-editor.js',
                        'test/karma.start.js',
                        'test/*.js'
                    ]
                }
            }
        },
        coveralls: {
            options: {
                'coverage_dir': 'coverage'
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        nonull:true,
                        src: 'dist/nolap-report-editor.js',
                        dest: '../secxbrl.info/app/bower_components/nolap-report-editor/'
                    }
                ]
            }
        }
    });

    grunt.registerTask('test', ['karma:1.2.0']);
    grunt.registerTask('release', ['clean:pre', 'concat', 'test', 'jsdoc', 'clean:post']);//uglify
    grunt.registerTask('debug', ['clean:pre', 'concat', 'clean:post']);//uglify
    grunt.registerTask('build', ['clean:pre', 'ngconstant:tpl', 'peg', 'swagger', 'release']);
    grunt.registerTask('devbuild', ['clean:pre', 'ngconstant:tpl', 'peg', 'swagger', 'debug', 'copy']);
    grunt.registerTask('default', ['jshint', 'build']);
};
