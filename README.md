# grunt-ts

[![Build Status](https://secure.travis-ci.org/grunt-ts/grunt-ts.png?branch=master)](http://travis-ci.org/grunt-ts/grunt-ts) [![NPM version](https://badge.fury.io/js/grunt-ts.png)](http://badge.fury.io/js/grunt-ts)

Written from scratch TypeScript compiler task for GruntJS. 

Following are the reasons why grunt-ts was created:

- Written in [TypeScript](https://github.com/grunt-ts/grunt-ts/blob/master/tasks/ts.ts)
- Enables a TypeScript development workflow in addition to simple file compilation. 
- Supports overriding the bundled compiler with an alternate version.

Check how grunt-ts can help streamline front end development: [Sample usage with AngularJS](http://www.youtube.com/watch?v=0-6vT7xgE4Y&hd=1)

Additional / longer / more basic video tutorial: http://youtu.be/Km0DpfX5ZxM

For a quickstart see the full featured [Gruntfile](https://github.com/grunt-ts/grunt-ts/blob/master/sample/Gruntfile.js).

## Key features

### Compiler support 

Supports the following compiler flags in both original format and camelCase (preferred):

    --allowBool                   Allow 'bool' as a synonym for 'boolean'.
    --allowImportModule           Allow 'module(...)' as a synonym for 'require(...)'.
    --declaration                 Generates corresponding .d.ts file
    --mapRoot LOCATION            Specifies the location where debugger should locate map files instead of generated locations.
    --module KIND                 Specify module code generation: "commonjs" or "amd" (grunt-ts default)
    --noImplicitAny               Warn on expressions and declarations with an implied 'any' type.
    --noResolve                   Skip resolution and preprocessing
    --removeComments              Do not emit comments to output (grunt-ts default)
    --sourceMap                   Generates corresponding .map file (grunt-ts default)
    --sourceRoot LOCATION         Specifies the location where debugger should locate TypeScript files instead of source locations.
    --target VERSION              Specify ECMAScript target version: "ES3" (tsc default), or "ES5" (grunt-ts default)

There is also support for js *file concatenation* using `--out`. Additionally supported is an output directory for the generated JavaScript using `--outDir` flag. For file ordering look at JavaScript Generation below. 


### Reference file generation 

Grunt-ts can generate a reference.ts file which contains a reference to all ts files.

This means there will never be a need to cross reference files manually, instead just reference `reference.ts` :) 

#### JavaScript generation and ordering

When a output file is specified via `out` in combination with a reference file via `reference` then grunt-ts uses the generated reference file to *order the code in the generated JavaScript*. 

Use `reference.ts` to specify the order for the few files the build really cares about and leave the rest to be maintained by grunt-ts. 

E.g. in the following case the generated JavaScript for `someBaseClass.ts` is guaranteed to be at the top, and the generated JavaScript for `main.ts` is guaranteed to be at the bottom of the single merged js file. 

Everything between `grunt-start` and `grunt-end` is generated and maintained by grunt-ts. If there is no `grunt-start` section found, it is created. If `reference.ts` does not exist originally, it is also created. 

```typescript

/// <reference path="someBaseClass.ts" />

// Put comments here and they are preserved

//grunt-start
/// <reference path="autoreference.ts" />
/// <reference path="someOtherFile.ts" />
//grunt-end


/// <reference path="main.ts" />
```

#### JavaScript generation redirect

If an `outDir` is specified all output JavaScript is redirected to this folder to keep the source folder clean.

#### AMD / RequireJS support 

When both `outDir` and `amdloader` options are specified a JavaScript requireJS loader file is created using the information available from `reference.ts`. 

The file consists of three sections.:

* The initial ordered section. 
* A middle order independent section loaded asynchronously. 
* And a final ordered section.

E.g the following `reference` file:

```typescript
/// <reference path="classa.ts" />

//grunt-start
/// <reference path="deep/classb.ts" />
/// <reference path="deep/classc.ts" />
//grunt-end

/// <reference path="deep/deeper/classd.ts" />
/// <reference path="app.ts" />
```

This corresponds to an `amdloader` (edited for readability): 

```typescript
// initial ordered files
define(function (require) {
  require(["./classa"],function () {
    // grunt-ts start
    require(["./deep/classb",                       
             "./deep/classc"],function () {
      // grunt-ts end
      // final ordered files
      require(["./deep/deeper/classd"],function () {  
        require(["./app"],function () {
          // final ordered file loaded
        });
      });
    });
  });
});
```

##### Advantage of using amdloader option

The following combination of circumstances are the main use-case for amdloader compared to the original Compiler supported AMD: 

* Use RequireJS since allows to debug "js" files instead of "ts" files. This is useful in some cases, the most common way is using AMD.
* Keep the ability to individually compile only changed files (for a faster dev-compile-run cycle)
* However, File order doesn't matter, even when there is a inter file depenendency (e.g. AngularJS runtime Dependency injection)

In such a case it is possible to either create a `loader.js` manually or have grunt create one. 

**Further Explanation** When using `export class Foo{}` at the root level of the file the only way to use the type information of Foo in another file is via an import statement: `import foo = require('./potentially/long/path/to/Foo');`.

The ordering implied by this isn't necessary when using a runtime Dependency Injection framework like AngularJS.

Having a loader gives the js debugging (+ async) advantages of RequireJS without the overhead of constantly requesting via `import` to get the TypeScript type inference and worrying about file paths when they are not relevant. 

Note: the individual file source-map will continue to work so it is possible to debug individual "JS" or "TS" files :)

### Html 2 TypeScript support 

Grunt-ts can re-encode html files into TypeScript and make them available as a variable. 

For example a file called `test.html`:
```html
<div> Some Content </div>
```

Will be compiled to a TypeScript file `test.html.ts` containing: 
```typescript
module test { export var html =  '<div> Some content </div>' } 
``` 

This will export the variable `test.html` within the TypeScript scope to get the content of test.html as a string, with the main benefit of limiting the http-requests needed to load templates in various front-end frameworks.

#### Html 2 TypeScript usage in AngularJS 

This is great for putting variables in templateCache: http://docs.angularjs.org/api/ng.$templateCache or even using the html string directly by setting it to the `template` properties (directives/views) instead of `templateUrl`

#### Html 2 TypeScript usage in EmberJS

It is possible to specify this string to the template on a view: http://emberjs.com/api/classes/Ember.View.html 

Specifically: http://stackoverflow.com/a/9867375/390330

#### Control generated TypeScript 

##### module and variable names templates

In the task options htmlModuleTemplate and htmlVarTemplate can specify an Underscore templates to be used in order to generate the module and variable names for the generated TypeScript.

Those Underscore template recieve the following parameters:

 * filename - The html file name without the extension ("test" if the file was named test.html)
 * ext - The html extension without the dot ("html" if the file was named test.html)

The default templates are:

 * "<%= filename %>" - for the module name. (This maintain existing behavior of older versions, and allow controlling the module name by simply renaming the file.)
 * "<%= ext %>" - for the variable name. (This maintain existing behavior of older versions, again allowing to control variable name by renaming the file.)

Usage example is setting the module template to "MyModule.Templates" and the variable template to "<%= filename %>" this will result for the test.html file above with the generated TypeScript
```typescript
module MyModule.Templates { export var test = '<div Some content </div>' }
```

##### content template and template options

In the task options the htmlContentTemplate can be used to specify an Underscore template to be used to generate the actual content of the generated TypeScript file.

And the htmlTemplateOptions can be used to provide configuration to the underscore template function.

Together those options provide access to the full power of the  template engine inside the generate TypeScript file. Without using the options the templates must use very simple expressions:
```html
<%= filename %>
```
while more complex templates will fail the task
```html
<%= filename.toUpperCase() %>
```
due to grunt attempting to parse the template as part of the config loading.

Using the htmlTemplateOptions you can provide a regex that will define other delimiters for your templates. 

*NOTE:* Overriding the delimiters force you to provide all 3 templates, even if the default template provide what you need since the templates will be parsed using the given options.

For example a file called `myModule.part.tmpl.html`:
```html
<div>My part HTML</div>
```

with options:
```json
ts: {
	options: {
		htmlModuleTemplate: "${ filename.split('.')[0] }",
		htmlVarTemplate: "${ filename.split('.')[1] }",
		htmlContentTemplate: "module ${ modulename } { export var ${ varname } = '${ content }' }",
		htmlTemplateOptions: { interpolate: /\$\{(.+?)\}/g }
	}
}
```

will result in the generated TypeScript file
```typescript
module myModule { export var part = '<div>My part HTML</div>' }
```

### Live file watching and building

Grunt-ts can watch a directory and recompile TypeScript files when any TypeScript file changes, gets added, gets removed. Internallythe `chokidar` module is used to makes sure the project is always build ready :) 

## Installation

Grunt-ts is published as [npm package](https://npmjs.org/package/grunt-ts):

For new projects make sure to have installed nodejs, then install grunt-cli:

````bash
$ npm install -g grunt-cli
````

Install the and save to `package.json` devDependencies:

````bash
$ npm install grunt-ts --save-dev
````

### Alternate compiler version

Support for both legacy or cutting-edge projects can be enabled using the compiler override:

At runtime the plugin will look for an alternate compiler in the same `node_modules` folder. To use a different version of the TypeScript compiler install the required `typescript` version as a *peer* of `grunt-ts`. If no override was found the bundled compiler is used.  

The `package.json` would look something like this for a legacy project:

```javascript
{
  "devDependencies": {
    "grunt" : "~0.4.1",
    "grunt-ts" : "~1.9.2",
    "typescript" : "0.9.7"
  }
}
```
Note: make sure to pin the exact TypeScript version (do not use `~` or `>`).

## Configuration

Create a `Gruntfile.js`. Modify it to load grunt-ts by adding the following lines:

```javascript
module.exports = function (grunt) {

    // load the task 
    grunt.loadNpmTasks("grunt-ts");
    
    // Configure grunt here
}
```

Add some configuration for the plugin:

```javascript
grunt.initConfig({
    ...
    ts: {
		// A specific target
        build: {
			// The source TypeScript files, http://gruntjs.com/configuring-tasks#files
			src: ["test/work/**/*.ts"],
			// The source html files, https://github.com/grunt-ts/grunt-ts#html-2-typescript-support   
            html: ["test/work/**/*.tpl.html"], 
			// If specified, generate this file that to can use for reference management
			reference: "./test/reference.ts",  
			// If specified, generate an out.js file which is the merged js file
            out: 'test/out.js',
			// If specified, the generate JavaScript files are placed here. Only works if out is not specified
            outDir: 'test/outputdirectory',
			// If specified, watches this directory for changes, and re-runs the current target
            watch: 'test',                     
			// Use to override the default options, http://gruntjs.com/configuring-tasks#options
            options: {     
				// 'es3' (default) | 'es5'
                target: 'es3',
				// 'amd' (default) | 'commonjs'    
                module: 'commonjs',
				// true (default) | false
                sourceMap: true,
				// true | false (default)
                declaration: false,
				// true (default) | false
                removeComments: true
            },
        },
		// Another target
        dist: {                               
            src: ["test/work/**/*.ts"],
			// Override the main options for this target
            options: {
                sourceMap: false,
            }
        },
    },
    ...
});
```

It is recommended to add a default target to run in case no arguments to grunt are specified: 

```js
grunt.registerTask("default", ["ts:build"]);
```

For an example of an up-to-date configuration look at the [sample gruntfile](https://github.com/grunt-ts/grunt-ts/blob/master/sample/Gruntfile.js) 
   
### Different configurations per target  
 
Grunt-ts supports the Grunt convention of having [multiple configuration targets](http://gruntjs.com/configuring-tasks#options) per task. It is convenient to have one set of default options and then override these selectively for a target (e.g `build` , `dev`, `staging` etc).

### Awesome file globs

For advanced use-cases there is support for [Grunt's selection options](http://gruntjs.com/configuring-tasks#files), such as using globbing or using a callback to filter paths.

## Contributing

With npm and grunt-cli installed, run the following from the root of the repository:

```bash
$ npm install
```
### Building the project:

To build all 

```bash
$ grunt build
```
### Running the tests:

To test all

```bash
$ grunt test
```

### Before PR

```bash
$ grunt release
```

It runs `build` followed by `test`. This is also the default task. You should run this before sending a PR.

### Development 

You will probably be working and testing a particular feature. Modify `tasksToTest` in our `Gruntfile.js` and run:  

```bash
$ grunt dev 
```

It will watch your changes (to `grunt-ts` task as well as examples) and run your tasksToTest after updating the task (if any changes detected). 

## License

Licensed under the MIT License. 
