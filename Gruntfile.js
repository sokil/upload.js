module.exports = function (grunt) {
    'use strict';

    var env = grunt.option('env') || 'prod';
    grunt.config('env', env);
    console.log('Environment: ' + env);

    grunt.initConfig({
        jshint: {
            files: [
                'src/*.js',
            ],
            options: {
                loopfunc: true,
                evil: true,
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },
        uglify: {
            concat: {
                options: {
                    compress: false,
                    beautify: true,
                    mangle: false
                },
                files: {
                    'dist/upload.js': [
                        'src/*.js'
                    ]
                }
            },
            compress: {
                options: {
                    compress: true,
                    beautify: false,
                    mangle: true
                },
                files: {
                    'dist/upload.min.js': [
                        'dist/upload.js'
                    ]
                }
            }
        },
        umd: {
            dist: {
                src: 'dist/upload.js',
                objectToExport: 'Uploader',
                amdModuleId: 'uploader',
                deps: {
                    default: ['$'],
                    amd: ['jquery'],
                    cjs: ['jquery'],
                    global: ['jQuery']
                }
            },
        }
    });

    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', [
        'jshint',
        'uglify:concat',
        'umd:dist',
        'uglify:compress'
    ]);
};