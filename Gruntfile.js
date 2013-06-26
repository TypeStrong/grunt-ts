module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        clean:{
            test:[
                "test/**/*.js",                
            ]
        },
        ts:{            
			normal:{
				src:["test/work/**/*.ts"],				
				verbose: true
			},
			fail:{
				src:["test/fail/*.ts"],
				verbose: true			
			}
        },		
    });

    grunt.loadTasks("tasks");    
    grunt.loadNpmTasks("grunt-contrib-clean");    
	grunt.registerTask("test", ["clean", "ts"]);
    grunt.registerTask("default", ["test"]);

};
