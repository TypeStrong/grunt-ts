grunt-ts
================
Written from scratch TypeScript compiler task for GruntJS. 

It differs from grunt-typescript and following are the reasons why it was created. 

- This is written in [clear TypeScript code](https://github.com/basarat/grunt-ts/blob/master/tasks/ts.ts)
- Gives a typescript development workflow in addition to simple file compilation. 
- Super simple to update to the [latest version of the typescript](https://github.com/basarat/grunt-ts/commit/6636f95b9d45b69e64771c603d3b08ec829e01e6)

Comes with a video introduction : http://youtu.be/Km0DpfX5ZxM , 
If you already know grunt then skip to http://youtu.be/Km0DpfX5ZxM?t=11m16s

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

Also if you specify both an out js file via `out` && a reference file via `reference` 
it uses the generated reference file to order the code in the generated javascript. In your `reference.ts` file you 
can specify the order for the few files you care about and leave the rest to be maintained by grunt-ts. 
E.g. in the following case `someBaseClass.ts` is guaranteed to be the first file, and `main.ts`
is guaranteed to be the last file. Everything between `grunt-start` and `grunt-end` is generated and maintained
for you. If there is no `grunt-start` section found, it is created for you. If file `reference.ts` does not 
exist originally, it is created for you. 

```typescript

/// <reference path="someBaseClass.ts" />

// You can even put comments here and they are preserved
var orEvenCode = 123; // That you want to come before or after all your files

//grunt-start
/// <reference path="autoreference.ts" />
/// <reference path="someOtherFile.ts" />
//grunt-end


/// <reference path="main.ts" />
```
###Live file watching and building
Can watch a directory for you and recompile your typescript files when any typescript file changes, gets added, gets removed. 
This makes sure your project is always build ready :) 

npm install
======================

The npm package is available here : https://npmjs.org/package/grunt-ts

## Configuration Documentation
After you have grunt installed, you can install `grunt-ts` first:

    npm install grunt-ts

Then modify your `Gruntfile.js` file by adding the following line:

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
