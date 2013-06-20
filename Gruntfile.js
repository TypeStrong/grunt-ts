module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        clean:{
            test:[
                "test/**/*.js",                
            ]
        },
        ts:{            
            src:["test/fail.ts","test/work.ts"]            
        }
    });

    grunt.loadTasks("tasks");    
    grunt.loadNpmTasks("grunt-contrib-clean");    
	grunt.registerTask("test", ["clean", "ts"]);
    grunt.registerTask("default", ["test"]);

};
