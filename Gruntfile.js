module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // compass: {
        //     dist: {
        //         options: {
        //             sassDir: ['static/scss','src/assets/css'],
        //             cssDir: 'src/assets/css',
        //             environment: 'production'
        //         }
        //     },
        //     dev: {
        //         options: {
        //             sassDir: 'static/scss',
        //             cssDir: 'src/assets/css'
        //         }
        //     }
        // },

        // watch: {
        //     sass: {
        //         files: ['static/scss/*.scss','static/scss/style/*.scss'],
        //         tasks: ['sass','cssmin']
        //     }
        // },

        sass: {
            dist: {
                options: {
                    compass: true,
                },
                files: {
                    'src/assets/css/style.css': 'static/scss/style/style.scss',
                    'src/assets/css/print.css': 'static/scss/style/print.scss',
                    'src/assets/css/bootstrap.css' : 'static/scss/bootstrap.scss',
                    'src/assets/css/bootstrap-grid.css' : 'static/scss/bootstrap-grid.scss',
                    'src/assets/css/bootstrap-flex.css' : 'static/scss/bootstrap-flex.scss',
                    'src/assets/css/bootstrap-reboot.css' : 'static/scss/bootstrap-reboot.scss'
                }
            }
        },

        // concat: {
        //     options: {
        //         separator: ';',
        //         stripBanners: true,
        //         banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        //     },

        //     dist: {
        //         src: ['js/*.js'],
        //         dest: 'js/main.min.js'
        //     }
        // },


        // uglify: {
        //     options: {
        //         manage: false,
        //         preserveComments: 'all' //preserve all comments on JS files
        //     },
        //     my_target: {
        //         files: {
        //             'src/assets/js/main.min.js': [
        //                 'src/assets/js/jquery-2.2.4.min.js',
        //                 'src/assets/js/tether.min.js',
        //                 'src/assets/js/bootstrap.min.js',
        //                 'src/assets/cs/ie7.js',
        //                 // 'src/assets/js/html2pdf.js',
        //                 // 'src/assets/js/html2canvas.js',
        //                 'src/assets/js/jspdf.min.js',
        //                 // 'src/assets/js/filesaver.min.js',
        //                 'src/assets/js/Chart.min.js',
        //             ]
        //         }
        //     }
        // },


        cssmin: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'src/assets/css/',
                    src: ['*.css', '!*.min.css'],
                    dest: 'src/assets/css/',
                    ext: '.min.css'

                }]
            }
        }

    });

    // Load the plugin that provides the "compass" task.
    // grunt.loadNpmTasks('grunt-contrib-compass');

    // Load the plugin that provides the "watch" task.
    // grunt.loadNpmTasks('grunt-contrib-watch');

    // Load the plugin that provides the "sass" task.
    grunt.loadNpmTasks('grunt-contrib-sass');

    // Load the plugin that provides the "uglify" task.
    // grunt.loadNpmTasks('grunt-contrib-uglify');

    // Load the plugin that provides the "concat" task.
    // grunt.loadNpmTasks('grunt-contrib-concat');

    // Load the plugin that provides the "cssmin" task.
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task(s).
    grunt.registerTask('default', ['sass' , 'cssmin']);
};
