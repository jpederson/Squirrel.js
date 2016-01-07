module.exports = function(grunt) {

    // Load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        // Watch for changes to the main file to trigger uglification and hinting
        watch: {
            js: {
                files: ['jquery.squirrel.js'],
                tasks: ['jsbeautifier', 'jshint', 'uglify'],
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
            },
        },

        // Compile the saas file to css
        sass: {
            dist: {
                options: {
                    // Options are 'nested', 'compact', 'compressed', 'expanded'
                    style: 'compressed',
                },
                files: {
                    'example.css': 'example.scss',
                },
            },
        },

        // Check the code meets the following standards
        jshint: {
            all: ['jquery.squirrel.js'],
            options: {
                jshintrc: '.jshintrc',
            },
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
                        comparisons: true,
                        conditionals: true,
                        dead_code: true,
                        drop_console: true,
                        unsafe: true,
                        unused: true,
                    },
                },
            },
        },

        // Beautify the main script using JSBeautifier
        jsbeautifier: {
            files: ['jquery.squirrel.js'],
            options: {
                js: {
                    brace_style: 'collapse',
                    break_chained_methods: false,
                    end_with_newline: true,
                    eval_code: false,
                    indent_char: ' ',
                    indent_level: 0,
                    indent_size: 4,
                    indent_with_tabs: false,
                    jslint_happy: false,
                    keep_array_indentation: false,
                    keep_function_indentation: false,
                    max_preserve_newlines: 10,
                    preserve_newlines: true,
                    space_after_anon_function: true,
                    space_before_conditional: true,
                    space_in_empty_paren: false,
                    space_in_paren: false,
                    unescape_strings: false,
                    wrap_line_length: 0,
                },
            },
        },

    });

    // Register the default task to watch for any changes to the main files
    grunt.registerTask('default', ['watch']);

    // 'grunt jshint' to check the syntax
    // 'grunt uglify' to uglify the main file
};
