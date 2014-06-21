module.exports = function (grunt) {
    "use strict";
    
    var srcDir = 'lib';

    grunt.initConfig({
        ts: {
            options: {
                target: 'es5',
                module: 'commonjs'
            },
            dev: {
                src: [srcDir + '/**/*.ts'],
                watch: srcDir
            }
        },
    });
    
    grunt.loadNpmTasks("grunt-ts");
    grunt.registerTask("default", ["ts:dev"]);
};
