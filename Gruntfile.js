module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        clean:{
            test:[
                "test/**/*.js",                
            ]
        },
        ts:{
            work:{
                src:["test/work.ts"]
            },
			fail:{
				src:["test/fail.ts"]
			}
        }
    });

    grunt.loadTasks("tasks");    
    grunt.loadNpmTasks("grunt-contrib-clean");    
	grunt.registerTask("test", ["clean", "ts:work", "ts:fail"]);
    grunt.registerTask("default", ["test"]);

};
