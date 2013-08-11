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

Can also do js *file concatenation* using `--out`. For file ordering look at Javascript Generation below. 


###Reference file generation 
Can generate a reference.ts file for you which contains a reference to all your ts files.
This means you never need to cross reference files manually. Just reference `reference.ts` :) 


####Javascript generation and ordering
Also if you specify both an out js file via `out` && a reference file via `reference` 
it uses the generated reference file to *order the code in the generated javascript*. 

In your `reference.ts` file you can specify the order for the few files you care about
and leave the rest to be maintained by grunt-ts. 
E.g. in the following case the generated javascript for `someBaseClass.ts` is guaranteed to be at the top,
and the generated javascript for  `main.ts`is guaranteed to be at the bottom of the single merged js file. 
Everything between `grunt-start` and `grunt-end` is generated and maintained
for you. If there is no `grunt-start` section found, it is created for you. If `reference.ts` does not 
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

###Html 2 TypeScript support 
Can reencode html files into typescript and makes them available as a variable. e.g.
a file called `test.html` containing
```html
<div> Some Content </div>
```
is compiled to a typescript file `test.html.ts` containing: 
```typescript
module test { export var html =  '<div> Some content </div>' } 
``` 
so that you can use use the variable `test.html` within your typescript to get the content of test.html 
as a string. The motivatation is to remove http requests to load templates in various front end frameworks. 

####Html 2 TypeScript usage in AngularJS 
This is great for putting variables in templateCache : http://docs.angularjs.org/api/ng.$templateCache 
or even using the html string directly by setting it to the `template` properties (directives/views) instead of `templateUrl`

####Html 2 TypeScript usage in EmberJS
You can specify this string to the template on a view : http://emberjs.com/api/classes/Ember.View.html 
Specifically: http://stackoverflow.com/a/9867375/390330

###Live file watching and building
Can watch a directory for you and recompile your typescript files when any typescript file changes, gets added, gets removed. 
This makes sure your project is always build ready :) 


npm install
======================

The npm package is available here : https://npmjs.org/package/grunt-ts

## Installation Documentation
Install nodejs. Then install grunt-cli using `npm install -g grunt-cli`. Next you can install `grunt` and `grunt-ts` by creating a `package.json`
file containing the following: 

```javascript
{
  "devDependencies": {
    "grunt" : "0.4.1",
    "grunt-ts" : "latest"
  }
}
```
and run `npm install` from the same directory. This will download both grunt and grunt-ts for you. 

## Configuration Documentation
Create a `Gruntfile.js`. Modify it to load grunt-ts by adding the following lines:

    module.exports = function (grunt) {
    
        // load the task 
        grunt.loadNpmTasks("grunt-ts");
        
        // Configure grunt here
    }

Then add some configuration for the plugin like so:

    grunt.initConfig({
        ...
        ts: {            
            dev: {                          // a particular target   
                src: ["test/work/**/*.ts"], // The source typescript files, http://gruntjs.com/configuring-tasks#files
                html: ["test/work/**/*.tpl.html"], // The source html files, https://github.com/basarat/grunt-ts#html-2-typescript-support
                reference: "./test/reference.ts",  // If specified, generate this file that you can use for your reference management
                out: 'test/out.js',         // If specified, generate an out.js file which is the merged js file                     
                watch: 'test',              // If specified, watches this directory for changes, and re-runs the current target  
                options: {                    // use to override the default options, http://gruntjs.com/configuring-tasks#options
					target: 'es3',            // 'es3' (default) | 'es5'
					module: 'commonjs',       // 'amd' (default) | 'commonjs'
					sourcemap: true,          // true  (default) | false
					declaration: false,       // true | false  (default)                
					comments: false           // true | false (default)
				},
            },
            build: {                        // another target 
                src: ["test/work/**/*.ts"],
                options: {                  // overide the main options for this target 
                    sourcemap: false,
                }
            },
        },
        ...
    });

I also recommend adding a default taget you want to run in case you do not want to specify any arguments to grunt: 
```
grunt.registerTask("default", ["ts:dev"]);
```
    
You can see a sample grunt file here : https://github.com/basarat/grunt-ts/blob/master/Gruntfile.js
   
### Different configurations per target   
Configuration options are per target. You can see how you can have one set of default options and then override
these selectively for a target (e.g `build` , `dev`, `staging` etc).
This is provided by grunt : http://gruntjs.com/configuring-tasks#options

### Awesome file globs
You can do pretty fancy stuff with your src file selection. 
Again provided by grunt : http://gruntjs.com/configuring-tasks#files
