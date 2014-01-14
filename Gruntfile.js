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
            options: {
                target: 'es3',            // 'es3' (default) | 'es5'
                module: 'commonjs',       // use amd for asynchonous loading or commonjs  'amd' (default) | 'commonjs'
                sourcemap: true,          // generate a source map file for each result js file (true (default) | false)
                declaration: false,       // generate a declaration .d.ts file for each resulting js file (true | false  (default))
                nolib: false,             // ??? (true | false (default))
                comments: false,          // leave comments in compiled js code (true | false (default))
                verbose: true             // print the tsc command (true | false (default))
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
            amdloadersrc: {
                src: ['test/amdloader/ts/app/**/*.ts'],
                html: ['test/amdloader/ts/app/**/*.html'],
                reference: 'test/amdloader/ts/app/reference.ts',
                outDir: 'test/amdloader/js/app',
                amdloader: 'test/amdloader/js/app/loader.js',
                //  watch: 'test/amdloader/app'
            },
            amdloadertest: {
                src: ['test/amdloader/ts/test/**/*.ts'],
                html: ['test/amdloader/ts/test/**/*.html'],
                reference: 'test/amdloader/ts/test/reference.ts',
                outDir: 'test/amdloader/js/test',
                amdloader: 'test/amdloader/js/test/loader.js',
            },
            amdtest: {
                src: ['test/amdtest/**/*.ts'],                
                options: {
                    module: 'amd'
                }
            },
            warnbothcomments: {
                src: ['test/abtest/**/*.ts'],
                reference: 'test/abtest/reference.ts',
                out: 'test/abtest/out.js',
                options: {
                    // this should cause a warning
                    comments: true,
                    removeComments: false,
                },
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
            nocompile: {
                src: ['test/nocompile/**/*.ts'],
                reference: 'test/nocompile/reference.ts',
                out: 'test/nocompile/out.js',
                options: {
                    compile: false,
                }
            },
            outdirtest:{
                src: ['test/outdirtest/**/*.ts'],                                          
                outDir: 'test/outdirtest/js',                
            },
            sourceroottest: {
                src: ['test/sourceroot/src/**/*.ts'],
                html: ['test/sourceroot/src/**/*.html'],
                reference: 'test/sourceroot/src/reference.ts',
                out: 'test/sourceroot/public/js/app.js',
                options: {
                    sourceRoot: 'js',
                    mapRoot: 'map',  // assuming we move all map files with some other grunt task
                },
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
//                watch: 'test',
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

    grunt.registerTask("test", ["clean", "ts:htmltest"]);
    grunt.registerTask("test", ["clean", "ts:htmltest", "ts:definitelyTypedTest"]);
    grunt.registerTask("default", ["test"]);

};
