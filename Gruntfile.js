module.exports = function (grunt) {
    "use strict";

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        watch: {
            /*
             * watch and compile typescript to javascript
             */
            typescript: {
                files: ['test/work/**/*.ts'],
                tasks: ['ts:normal']
            }
        },

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
                reference: "./test/",       // If specified, generate a reference.ts file at this place                
                out: 'test/out.js',         // If specified, generate an out.js file which is the merged js file     
                watch: './test',              // configure this target to watch a dir 
                options: {                  // override the main options, See : http://gruntjs.com/configuring-tasks#options
                    sourcemap: true,
                    declaration: true
                },
            },
            build: {                        // another target 
                src: ["test/fail/*.ts"],
                options: {                  // overide the main options for this target 
                    sourcemap: false,
                }
            },            
        },
    });

    grunt.loadTasks("tasks");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.registerTask("test", ["clean", "ts"]);
    grunt.registerTask("default", ["test"]);

};
