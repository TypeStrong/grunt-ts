grunt-ts
================
A written from scratch TypeScript compiler task for GruntJS. 

It differs from grunt-typescript and grunt-type in *two key ways*: 

- This is written in TypeScript 0.9 
- It is super easy to extend and update 
 - it simply uses tsc on the commandline.
 - Super short and clear typescript code. 

Check out the complete code: https://github.com/basarat/grunt-ts/blob/master/tasks/ts.ts 

Compiles all files. Stops on a compilation error reporting it on the console. Makes for easier view.

The npm package is available here : https://npmjs.org/package/grunt-ts

## Documentation
You'll need to install `grunt-ts` first:

    npm install grunt-ts

Then modify your `grunt.js` file by adding the following line:

    grunt.loadNpmTasks('grunt-ts');

Then add some configuration for the plugin like so:

    grunt.initConfig({
        ...
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
        ...
    });
   
