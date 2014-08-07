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

If you don't know what is meant by *external modules* please see [this short video](https://www.youtube.com/watch?v=KDrWLMUY0R0&hd=1). We highly recommend you use *external modules* only in all your projects.

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

### Transforms
Objective : To allow easier code refactoring (by taking the relative path maintainance burden off the developer).
If the paths to the files changes `grunt-ts` will pick it up and regenerate the generated sections.

#### Files
User types in
```typescript
///ts:import=filename
```
grunt-ts comes along, notices this and replaces it with:
```typescript
///ts:import=filename
import filename = require('../path/to/filename'); ///ts:import:generated
```
User types in
```typescript
///ts:ref=filename
```
grunt-ts comes along, notices this and replaces it with:
```typescript
///ts:ref=filename
/// <reference path='../path/to/filename'/> ///ts:ref:generated
```
#### Folders
User types in
```typescript
///ts:import=foldername
```
grunt-ts comes along, notices this and replaces it with
```typescript
///ts:import=foldername
import filename = require('../path/to/foldername/filename'); ///ts:import:generated
import anotherfile = require('../path/to/foldername/deeper/anotherfile'); ///ts:import:generated
...
```
If a folder has an `index.ts` inside of it then we do not import the entire folder and only import `index.ts`. i.e :
```typescript
///ts:import=foldername
import foldername = require('../path/to/foldername/index'); ///ts:import:generated
```
You can also use grunt-ts to create an `index.ts` file for you.
```typescript
///ts:export=foldername
export import filea= require('../path/to/foldername/filea'); ///ts:export:generated
// so on ...
```

### Reference file generation

Grunt-ts can generate a `reference.ts` file which contains a reference to all ts files.

This means there will never be a need to cross reference files manually, instead just reference `reference.ts` :)

*Warning:* Using the compiler with `--out` / `reference.ts` will slow down a fast compile pipeline. Use *external modules* with transforms instead.

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
(Deprecated) Please use [Transforms](https://github.com/grunt-ts/grunt-ts#transforms) + *external modules* all things in new projects.
[Documentation if you need it](https://github.com/grunt-ts/grunt-ts/blob/master/docs/amdLoader.md)

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

You can also [customize this variable](https://github.com/grunt-ts/grunt-ts/blob/master/docs/html2ts.md).

#### Html 2 TypeScript usage in AngularJS

This is great for putting variables in templateCache: http://docs.angularjs.org/api/ng.$templateCache or even using the html string directly by setting it to the `template` properties (directives/views) instead of `templateUrl`

#### Html 2 TypeScript usage in EmberJS

It is possible to specify this string to the template on a view: http://emberjs.com/api/classes/Ember.View.html

Specifically: http://stackoverflow.com/a/9867375/390330

### Live file watching and building

Grunt-ts can watch a directory and recompile TypeScript files when any TypeScript file changes, gets added, gets removed. Use the `watch` *target* option specifying a target directory that will be watched.

### Fast compile
If you are using *external modules* `grunt-ts` will try to do a `fast` compile **by default**, basically only compiling what's changed. It will **just work** with the built-in file watching as well as with external tools like `grunt-contrib-watch` (make sure `spawn` is false. [More](https://github.com/grunt-ts/grunt-ts/blob/master/docs/fast.md)).

It maintains a cache of hashes for typescript files in the `.tscache` folder to detect changes (needed for external watch tool support). Also it creates a `.baseDir.ts` file at the root, passing it compiler to make sure that `--outDir` is always respected in the generated JavaScript.

It should **just work** out of the box. You can however [customize its behaviour](https://github.com/grunt-ts/grunt-ts/blob/master/docs/fast.md).

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

`grunt-ts` always ships (bundled) with the *latest* compiler. Support for legacy  projects can be enabled using the compiler override:

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

### Custom compiler
Alternatively, you can also explicitly use a custom compiler build that is not on NPM (e.g. [current LKG](https://github.com/Microsoft/TypeScript/tree/master/bin)) by specifying the `compiler` *task* option pointing to the path of the node-executable compiler js file (i.e. raw `tsc` or `tsc.js`)
```javascript
ts: {
  options: {
    compiler: './customcompiler/tsc',
  },
}
```

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

### Additional commands
Update the current `grunt-ts` to be the last known good version (dogfood). Commit message should be `Update LKG`.

```bash
$ grunt upgrade
```

## License

Licensed under the MIT License.
