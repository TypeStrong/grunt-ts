module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({

        clean: {
            test: [
                "test/**/*.js",
                "test/**/*.html.ts",
            ]
        },

        ts: {
            options: {                    // use to override the default options, See : http://gruntjs.com/configuring-tasks#options
                target: 'es3',            // es3 (default) / or es5
                module: 'commonjs',       // amd , commonjs (default)
                sourcemap: true,          // true  (default) | false
                declaration: false,       // true | false  (default)
                nolib: false,             // true | false (default)
                comments: false           // true | false (default)
            },
            dev: {                          // a particular target   
                src: ["test/work/**/*.ts"], // The source typescript files, See : http://gruntjs.com/configuring-tasks#files                
                out: 'test/work/out.js',    // If specified, generate an out.js file which is the merged js file                     
                options: {                  // override the main options, See : http://gruntjs.com/configuring-tasks#options
                    sourcemap: true,
                    declaration: true
                },
            },
            abtest: {
                src: ['test/abtest/**/*.ts'],
                reference: 'test/abtest/reference.ts',
                out: 'test/abtest/out.js',                
            },
            amdtest: {
                src: ['test/amdtest/**/*.ts'],                
                options: {
                    module: 'amd'
                }
            },
            htmltest: {
                src: ['test/html/**/*.ts'],                            
                html: ['test/html/**/*.tpl.html'],    
                reference: 'test/html/reference.ts',
                out: 'test/html/out.js',                
            },
            definitelyTypedTest: {
                src: ['test/definitelytypedtest/**/*.ts'],
                html: ['test/definitelytypedtest/**/*.tpl.html'],
                reference: 'test/definitelytypedtest/reference.ts',
                out: 'test/definitelytypedtest/out.js',
            },
            outdirtest:{
                src: ['test/outdirtest/**/*.ts'],                                          
                outDir: 'test/outdirtest/js',                
            },
            amdloadertest: {
                src: ['test/amdloader/**/*.ts'],
                html: ['test/amdloader/**/*.tpl.html'],                
                reference: 'test/amdloader/ts/reference.ts',
                outDir: 'test/amdloader/js',
                amdloader: 'test/amdloader/js/loader.js',
              //  watch: 'test/amdloader'
            },
            templatecache: {
                src: ['test/templatecache/**/*.ts'],         
                reference: 'test/templatecache/ts/reference.ts',                
                amdloader: 'test/templatecache/js/loader.js',                
                outDir: 'test/templatecache/js',
                templateCache: {
                    baseUrl : 'test/templatecache/js/',
                    src: ['test/templatecache/js/**/*.html'],
                    dest: 'test/templatecache/js/templateCache.js',
                },
            },
            fail: {                        // a designed to fail target
                src: ["test/fail/**/*.ts"],
                watch: 'test',                
                options: {                  // overide the main options for this target 
                    sourcemap: false,
                }
            },
        },
    });

    // Loading it for testing since I have in a local "tasks" folder 
    grunt.loadTasks("tasks");
    // in your configuration you would load this like: 
    //grunt.loadNpmTasks("grunt-ts")

    grunt.loadNpmTasks("grunt-contrib-clean");    
    
    grunt.registerTask("test", ["clean", "ts:htmltest", "ts:definitelyTypedTest"]);
    grunt.registerTask("default", ["test"]);

};
