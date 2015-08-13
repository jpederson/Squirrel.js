
module.exports = function(grunt) {

    // Load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        // Watch for changes to the main file to trigger uglification and hinting
        watch: {
            js: {
                files: ['jquery.squirrel.js'],
                tasks: ['jshint', 'uglify'],
                options: {
                    livereload: true,
                },
            },
            css: {
                files: 'example.scss',
                tasks: ['sass'],
                options: {
                    livereload: true,
                },
            }
        },

        // Compile the saas file to css
        sass: {
            dist: {
                options: {
                    // Options are 'nested', 'compact', 'compressed', 'expanded'
                    style: 'compressed'
                },
                files: {
                    'example.css': 'example.scss'
                }
            }
        },

        // Check the code meets the following standards
        jshint: {
            all: ['jquery.squirrel.js'],
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                notypeof: true,
                undef: true,
                browser: true,
                globals: {
                  jQuery: true,
                  '$': true
                }
            }
        },

        // Uglify aka minify the main file
        uglify: {
            js: {
                files: {
                    'jquery.squirrel.min.js': 'jquery.squirrel.js',
                },
                options: {
                    // See the uglify documentation for more details
                    compress: {
                        dead_code: true,
                        drop_console: true,
                        unused: true
                    }
                }
            }
        }

    });

    // Register the default task to watch for any changes to the main files
    grunt.registerTask('default', ['watch']);

    // 'grunt jshint' to check the syntax
    // 'grunt uglify' to uglify the main file
};
