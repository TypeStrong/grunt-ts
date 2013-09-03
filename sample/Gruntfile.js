module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        ts: {
            options: {                    // use to override the default options, See : http://gruntjs.com/configuring-tasks#options
                target: 'es3',            // es3 (default) / or es5
                module: 'commonjs',       // amd , commonjs (default)
                sourcemap: true,          // true  (default) | false
                declaration: false,       // true | false  (default)
                nolib: false,             // true | false (default)
                comments: false           // true | false (default)
            },
            dev: {                        // a particular target   
                src: ["app/**/*.ts"],               // The source typescript files, http://gruntjs.com/configuring-tasks#files
                html: ['app/**/**.tpl.html'],       // The source html files, https://github.com/basarat/grunt-ts#html-2-typescript-support
                reference: 'app/reference.ts',      // If specified, generate this file that you can use for your reference management
                out: 'app/out.js',                  // If specified, generate an out.js file which is the merged js file   
                watch: 'app',                       // If specified, watches this directory for changes, and re-runs the current target  
                options: {                          // use to override the default options, http://gruntjs.com/configuring-tasks#options
                    module: 'amd'
                },
            }
        },
    });
    
    grunt.loadNpmTasks("grunt-ts")    
    grunt.registerTask("default", ["ts:dev"]);
};
