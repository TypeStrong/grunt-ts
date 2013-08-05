grunt-ts
================
Written from scratch TypeScript compiler task for GruntJS. 

It differs from grunt-typescript and grunt-type in *two key ways*: 

- This is written in TypeScript.
- Always stays updated to the latest stable release of TypesScript because:
 - It simply uses tsc on the commandline.
 - Super short and clear typescript code. 

Check out the complete code: https://github.com/basarat/grunt-ts/blob/master/tasks/ts.ts 

Following are some key features: 
======================

###Compiler support 
Supports all important compiler flags: 

- es3/es5
- commonjs/amd
- sourcemaps
- declaration
- comments
- nolib 
 
Can also do js *file concatenation* using `--out`


###Reference file generation 
Can generate a reference.ts file for you which contains a reference to all your ts files.
This means you never need to cross reference files manually. Just reference `reference.ts` :) 

###Live file watching and building
Can watch a directory for you and recompile your typescript files when any typescript file changes, gets added, gets removed. 
This makes sure your project is always build ready :) 

npm install
======================

The npm package is available here : https://npmjs.org/package/grunt-ts

## Configuration Documentation
After you have grunt installed, you can install `grunt-ts` first:

    npm install grunt-ts

Then modify your `grunt.js` file by adding the following line:

    grunt.loadNpmTasks('grunt-ts');

Then add some configuration for the plugin like so:

    grunt.initConfig({
        ...
        ts: {
            options: {                    // use to override the default options, http://gruntjs.com/configuring-tasks#options
                target: 'es3',            // es3 (default) / or es5
                module: 'commonjs',       // amd , commonjs (default)
                sourcemap: true,          // true  (default) | false
                declaration: false,       // true | false  (default)
                nolib: false,             // true | false (default)
                comments: false           // true | false (default)
            },
            dev: {                          // a particular target   
                src: ["test/work/**/*.ts"], // The source typescript files, http://gruntjs.com/configuring-tasks#files
                reference: "./test/reference.ts",  // If specified, generate this file that you can use for your reference management
                out: 'test/out.js',         // If specified, generate an out.js file which is the merged js file     
                watch: 'test',              // If specified, configures this target to watch the specified director for ts changes and reruns itself.
                options: {                  // override the main options, http://gruntjs.com/configuring-tasks#options
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
        ...
    });
    
You can see a sample grunt file here : https://github.com/basarat/grunt-ts/blob/master/Gruntfile.js
   
### Different configurations per target   
Configuration options are per target. You can see how you can have one set of default options and then override
these selectively for a target (e.g `build` , `dev`, `staging` etc).
This is provided by grunt : http://gruntjs.com/configuring-tasks#options

### Awesome file globs
You can do pretty fancy stuff with your src file selection. 
Again provided by grunt : http://gruntjs.com/configuring-tasks#files
