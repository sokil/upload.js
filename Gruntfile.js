module.exports = function (grunt) {
    'use strict';

    var env = grunt.option('env') || 'prod';
    grunt.config('env', env);
    console.log('Environment: ' + env);

    grunt.initConfig({
        jshint: {
            files: [
                'src/*.js'
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
                        'src/progress/*.js',
                        'src/transport/*.js',
                        'src/helper.js',
                        'src/upload.js',
                        'src/upload.jquery.js'
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
                objectToExport: 'Upload',
            }
        },
        watch: {
            js: {
                files: ['src/**/*'],
                tasks: ['build'],
                options: {},
            },
        }
    });

    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build', [
        'jshint',
        'uglify:concat',
        'umd:dist',
        'uglify:compress'
    ]);

    grunt.registerTask('rebuild', [
        'watch'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
