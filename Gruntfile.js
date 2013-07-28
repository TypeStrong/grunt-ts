module.exports = function (grunt) {
    "use strict";

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        clean: {
            test: [
                "test/**/*.js",
            ]
        },

        ts: {
            options: {                    // use to override the default options, See : http://gruntjs.com/configuring-tasks#options
                target: 'es3',            // es3 (default) / or es5
                module: 'commonjs',       // amd (default), commonjs
                sourcemap: true,          // true  (default) | false
                declaration: false,       // true | false  (default)
                nolib: false,             // true | false (default)
                comments: false           // true | false (default)
            },
            dev: {                          // a particular target   
                src: ["test/work/**/*.ts"], // The source typescript files, See : http://gruntjs.com/configuring-tasks#files
                reference: "./test/work",   // If specified, generate a reference.ts file at this place                
                out: 'test/work/out.js',    // If specified, generate an out.js file which is the merged js file     
                watch: 'test/work',         // If specified, configures this target to watch the specified director for ts changes and reruns itself.
                options: {                  // override the main options, See : http://gruntjs.com/configuring-tasks#options
                    sourcemap: true,
                    declaration: true
                },
            },
            fail: {                        // another target 
                src: ["test/fail/*.ts"],
                options: {                  // overide the main options for this target 
                    sourcemap: false,
                }
            },
            abtest: {
                src: ['test/abtest/**/*.ts'],
                reference: 'test/abtest',
                out: 'test/abtest/out.js',
                watch: 'test/abtest'
            },
            amdtest: {
                src: ['test/amdtest/**/*.ts'],
                watch: 'test/amdtest',
                options: {
                    module: 'amd'
                }
            }
        },
    });

    // Loading it for testing since I have in a local "tasks" folder 
    grunt.loadTasks("tasks");
    // in your configuration you would load this like: 
    //grunt.loadNpmTasks("grunt-ts")

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.registerTask("test", ["clean", "ts"]);
    grunt.registerTask("default", ["test"]);

};
