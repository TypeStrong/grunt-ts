grunt-ts
================
Written from scratch TypeScript compiler task for GruntJS. 
It differs from grunt-typescript which is another excellent [grunt plugin for typescript](https://npmjs.org/package/grunt-typescript).

Following are the reasons why it was created. 

- This is written in [TypeScript](https://github.com/basarat/grunt-ts/blob/master/tasks/ts.ts)
- Gives a typescript development workflow in addition to simple file compilation. 
- Super simple to update to the [latest version of the typescript](https://github.com/basarat/grunt-ts/commit/ffede564f2b20bc4dc207cb1a30dc57db7c44fe5)

Check how it can help streamline your front end development : [Sample usage with AngularJS](http://www.youtube.com/watch?v=0-6vT7xgE4Y&hd=1)

Additional / longer / more basic video tutorial : http://youtu.be/Km0DpfX5ZxM

*If you know Grunt. Here is a quickstart full featured [Gruntfile](https://github.com/basarat/grunt-ts/blob/master/sample/Gruntfile.js)*

Following are some key features: 
======================

###Compiler support 
Supports all important compiler flags: 

- es3/es5
- commonjs/amd
- sourcemaps
- declaration
- comments

Can also do js *file concatenation* using `--out`. Additionally supports an output directory for the generated
javascript using `--outDir` flag. 
For file ordering look at Javascript Generation below. 


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

//grunt-start
/// <reference path="autoreference.ts" />
/// <reference path="someOtherFile.ts" />
//grunt-end


/// <reference path="main.ts" />
```

####Javscript generation Redirect
If you specify `outDir` all output javascript are redirectied to this folder. 
This helps keep your source folder clean.

####AMD / RequireJS support 
If you specify both `outDir` and `amdloader` option a Javascript requireJS loader file is created using the information
available from `reference.ts`. The file consists of three sections. 
* The initial ordered section. 
* A middle order independent section loaded asynchronously. 
* And a final ordered section.

e.g the following `reference` file

```typescript
/// <reference path="classa.ts" />

//grunt-start
/// <reference path="deep/classb.ts" />
/// <reference path="deep/classc.ts" />
//grunt-end

/// <reference path="deep/deeper/classd.ts" />
/// <reference path="app.ts" />
```

Corresponds to an `amdloader`: 

```typescript 
define(function (require) { 
	 require(["./classa"],function (){ // initial ordered files 
	 require(["./deep/classb",                      // grunt-ts start / end unordered async loaded files 
		  "./deep/classc"],function (){
	 require(["./deep/deeper/classd"],function (){  // final ordered files 
	 require(["./app"],function (){                 // another final ordered file

	 });
	 });
	 });
	 });
});
```

#####Advantage of using amdloader option
The following combination of circumstances are why you would use it instead of Compiler supported AMD. 

* You want to use RequireJS since you prefer to debug "js" files instead of "ts" files. 
This is useful in some cases and the most common way is using AMD
* However, File order doesn't matter to you, even when you have inter file depenendency (e.g. AngularJS runtime Dependency injection)

In such a case you can either create a `loader.js` manually or have grunt create it for you. 

**Further Explanation** If you use `export class Foo{}` at the root level of your file the only 
way to use the type information 
of Foo in another file is via an import statement `import foo = require('./potentially/long/path/to/Foo');` 
The ordering implied by this isn't necessary when using a runtime Dependency injection framework like AngularJS.
 Having a loader gives you the js debugging (+ async) advantages
of RequireJS without the overhead of constantly requesting via `import` to get the TypeScript type inference and 
worrying about file paths when they are not relevant. 

PS: your individual file SourceMaps will continue to work. So now you can debug individual "JS" or "TS" files :)


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
            dev: {                                 // a particular target   
                src: ["test/work/**/*.ts"],        // The source typescript files, http://gruntjs.com/configuring-tasks#files
                html: ["test/work/**/*.tpl.html"], // The source html files, https://github.com/basarat/grunt-ts#html-2-typescript-support
                reference: "./test/reference.ts",  // If specified, generate this file that you can use for your reference management
                out: 'test/out.js',                // If specified, generate an out.js file which is the merged js file                     
                outDir: 'test/outputdirectory',    // If specified, the generate javascript files are placed here. Only works if out is not specified
                watch: 'test',                     // If specified, watches this directory for changes, and re-runs the current target  
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
    
You can see/grab a sample grunt file here : https://github.com/basarat/grunt-ts/blob/master/sample/Gruntfile.js
   
### Different configurations per target   
Configuration options are per target. You can see how you can have one set of default options and then override
these selectively for a target (e.g `build` , `dev`, `staging` etc).
This is provided by grunt : http://gruntjs.com/configuring-tasks#options

### Awesome file globs
You can do pretty fancy stuff with your src file selection. 
Again provided by grunt : http://gruntjs.com/configuring-tasks#files

# Contributing

How to build the project:

    tsc "./tasks/ts.ts" --sourcemap --module commonjs
    
