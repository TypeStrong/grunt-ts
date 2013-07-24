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
            options:{
                target: 'es3', // es3 (default) / or es5
                module: 'commonjs', // amd (default), commonjs
                sourcemaps: true, // true  (default) | false
                declaration: false // true | false  (default)
            },
            normal: {
                src: ["test/work/**/*.ts"],                
                reference: "./test/", // If specified, generate a reference.ts file at this place, Automatically manages relative file paths                
                out: 'test/out.js', // If specified, generate a out.js file which is the merged typescript output                
                options: {
                    
                },
            },
            fail: {
                src: ["test/fail/*.ts"],                
            },
            watch: {
                src: ["test/work/**/*.ts"],                
                reference: "test/", // If specified, generate a reference.ts file at this place, Automatically manages relative file paths                
                out: 'test/out.js', // If specified, generate a out.js file which is the merged typescript output                
                watch: 'test'
            },
        },
    });

    grunt.loadTasks("tasks");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.registerTask("test", ["clean", "ts"]);
    grunt.registerTask("default", ["test"]);

};
