# grunt-ts

[![Build Status](https://secure.travis-ci.org/TypeStrong/grunt-ts.svg?branch=master)](http://travis-ci.org/TypeStrong/grunt-ts) [![NPM version](https://badge.fury.io/js/grunt-ts.svg)](http://badge.fury.io/js/grunt-ts)

## TypeScript Compilation Task for GruntJS

Grunt-ts is an npm package that handles TypeScript compilation work in GruntJS build scripts.  It provides a [Grunt-compatible wrapper](#support-for-tsc-switches) for the `tsc` command-line compiler, and provides some [additional functionality](#grunt-ts-gruntfilejs-options) that improves the TypeScript development workflow. Grunt-ts supports compiling against [tsconfig.json](#tsconfig) or even a [Visual Studio project](#vs) directly.  Grunt-ts is itself written in [TypeScript](./tasks/ts.ts).

### Latest Changes
Latest beta release is `6.0.0-beta.17` which is compatible with TypeScript 2.5, and any future version of TypeScript by using the [tsconfig.json passthrough](#passthrough) feature, or the [additionalFlags](#additionalflags) option.
Latest stable release is `5.5.1` with built-in support for features added in TypeScript 1.8.  [Full changelog is here](CHANGELOG.md).

### How To Contribute
Thank you for your interest in contributing!  Please see the [contributing](CONTRIBUTING.md) guide for details.

## Quickstart

To install grunt-ts, you must first install TypeScript and GruntJS.
 * If you don't have TypeScript installed in your project, run `npm install typescript --save-dev`.
 * If you don't have GruntJS installed in your project, run `npm install grunt --save-dev`.
 * If you have never used Grunt on your system, install the grunt-cli globally: `npm install grunt-cli -g`.

## Breaking Changes with Grunt-ts 6
 * The npm tool has effectively deprecated peer dependencies, so Grunt and TypeScript will no longer automatically be installed when installing grunt-ts.  This means you'll just have to install them manually and add them as `devDependencies` in your `package.json`.
 * Grunt 1.0 is more strict with templates so it is not possible to use `<%` and `%>` as tokens for html replacements with grunt-ts anymore.  In grunt-ts 6.0 and higher, you must use `{%` and `%}` for HTML replacement tokens.
 * The blue text with each file name will no longer be displayed in `fast` mode unless `verbose: true` is specified in the task or target `options` (See [#389](https://github.com/TypeStrong/grunt-ts/issues/389)).

## Getting Started

If you've never used GruntJS on your computer, you should [follow the detailed instructions here](/docs/DetailedGettingStartedInstructions.md) to get Node.js and the grunt-cli working.  If you're a Grunt expert, follow these steps:

 * Run `npm install grunt-ts` in your project directory; this will install `grunt-ts`, TypeScript, and GruntJS.
 * Add the `ts` task in your `Gruntfile.js` (see below for a minimalist one).
 * Run `grunt` at the command line in your project folder to compile your TypeScript code.

This minimalist `Gruntfile.js` will compile `*.ts` files in all subdirectories of the project folder, excluding anything under `node_modules`:

````javascript
module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default : {
        src: ["**/*.ts", "!node_modules/**"]
      }
    }
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.registerTask("default", ["ts"]);
};
````

A more extensive sample `Gruntfile.js` is available [here](https://github.com/TypeStrong/grunt-ts/blob/master/sample/Gruntfile.js).

## Grunt-ts Features

 * Allows use of all standard GruntJS functionality such as use of customizable task targets, globbing, use of the `files` object (for instantiating multiple independent `tsc` runs in a single target), etc.
 * Allows the developer to [select a custom TypeScript compiler version](#compiler) for their project, or even use a custom (in-house) version.
 * Supports [most switches](#support-for-tsc-switches) of the `tsc` TypeScript Compiler via options in the gruntfile `ts` task, and also supports switch overrides per-target.
 * Supports [Visual Studio Projects](#vs) as a compile target for identifying TypeScript files, setting up compile configuration, or both.
 * Supports TypeScript Projects via [tsconfig.json](#tsconfig) when used with TypeScript 1.5 or higher.
 * Provides a [transforms](#transforms) feature that eases code refactoring by taking the burden of relative path maintenance off the developer. If the paths to a set of files changes, grunt-ts will regenerate the relevant sections.  This feature supports:
   * External module [import transforms](#import-transform) by file name, aliasing, directories, indexed directories, and re-exported imports.
   * Internal module [reference maintenance](#references)
   * Common [reference file](#reference) management
 * Allows [concatenation](#out) where supported by the TypeScript compiler's `--out` switch
 * [Encodes HTML](#html) files as TypeScript variables (for HTML templating engines)
 * Performs live file [watching](#watch) (compile on save)
 * Enables ["Fast" compile](#fast) when using external modules

## Support for tsc Switches

Grunt-ts provides explicit support for most `tsc` switches.  Any arbitrary switches can be passed to `tsc` via the [additionalFlags](#additionalflags) feature.

|`tsc` switch|name in grunt-ts|description|
|:----:|:----:|:-----|
|--allowJs|[allowJs](#allowjs)|Allow JavaScript files (*.js) to be compiled.|
|--allowSyntheticDefaultImports|[allowSyntheticDefaultImports](#allowsyntheticdefaultimports)|Allows use "default" ES6 module import syntax with pre-ES6 libraries that don't have a default (on by default with SystemJS)|
|--allowUnreachableCode|[allowUnreachableCode](#allowunreachablecode)|Do not report errors on unreachable code.|
|--allowUnusedLabels|[allowUnusedLabels](#allowunusedlabels)|Do not report errors on unused labels.|
|--declaration|[declaration](#declaration)|Generates a `.d.ts` definitions file for compiled TypeScript files|
|--emitDecoratorMetadata|[emitDecoratorMetadata](#emitdecoratormetadata)|Emit metadata for type/parameter decorators.|
|--experimentalAsyncFunctions|[experimentalAsyncFunctions](#experimentalasyncfunctions)|Enables experimental support for proposed ECMAScript async functions|
|--experimentalDecorators|[experimentalDecorators](#experimentaldecorators)|Enables experimental support for proposed ECMAScript decorators|
|--forceConsistentCasingInFileNames|[forceConsistentCasingInFileNames](#forceConsistentCasingInFileNames)|Disallow inconsistently-cased references to the same file.|
|--inlineSourceMap|[inlineSourceMap](#inlinesourcemap)|Emit a single file that includes source maps instead of emitting a separate `.js.map` file.|
|--inlineSources|[inlineSources](#inlinesources)|Emit the TypeScript source alongside the sourcemaps within a single file; requires `--inlineSourceMap` to be set.|
|--isolatedModules|[isolatedModules](#isolatedmodules)|Ensures that the output is safe to only emit single files by making cases that break single-file transpilation an error|
|--jsx|[jsx](#jsx)|Specifies the JSX code generation style: 'preserve' or 'react'|
|--lib|[lib](#lib)|List of library files to be included in the compilation.|
|--locale|[locale](#locale)|Specify locale for error messages.|
|--mapRoot LOCATION|[mapRoot](#maproot)|Specifies the location where debugger should locate map files instead of generated locations.|
|--module KIND|[module](#module)|Specify module style for code generation|
|--moduleResolution KIND|[moduleResolution](#moduleresolution)|Specifies module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6).|
|--newLine|[newLine](#newline)|Explicitly specify newline character (`CRLF` or `LF`); if omitted, uses OS default.|
|--noEmit|[noEmit](#noemit)|Check, but do not emit JS, even in the absence of errors.|
|--noEmitHelpers|[noEmitHelpers](#noemithelpers)|Do not generate custom helper functions like `__extends` in compiled output.|
|--noEmitOnError|[noEmitOnError](#noemitonerror)|Do not emit JavaScript if there is a compilation error|
|--noFallthroughCasesInSwitch|[noFallthroughCasesInSwitch](#nofallthroughcasesinswitch)|Report errors for fallthrough cases in switch statement.|
|--noImplicitAny|[noImplicitAny](#noimplicitany)|Warn on expressions and declarations with an implied `any` type.|
|--noImplicitUseStrict|[noImplicitUseStrict](#noimplicitusestrict)|Warn on expressions and declarations with an implied `any` type.|
|--noImplicitReturns|[noImplicitReturns](#noimplicitreturns)|Report error when not all code paths in function return a value.|
|--noImplicitThis|[noImplicitThis](#noimplicitthis)|Raise error on `this` expressions with an implied `any` type.|
|--noStrictGenericChecks|[noStrictGenericChecks](#nostrictgenericchecks)|Disable strict checking of generic signatures in function types.|
|--noLib|[noLib](#nolib)|Do not automatically include lib.d.ts is compilation context.|
|--noResolve|[noResolve](#noresolve)|Do not add triple-slash references or module import targets to the compilation context.|
|--out FILE|[out](#out)|Concatenate and emit output to a single file.|
|--outDir DIRECTORY|[outDir](#outdir)|Redirect output structure to the directory.|
|--preserveConstEnums|[preserveConstEnums](#preserveconstenums)|Const enums will be kept as enums in the emitted JS.|
|--preserveSymlinks|[preserveSymlinks](#preservesymlinks)|Do not resolve symlinks to their real path; treat a symlinked file like a real one.|
|--pretty|[pretty](#pretty)|Stylize errors and messages using color and context.|
|--reactNamespace|[reactNamespace](#reactnamespace)|Specifies the object invoked for  createElement  and  __spread  when targeting 'react' JSX emit.|
|--removeComments|[removeComments](#removecomments)|Configures if comments should be included in the output|
|--rootDir|[rootDir](#rootdir)|Allows override of common root folder calculated by `--outDir`.|
|--skipDefaultLibCheck|[skipDefaultLibCheck](#skipdefaultlibcheck)|Don't check a user-defined default lib file's validity.|
|--skipLibCheck|[skipLibCheck](#skiplibcheck)|Skip type checking of all declaration files (*.d.ts).|
|--strictNullChecks|[strictNullChecks](#strictNullChecks)|Enables strict null checking mode.|
|--sourceMap|[sourceMap](#sourcemap)|Generates corresponding `.map` file|
|--sourceRoot LOCATION|[sourceRoot](#sourceroot)|Specifies the location where debugger should locate TypeScript files instead of source locations.|
|--strictFunctionTypes|[strictFunctionTypes](#strictfunctiontypes)|Enforce contravariant function parameter comparison|
|--stripInternal|[stripInternal](#stripinternal)|does not emit members marked as @internal.|
|--suppressExcessPropertyErrors|[suppressExcessPropertyErrors](#suppressexcesspropertyerrors)|Disables strict object literal assignment checking (experimental).|
|--suppressImplicitAnyIndexErrors|[suppressImplicitAnyIndexErrors](#suppressimplicitanyindexerrors)|Specifies the location where debugger should locate TypeScript files instead of source locations.|
|--target VERSION|[target](#target)|Specify ECMAScript target version: `'es3'`, `'es5'`, or `'es6'`|


For file ordering, look at [JavaScript Generation](#javascript-generation).

## grunt-ts gruntfile.js options

|grunt-ts property|where to define|description|
|:----|:----|:-----|
|[additionalFlags](#additionalflags)|option|`string` - allows passing arbitrary strings to the compiler.  This is intended to enable compatibility with features not supported directly by grunt-ts.|
|[allowJs](#allowjs)|option|`true`, `false` (default) - Allow JavaScript files (*.js) to be compiled.|
|[allowUnreachableCode](#allowunreachablecode)|option|`true`, `false` (default) - Do not report errors on unreachable code.|
|[allowUnusedLabels](#allowunusedlabels)|option|`true`, `false` (default) - Do not report errors on unused labels.|
|[allowSyntheticDefaultImports](#allowsyntheticdefaultimports)|option|`true`, `false` (default) - Allows use "default" ES6 module import syntax with pre-ES6 libraries that don't have a default (on by default with SystemJS and not required to specify).|
|[baseDir](#basedir)|option|`string` - Deprecated - use [rootDir](#rootdir) with TypeScript 1.5 or newer.  Sets root directory for maintaining source structure when using outDir and fast together.|
|[comments](#comments)|option|`true`, `false` (default) - include comments in emitted JS.|
|[compile](#compile)|option|`true` (default), `false` - compile TypeScript code.|
|[compiler](#compiler)|option|`string` - path to custom compiler|
|[declaration](#declaration)|option|`true`, `false` (default) - indicates that definition files should be emitted.|
|[emitDecoratorMetadata](#emitdecoratormetadata)|option|`true`, `false` (default) - set to true to emit metadata for proposed ECMAScript decorators (will enable experimentalDecorators)|
|[emitGruntEvents](#emitgruntevents)|option|`true`, `false` (default) - set to true to raise an event in Grunt upon failed builds.|
|[experimentalAsyncFunctions](#experimentalasyncfunctions)|option|`true`, `false` (default) - set to true to enable support for proposed ECMAScript async functions (in ES6 mode only)|
|[experimentalDecorators](#experimentaldecorators)|option|`true`, `false` (default) - set to true to enable support for proposed ECMAScript decorators|
|[failOnTypeErrors](#failontypeerrors)|option|`true` (default), `false` - fail Grunt pipeline if there is a type error.  (See also [noEmitOnError](#noemithelpers))|
|[fast](#fast)|option|`'watch'` (default), `'always'`, `'never'` - how to decide on a "fast" grunt-ts compile.|
|[files](#files)|target|Sets of files to compile and optional output destination|
|[forceConsistentCasingInFileNames](#forceconsistentcasinginfilenames)|option|`true`, `false` (default) - Disallow inconsistently-cased references to the same file.|
|[html](#html)|target|`string` or `string[]` - glob to HTML templates|
|[htmlModuleTemplate](#htmlmoduletemplate)|option|`string` - HTML template namespace|
|[htmlOutDir](#htmloutdir)|option|`string` - Sets a root for output of transformed-to-TypeScript HTML files|
|[htmlOutDirFlatten](#htmloutdirflatten)|option|`true`, `false` (default) - Will flatten the transformed HTML files to a single folder|
|[htmlVarTemplate](#htmlvartemplate)|option|`string` - HTML property name|
|[inlineSourceMap](#inlinesourcemap)|option|`true`, `false` (default) Emit a single file that includes source maps instead of emitting a separate `.js.map` file; If enabled, will automatically enable `sourceMap`.|
|[inlineSources](#inlinesources)|option|`true`, `false` (default) Emit the TypeScript source alongside the sourcemaps within a single file; If enabled, will automatically enable `inlineSourceMap` and `sourceMap`.|
|[isolatedModules](#isolatedmodules)|option|`true`, `false` (default) Ensures that the output is safe to only emit single files by making cases that break single-file transpilation an error.|
|[jsx](#jsx)|option|`'preserve'`, `'react'`, (TypeScript default is `'react'`).  If `'preserve'`, TypeScript will emit `.jsx`; if `'react'`, TypeScript will transpile and emit `.js` files.|
|[lib](#lib)|option|`string[]`. List of library files to be included in the compilation. If `--lib` is not specified a default library is injected.|
|[locale](#locale)|option|`string` - specify locale for error messages|
|[mapRoot](#maproot)|option|`string` - root for referencing `.js.map` files in JS|
|[module](#module)|option|default is none (`''`), but can be set to `'amd'`, `'commonjs'`, `'system'`, or other values.|
|[moduleResolution](#moduleresolution)|option|`'classic'` or `'node'`.  This was introduced in TypeScript 1.6.  The default is `'node'` if not passed.  [More details here](https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript#adjustments-in-module-resolution-logic).|
|[newLine](#newline)|option|`CRLF`, `LF`, `` (default) - If passed with a value, TypeScript will use the specified line endings.  Also affects grunt-ts transforms.|
|[noEmit](#noemit)|option|`true`, `false` (default) - If passed as `true`, TypeScript will not emit even if it compiles cleanly|
|[noEmitHelpers](#noemithelpers)|option|`true`, `false` (default) - If passed as `true`, TypeScript will not generate custom helper functions like `__extends` in compiled output|
|[noEmitOnError](#noemithelpers)|option|`true`, `false` (default) - If passed as `true`, TypeScript will not emit JS if there is an error (see also [failOnTypeErrors](#failontypeerrors))|
|[noFallthroughCasesInSwitch](#nofallthroughcasesinswitch)|option|`true`, `false` (default) - Report errors for fallthrough cases in switch statement.|
|[noImplicitAny](#noimplicitany)|option|`true`, `false` (default) - enable for stricter type checking|
|[noImplicitReturns](#noimplicitreturns)|option|`true`, `false` (default) - Report error when not all code paths in function return a value.|
|[noImplicitThis](#noImplicitThis)|option|`true`, `false` (default) - Raise error on this expressions with an implied `any` type.|
|[noLib](#nolib)|option|`true`, `false` (default) - do not automatically include lib.d.ts in compilation context|
|[noResolve](#noresolve)|option|`true`, `false` (default) - for deprecated version of TypeScript|
|[noStrictGenericChecks](#nostrictgenericchecks)|option|`true`, `false` (default) - Disable strict checking of generic signatures in function types.|
|[options](#grunt-ts-target-options)|target||
|[out](#out)|target|`string` - instruct `tsc` to concatenate output to this file.|
|[outDir](#outdir)|target|`string` - instruct `tsc` to emit JS to this directory.|
|[preserveConstEnums](#preserveconstenums)|option|`true`, `false` (default) - If true, const enums will be kept as enums in the emitted JS.|
|[preserveSymlinks](#preservesymlinks)|option|`true`, `false` (default) - If true, do not resolve symlinks to their real path; treat a symlinked file like a real one.|
|[pretty](#pretty)|option|`true`, `false` (default) - Stylize errors and messages using color and context.|
|[reactNamespace](#reactnamespace)|option|`string` - Specifies the object invoked for `createElement` and `__spread` when targeting 'react' JSX emit.|
|[reference](#reference)|target|`string` - tells grunt-ts which file to use for maintaining references|
|[removeComments](#removecomments)|option|`true` (default), `false` - removes comments in emitted JS|
|[rootDir](#rootdir)|option|`string` - Allows override of common root folder calculated by `--outDir`.|
|[skipDefaultLibCheck](#skipdefaultlibcheck)|option|`true`, `false` (default) - Don't check a user-defined default lib file's validity.|
|[skipLibCheck](#skiplibcheck)|option|`true`, `false` (default) - Skip type checking of all declaration files (*.d.ts).|
|[sourceRoot](#sourceroot)|option|`string` - root for referencing TS files in `.js.map`|
|[sourceMap](#sourcemap)|option|`true` (default), `false` - indicates if source maps should be generated (`.js.map`)|
|[strictFunctionTypes](#strictNullChecks)|option|`true`, `false` (default) - Enforce contravariant function parameter comparison.|
|[strictNullChecks](#strictNullChecks)|option|`true`, `false` (default) - Enables strict null checking mode.|
|[stripInternal](#stripinternal)|option|`true`, `false` (default) - does not emit members marked as @internal.|
|[suppressExcessPropertyErrors](#suppressexcesspropertyerrors)|option|`false` (default), `true` - indicates if TypeScript should disable strict object literal assignment checking (experimental)|
|[suppressImplicitAnyIndexErrors](#suppressimplicitanyindexerrors)|option|`false` (default), `true` - indicates if TypeScript should allow access to properties of an object by string indexer when `--noImplicitAny` is active, even if TypeScript doesn't know about them.|
|[src](#src)|target|`string` or `string[]` - glob of TypeScript files to compile.|
|[target](#target)|option|`'es5'` (default), `'es3'`, or `'es6'` - targeted ECMAScript version|
|[tsCacheDir](#tscachedir)|target|`./.tscache` (default), a string path where the local TS cache directory will be created when the `'fast'` option is not set to `'never'`.|
|[tsconfig](#tsconfig)|target|true, a string path, or an object.  See [tsconfig](#tsconfig) for details.|
|[verbose](#verbose)|option|`true`, `false` (default) - logs `tsc` command-line options to console|
|[vs](#vs)|target|`string` referencing a `.csproj` or `.vbproj` file or, `{}` (object) (see [Visual Studio Projects](#vs) for details)|
|[watch](#watch)|target|`string` - will watch for changes in the specified directory or below|
|**something else**||Don't see the switch you're looking for?  Check out [additionalFlags](#additionalflags)|

Note: In the above chart, if "where to define" is "target", the property must be defined on a target or on the `ts` object directly.  If "where to define" is "options", then the property must be defined on an `options` object on `ts` or on a target under `ts`.


### grunt-ts target properties

#### dest

Grunt-ts does not support the GruntJS standard `dest` target property.  Instead, you should use [files](#files), [out](#out), or [outDir](#outdir).

#### files
Grunt-ts supports use of the GruntJS-centric `files` property on a target as an alternative to the `tsc`-centric use of `src` and `out`/`outDir`.

Notes:
* The `fast` grunt-ts option is not supported in this configuration. You should specify `fast: 'never'` to avoid warnings when `files` is used.
* It is not supported to specify an array of values for `dest` with grunt-ts.  A warning will be issued to the console.  If a non-empty array is passed, the first element will be used and the rest will be truncated.
* If the `dest` parameter ends with ".js", the value will be passed to the `--out` parameter of the TypeScript compiler.  Otherwise, if there is a non-blank value, it will be passed to the `--outDir` parameter.
* If you intend to pass the specific value "src" to the TypeScript `--outDir` parameter, specify it as "src/" in the dest parameter to avoid grunt-ts warnings.

Here are some examples of using the target `files` property with grunt-ts:

````js
grunt.initConfig({
  ts: {
    compileTwoSetsOfFilesUsingArrayStyle: {
      // This will run tsc twice.  The first time, the result of the 'files1/**/*.ts' glob will be
      // passed to tsc with the --out switch as 'out/ArrayStyle/1.js'.
      // see https://github.com/gruntjs/grunt-docs/blob/master/Configuring-tasks.md#files-array-format
      files: [{ src: ['files1/**/*.ts'], dest: 'out/ArrayStyle/1.js' },
              { src: ['files2/**/*.ts'], dest: 'out/ArrayStyle/2.js' }],
      options: {
        fast: 'never'
      }
    },
    compileTwoSetsOfFilesToDirUsingArrayStyle: {
      // This will run tsc twice.  The first time, the result of the 'files1/**/*.ts' glob will be
      // passed to tsc with the --outDir switch as 'out/ArrayStyle'.
      // see https://github.com/gruntjs/grunt-docs/blob/master/Configuring-tasks.md#files-array-format
      files: [{ src: ['files1/**/*.ts'], dest: 'out/ArrayStyle' },
              { src: ['files2/**/*.ts'], dest: 'out/ArrayStyle' }],
      options: {
        fast: 'never'
      }
    },
    compileTwoSetsOfFilesUsingObjectStyle: {
      // This will run tsc twice.  The first time, the result of the 'files1/**/*.ts' glob will be
      // passed to tsc with the --out switch as 'out/ObjectStyle/1.js'.
      // see https://github.com/gruntjs/grunt-docs/blob/master/Configuring-tasks.md#files-object-format
      files: {
        'out/ObjectStyle/1.js': ['files1/**/*.ts'],
        'out/ObjectStyle/2.js': ['files2/**/*.ts']
      },
      options: {
        fast: 'never'
      }
    },
    compileTwoSetsOfFilesToDirUsingObjectStyle: {
      // This will run tsc once.  The result of the globs will be passed to tsc with the
      // --outDir switch as 'out/ObjectStyle'.
      // see https://github.com/gruntjs/grunt-docs/blob/master/Configuring-tasks.md#files-object-format
      files: {
        'out/ObjectStyle': ['files1/**/*.ts','files2/**/*.ts']
        },
        options: {
          fast: 'never'
        }
      }
    }
});
````

#### html

Grunt-ts supports compilation of `.html` file content to TypeScript variables which is explained in detail [here](/docs/html2ts.md).  The `html` target property acts similarly to `src`, except that it searches for html files to convert to TypeScript variables.  See also [htmlModuleTemplate](#htmlmoduletemplate) and [htmlVarTemplate](#htmlvartemplate).

````javascript
// How to use the html target property (incomplete example)
grunt.initConfig({
  ts: {
    default: {
      html: ["templates/**/*.html"]
    }
  }
});
````

Note: the `html` compilation functionality will not fire if the `src` property is not specified.  If you wish to only have the HTML compile to TypeScript without compiling the resulting `.ts` files to JavaScript, make sure they're excluded from the `src` globs, or else specify an empty `src` array alongside the `html` task property, and set the target `compile` option to `false`:

````javascript
// Example of how to compile html files to TypeScript without compiling the resulting
// .ts files to JavaScript.
grunt.initConfig({
  ts: {
    default: {
      html: ["templates/**/*.html"],
      src: [],
      options: {
        compile: false
      }
    }
  }
});
````


#### options

This section allows global configuration for the grunt-ts task.  All [target-specific options](#grunt-ts-target-options) are supported.  If a target also has options set, the target's options override the global task options.


#### out

Passes the --out switch to `tsc`.  This will cause the emitted JavaScript to be concatenated to a single file if your code allows for that.

Note - the sequence of concatenation when using namespaces (formerly called internal modules) is usually significant.  You can assist TypeScript to order the emitted JavaScript correctly by changing the sequence in which files appear in your glob.  For example, if you have `a.ts`, `b.ts`, and `c.ts` and use the glob `'*.ts`, the default would be for TypeScript to concatenate the files in alphabetical order.  If you needed the content from `b.ts` to appear first, and then the rest in alphabetical order, you could specify the glob like this: `['b.ts','*.ts']`.

Note - the `out` feature should not be used in combination with `module` because the TypeScript compiler does not support concatenation of external modules; consider using a module bundler like WebPack, Browserify, or Require's r.js to concatenate external modules.

````javascript
grunt.initConfig({
  ts: {
    default: {
      out: "dist/myscript.js"
    }
  }
});
````

*Warning:* Using the compiler with `out` and `reference` will prevent  grunt-ts from using its fast compile feature.  Consider using external modules with transforms instead.

#### outDir

Passes the --outDir switch to `tsc`.  This will redirect the emitted JavaScript to the specified directory and subdirectories.

````javascript
grunt.initConfig({
  ts: {
    default: {
      outDir: "dist"
    }
  }
});
````

#### reference

Grunt-ts can automatically generate a TypeScript file containing a reference to all other found `.ts` files.  This means that the developer will not need to cross-reference each of their TypeScript files manually; instead, they can just reference the single `reference` file in each of their code files.

````javascript
grunt.initConfig({
  ts: {
    default: {
      src: ["references.ts","some/other/path/**/*.ts"],
      reference: "references.ts"
    }
  }
});
````
**Note:** the TypeScript file identified in the `reference` property *must* be included in the `src` or `files` property in the Grunt target, or `reference` won't work (either directly or via wildcard/glob).

*Note:* It is not supported to use `reference` with `files`.

*Warning:* Using the compiler with `out` and `reference` will prevent grunt-ts from using its fast compile feature.  Consider using external modules with transforms instead.


#### src

Allows you to specify the TypeScript files that will be passed to the compiler.  Supports standard GruntJS functionality such as globbing.  More info at Configuring GruntJS Tasks](http://gruntjs.com/configuring-tasks#files).

````javascript
grunt.initConfig({
  ts: {
    default: {
      src: ["app/**/*.ts"]
    }
  }
});
````

#### vs

Grunt-ts can use the TypeScript compilation settings from a Visual Studio project file (.csproj or .vbproj).

In the simplest use case, specify a string identifying the Visual Studio project file name in the `vs` target property.  Grunt-ts will extract the TypeScript settings *last saved* into the project file and compile the TypeScript files identified in the project in the manner specified by the Visual Studio project's configuration.

````javascript
grunt.initConfig({
  ts: {
    default: {
      vs: 'test/vsproj/testproject.csproj'
    }
  }
});
````

If more control is desired, you may pass the `vs` target property as an object literal with the following properties:

  * `project`: (`string`, mandatory) the relative path (from the `gruntfile.js`) to the Visual Studio project file.
  * `config`: (`string`, optional, default = '') the Visual Studio project configuration to use (allows choosing a different project configuration than the one currently in-use/saved in Visual Studio).
  * `ignoreFiles`: (`boolean`, optional, default = `false`) Will ignore the files identified in the Visual Studio project.  This is useful if you want to keep your command-line build settings synchronized with the project's TypeScript Build settings, but want to specify a custom set of files to compile in your own `src` glob.  If not specified or set to false, the TypeScript files referenced in the Visual Studio project will be compiled in addition to any files identified in the `src` target property.
  * `ignoreSettings`: (`boolean`, optional, default = `false`) Will ignore the compile settings identified in the Visual Studio project.  If specified, grunt-ts will follow its normal behavior and use any TypeScript build settings specified on the target or its defaults.

All features of grunt-ts other than `files`, are compatible with the `vs` target property.  If you wish to add more files to the compilation than are referenced in the Visual Studio project, the `src` grunt-ts property can be used; any files found in the glob are *added* to the compilation list (grunt-ts will resolve duplicates).  All other target properties and target options specified in the gruntfile.js will **override** the settings in the Visual Studio project file.  For example, if you were referencing a Visual Studio project configuration that had source maps enabled, specifying `sourcemap: false` in the gruntfile.js would keep all other Visual Studio build settings, but disable generation of source maps.

**Note:** Using the `vs` target property with `files` is not supported.

Example: Use all compilation settings specified in the "Release" TypeScript configuration from the project, but compile only the TypeScript files in the `lib` subfolder to a single file in the `built` folder.

````javascript
grunt.initConfig({
  ts: {
    CompileMyLibsOnly: {
      src: 'MyProject/lib/**/*.ts',
      out: 'built/mylibs.js',
      vs: {
        project: 'MyProject/MyProject.csproj',
        ignoreFiles: true,
        config: 'Release'
      }
    }
  }
});
````

If you wish to disable the Visual Studio built-in TypeScript build, but keep the Visual Studio project properties TypeScript Build pane working, follow [these instructions](./docs/DisableVisualStudioBuild.md).


#### watch

Grunt-ts can watch a directory and recompile TypeScript files when any TypeScript or HTML file is changed, added, or removed. Use the `watch` *target* option specifying a target directory that will be watched.  All subdirectories are automatically included.

Note: this feature does not allow for additional tasks to run after the compilation step is done - for that you should use `grunt-contrib-watch`.

````javascript
grunt.initConfig({
  ts: {
    default: {
      watch: "."  //will re-run this task if any .ts or .html file is changed.
    }
  }
});
````

### grunt-ts target options

#### additionalFlags

Allows passing arbitrary strings to the compiler.  This is intended to enable compatibility with features not supported directly by grunt-ts.  The parameters will be passed exactly as-is with a space separating them from the previous switches.  It is possible to pass more than one switch with `additionalFlags` by separating them with spaces.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        additionalFlags: '--autoFixBugs --gruntTs "is awesome!"'
      }
    }
  }
});
````

#### allowJs

Allows JavaScript files to be compiled.  This setting works well with `outDir`.  This feature requires grunt-ts 5.5 or higher and TypeScript 1.8 or higher.

````javascript
grunt.initConfig({
  ts: {
    default: {
      src: ["**/*.ts", "**/*.js", "!emit/**", "!node_modules/**"],
      outDir: 'emit/',
      options: {
        allowJs: true
      }
    }
  }
});
````

#### allowSyntheticDefaultImports

Allows use of ES6 "default" import syntax with pre-ES6 modules when not using SystemJS.  If using module format "amd", "commonjs" or "umd", the following import syntax for jQuery will give the error "Module 'jquery' has no default export" when exporting to "amd", "commonjs", or "umd" format: `import * as $ from 'jquery';`.  In that case, passing allowSyntheticDefaultImports will eliminate this error.  NOTE: This is the default behavior when SystemJS module format is used (`module: "system"`).  This switch (and behavior) requires TypeScript 1.8 or higher.  See [this issue](https://github.com/Microsoft/TypeScript/issues/5285) for more details.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        allowSyntheticDefaultImports: true,
        module: 'umd'
      }
    }
  }
});
````

#### allowUnreachableCode

When set to true, TypeScript will not report errors on unreachable code.  Requires TypeScript 1.8 or higher.

````javascript
grunt.initConfig({
  ts: {
    default: {
      src: ["**/*.ts", "!node_modules/**"],
      options: {
        allowUnreachableCode: true
      }
    }
  }
});
````

#### allowUnusedLabels

When set to true, TypeScript will not report errors when there are unused labels in your code.  Requires TypeScript 1.8 or higher.

````javascript
grunt.initConfig({
  ts: {
    default: {
      src: ["**/*.ts", "!node_modules/**"],
      options: {
        allowUnusedLabels: true
      }
    }
  }
});
````

#### baseDir

Deprecated - when using TypeScript >= 1.5 (most common), use [rootDir](#rootDir) instead.

When using fast compile with outDir, tsc won't guarantee the output directory structure will match the source structure. Setting baseDir helps to ensure the original source structure is mapped to the output directory. This will create a .baseDir.ts file in the baseDir location. A .baseDir.js and .baseDir.js.map will be created in the outDir.

````javascript
grunt.initConfig({
  ts: {
    default: {
      outDir: 'dist',
      options: {
        baseDir: 'src',
        fast: always
      }
    }
  }
});
````

#### compile

````javascript
true (default)| false
````

Indicates if the TypeScript compilation should be attempted.  Turn this off if you wish to just run transforms.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        compile: false
      }
    }
  }
});
````

#### compiler

This target option allows the developer to select an alternate TypeScript compiler.

By default, `grunt-ts` will use the TypeScript compiler that came bundled with it.  Alternate compilers can be used by this target option (for custom compiler builds) or using `package.json` (for npm released version of `typescript`).

To use a custom compiler, update your gruntfile.js file with this code:

````javascript
grunt.initConfig({
  ts: {
    options: {
      compiler: './node_modules/grunt-ts/customcompiler/tsc'
    }
  }
});
````

Download custom compilers from the current [TypeScript repository on GitHub](https://github.com/Microsoft/TypeScript/releases) or the old [TypeScript repository on CodePlex](http://typescript.codeplex.com/releases) and extract it to a folder in your project.  The compiler will be in the `bin` folder.  Copy all of the files to your project folder and then reference `tsc` using the `compiler` task option.  For example, if you extracted everything to a `mycompiler` folder in your project, you'd set the grunt-ts `compiler` property to `'./mycompiler/tsc'`.

In the absence of a compiler argument, `grunt-ts` will look for an alternate compiler in its *peer* `node_modules` folder (where `grunt-ts` and `typescript` are peers).

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
Note: It is safest to pin the exact TypeScript version (do not use `~` or `>`).


#### comments

````javascript
true | false (default)
````

Retains comments in the emitted JavaScript if set to `true`.  Removes comments if set to `false`.  Note that if `comments` and `removeComments` are both used, the value of `removeComments` will win; regardless, please don't do this as it is just confusing to everyone.

````javascript
grunt.initConfig({
  ts: {
    options: {
      comments: true //preserves comments in output.
    }
  }
});
````

#### declaration

````javascript
true | false (default)
````

Generates corresponding .d.ts file(s) for compiled TypeScript files.

````javascript
grunt.initConfig({
  ts: {
    options: {
      declaration: true
    }
  }
});
````

#### emitDecoratorMetadata

````javascript
true | false (default)
````

Set to true to pass `--emitDecoratorMetadata` to the compiler.  If set to true, TypeScript will emit type information about type and parameter decorators, so it's available at runtime.

Used by tools like [Angular](https://angular.io/). You will probably need to import the [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) package in your app when using this feature.

This is only available in TypeScript 1.5 and higher.  If enabled, will automatically enable `experimentalDecorators`

````javascript
grunt.initConfig({
  ts: {
    options: {
      emitDecoratorMetadata: true
    }
  }
});
````

#### emitGruntEvents

````javascript
true | false (default)
````

Set to true to emit events in Grunt upon significant events in grunt-ts.  This is used by the task `validate_failure_count` in the Gruntfile.js of grunt-ts itself.  Currently, the only supported event is `grunt-ts.failure` which will be raised upon a failed build if `emitGruntEvents` is true.  This is only available in grunt-ts 5.2.0 or higher.

```javascript
grunt.initConfig({
  ts: {
    options: {
      emitGruntEvents: true
    }
  }
});
```

Example usage:

```javascript
grunt.event.on('grunt-ts.failure', function() {
    console.log('It failed!!!!!!');
});
```

#### experimentalAsyncFunctions

````javascript
true | false (default)
````

Enable support for experimental proposed ECMAScript async functionality.  This is only available in TypeScript 1.6 and higher in 'es6' mode.

````javascript
grunt.initConfig({
  ts: {
    options: {
      experimentalAsyncFunctions: true,
      target: 'es6'
    }
  }
});
````

#### experimentalDecorators

````javascript
true | false (default)
````

Enable support for experimental proposed ECMAScript decorators.  This is only available in TypeScript 1.5 and higher.

````javascript
grunt.initConfig({
  ts: {
    options: {
      experimentalDecorators: true
    }
  }
});
````

#### failOnTypeErrors

````javascript
true (default) | false
````

TypeScript has two types of errors: emit preventing and non-emit preventing.  Generally, type errors do not prevent the JavaScript emit.  Therefore, it can be useful to allow the Grunt pipeline to continue even if there are type errors because `tsc` will still generate JavaScript.

If `failOnTypeErrors` is set to `false`, grunt-ts will not halt the Grunt pipeline if a TypeScript type error is encountered.  Note that syntax errors or other general `tsc` errors will always halt the pipeline.

````javascript
grunt.initConfig({
  ts: {
    options: {
      failOnTypeErrors: true
    }
  }
});
````

#### fast

````javascript
"watch" (default) | "always" | "never"
````

If you are using *external modules*, grunt-ts will try to do a `fast` compile **by default**, basically only compiling what's changed. It should "just work" with the built-in file watching as well as with external tools like `grunt-contrib-watch`.

To do a fast compile, grunt-ts maintains a cache of hashes for TypeScript files in the `.tscache` folder to detect changes (needed for external watch tool support).  It also creates a `.baseDir.ts` file at the root, passing it to the compiler to make sure that `--outDir` is always respected in the generated JavaScript.

You can [customize the behaviour](https://github.com/grunt-ts/grunt-ts/blob/master/docs/fast.md) of grunt-ts `fast`.

If you are using `files`, grunt-ts can't do a fast compile.  You should set `fast` to 'never'.

````javascript
grunt.initConfig({
  ts: {
    options: {
      // disable the grunt-ts fast feature
      fast: 'never'
    }
  }
});
````

#### forceConsistentCasingInFileNames

When set to true, disallows inconsistently-cased references to the same file.  For example, when using ES6-style imports, importing a file as "./MyLibrary" in one file and "./mylibrary" in another.

````javascript
grunt.initConfig({
  ts: {
    default: {
      src: ["**/*.ts", "!node_modules/**"],
      options: {
        forceConsistentCasingInFileNames: true
      }
    }
  }
});
````

#### htmlModuleTemplate

Grunt-ts supports compilation of `.html` file content to TypeScript variables which is explained in detail [here](/docs/html2ts.md).  The `htmlModuleTemplate` target property allows the developer to define a namespace for the templates.  See also [html](#html) and [htmlVarTemplate](#htmlvartemplate).

````javascript
//Note: incomplete - combine with html and htmlVarTemplate
grunt.initConfig({
  ts: {
    default: {
      options: {
        //MyTemplate.html will be accessible as HtmlTemplates.MyTemplate
        htmlModuleTemplate: 'HtmlTemplates.<%= filename %>'
      }
    }
  }
});
````

#### htmlVarTemplate

Grunt-ts supports compilation of `.html` file content to TypeScript variables which is explained in detail [here](/docs/html2ts.md).  The `htmlVarTemplate` target property allows the developer to define a property name for the template contents.  See also [html](#html) and [htmlModuleTemplate](#htmlmoduletemplate).

````javascript
//Note: incomplete - combine with html and htmlModuleTemplate
grunt.initConfig({
  ts: {
    default: {
      options: {
        //HTML template objects will expose their content via a property called markup.
        htmlVarTemplate: 'markup'
      }
    }
  }
});
````

#### htmlOutDir

Sets a root for output of transformed-to-TypeScript HTML files.  See detailed explanation of [grunt-ts HTML template support](/docs/html2ts.md).

````javascript
//Note: incomplete - combine with html and src/files/etc.
grunt.initConfig({
  ts: {
    default: {
      options: {
        htmlOutDir: 'generatedHtml'
      }
    }
  }
});
````

### htmlOutDirFlatten

Will flatten the transformed HTML files to a single folder.  See detailed explanation of [grunt-ts HTML template support](/docs/html2ts.md).

````javascript
//Note: incomplete - combine with html and src/files/etc.
grunt.initConfig({
  ts: {
    default: {
      options: {
        htmlOutDir: 'generatedHtml',
        htmlOutDirFlatten: true
      }
    }
  }
});
````


#### htmlOutputTemplate

Grunt-ts supports compilation of `.html` file content to TypeScript variables which is explained in detail [here](/docs/html2ts.md).  The `htmlOutputTemplate` target property allows the developer to override the internally defined output template to a custom one, useful if one would like to define the HTML output as an external modules, for example.

Three variables can be used in the template, namely:

* "<%= modulename %>" - This variable will be replaced with the value of the `htmlModuleTemplate` option.
* "<%= varname %>" - This variable will be replaced with the value of the `htmlVarTemplate` option.
* "<%= content %>" - This variable will be replaced with the content of the HTML file.

````javascript
//Note: Outputs an external module
grunt.initConfig({
  ts: {
    default: {
      options: {
        //HTML template objects will expose their content via a property called markup.
        htmlVarTemplate: 'markup',
        htmlModuleTemplate: 'html',
        htmlOutputTemplate: '/* tslint:disable:max-line-length */ \n\
          export module <%= modulename %> {\n\
              export var <%= varname %> = \'<%= content %>\';\n\
          }\n'
      }
    }
  }
});
````

#### inlineSourceMap

````javascript
true | false (default)
````

When true, TypeScript will emit source maps inline at the bottom of each JS file, instead of emitting a separate `.js.map` file.  If this option is used with `sourceMap`, `inlineSourceMap` will win.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        inlineSourceMap: true
      }
    }
  }
});
````

#### inlineSources

````javascript
true | false (default)
````

When true, TypeScript will emit TypeScript sources "inline".  This *must* be used with either `inlineSourceMap` or `sourceMap`.  When used with `inlineSourceMap`, the TypeScript sources and the source map itself are included in a  Base64-encoded string in a comment at the end of the emitted JavaScript file.  When used with `sourceMap`, the escaped TypeScript sources are included in the .js.map file itself under a `sourcesContent` property.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        inlineSources: true,
        inlineSourceMap: true
      }
    }
  }
});
````

#### isolatedModules

````javascript
true | false (default)
````

When true, makes scenarios that break single-file transpilation into an error.  See https://github.com/Microsoft/TypeScript/issues/2499 for more details.  If you are using TypeScript 1.5, and fast compilation, it is ideal to use this to take advantage of future compilation optimizations.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        isolatedModules: true
      }
    }
  }
});
````

#### jsx

````javascript
`'react'` (default) | `'preserve'`
````

Specify the JSX code generation style.  Documentation is here: [TypeScript Wiki - JSX](https://github.com/Microsoft/TypeScript/wiki/JSX).

````javascript
grunt.initConfig({
  ts: {
    options: {
      jsx: 'preserve'
    }
  }
});
````

#### lib

List of library files to be included in the compilation. If `--lib` is not specified a default library is injected.

````javascript
grunt.initConfig({
  ts: {
    options: {
      lib: ['es2015']
    }
  }
});
````

#### locale

Specify culture string for error messages - will pass the `--locale` switch.  Requires appropriate TypeScript error messages file to be present (see TypeScript documentation for more details).

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        locale: "ja-jp"
      }
    }
  }
});
````

#### mapRoot

Specifies the root for where `.js.map` sourcemap files should be referenced.  This is useful if you intend to move your `.js.map` files to a different location.  Leave this blank or omit entirely if the `.js.map` files will be deployed to the same folder as the corresponding `.js` files.  See also [sourceRoot](#sourceroot).

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        //When abc.ts is compiled to abc.js, it will reference /maps/abc.js.map
        mapRoot: "/maps"
      }
    }
  }
});
````

#### module

````javascript
"amd" | "commonjs" | "system" | "umd" | "es6" | "es2015" | "" (default) | "none" (same behavior as "")
````

Specifies if TypeScript should emit AMD, CommonJS, SystemJS, "ES6", or UMD-style external modules.  Has no effect if internal modules are used.  Note - this should not be used in combination with `out` [prior to TypeScript 1.8](https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript#option-to-concatenate-amd-and-system-modules-into-a-single-output-file) because the TypeScript compiler does not support concatenation of external modules; consider using a module bundler like WebPack, Browserify, or Require's r.js to concatenate external modules.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        module: "amd"
      }
    }
  }
});
````

#### moduleResolution

````javascript
"node" | "classic" (default)
````

New in TypeScript 1.6.  TypeScript is gaining support for resolving definition files using rules similar to common JavaScript module loaders.  The first new one is support for CommonJS used by NodeJS, which is why this parameter is called `"node"`  The `"node"` setting performs an extra check to see if a definition file exists in the `node_modules/modulename` folder if a TypeScript definition can't be found for an imported module.  if this is not desired, set this setting to "classic".

On Defaults. When using `--module commonjs` the default `--moduleResolution` will be `node`. For all other `--module` options the default is `--moduleResolution classic`. If specified, the specified value will always be used.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        moduleResolution: "classic"
      }
    }
  }
});
````

#### newLine

````javascript
"CRLF" | "LF" | "" (default)
````

Will force TypeScript to use the specified newline sequence.  Grunt-ts will also use this newline sequence for transforms.  If not specified, TypeScript and grunt-ts use the OS default.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        newLine: "CRLF"
      }
    }
  }
});
````

#### noEmit

````javascript
true | false (default)
````

Set to true to pass `--noEmit` to the compiler.  If set to true, TypeScript will not emit JavaScript regardless of if the compile succeeds or fails.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        noEmit: true
      }
    }
  }
});
````

#### noEmitHelpers

````javascript
true | false (default)
````

Set to true to pass `--noEmitHelpers` to the compiler.  If set to true, TypeScript will not emit JavaScript helper functions such as `__extends`.  This is for very advanced users who wish to provide their own implementation of the TypeScript runtime helper functions.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        noEmitHelpers: true
      }
    }
  }
});
````

#### noEmitOnError

````javascript
true | false (default)
````

Set to true to pass `--noEmitOnError` to the compiler.  If set to true, TypeScript will not emit JavaScript if there is a type error.  This flag does not affect the Grunt pipeline; to force the Grunt pipeline to continue (or halt) in the presence of TypeScript type errors, see [failOnTypeErrors](#failontypeerrors).

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        noEmitOnError: true
      }
    }
  }
});
````

#### noFallthroughCasesInSwitch

````javascript
true | false (default)
````

Report errors for fallthrough cases in switch statement.

````javascript
grunt.initConfig({
  ts: {
    default: {
      src: ["**/*.ts", "!node_modules/**"],
      options: {
        noFallthroughCasesInSwitch: true
      }
    }
  }
});
````


#### noImplicitAny

````javascript
true | false (default)
````

Set to true to pass `--noImplicitAny` to the compiler.  Requires more strict type checking.  If `noImplicitAny` is enabled, TypeScript will raise a type error whenever it is unable to infer the type of a variable.  By default, grunt-ts will halt the Grunt pipeline on type errors.  See [failOnTypeErrors](#failontypeerrors) for more info.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        noImplicitAny: true
      }
    }
  }
});
````

#### noImplicitReturns

````javascript
true | false (default)
````

Report error when not all code paths in function return a value.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        noImplicitReturns: true
      }
    }
  }
});
````

#### noImplicitThis

````javascript
true | false (default)
````

Set to true to pass `--noImplicitThis` to the compiler.  Requires more strict type checking.  Raise error on `this` expressions with an implied `any` type.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        noImplicitThis: true
      }
    }
  }
});
````

#### noImplicitGenericChecks

````javascript
true | false (default)
````

Set to true to pass `--noImplicitGenericChecks` to the compiler.  Disables strict checking of generic signatures in function types.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        noImplicitGenericChecks: true
      }
    }
  }
});
````

#### noLib

````javascript
true | false (default)
````

Specify this option if you do not want the lib.d.ts to be loaded by the TypeScript compiler.  Generally this is used to allow you to manually specify your own lib.d.ts.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        noLib: true
      }
    }
  }
});
````

#### noResolve

````javascript
true | false (default)
````

Do not add triple-slash references or module import targets to the list of compiled files.

````javascript
grunt.initConfig({
  ts: {
    options: {
      noResolve: true
    }
  }
});
````

#### preserveConstEnums

````javascript
true | false (default)
````

Set to true to pass `--preserveConstEnums` to the compiler.  If set to true, TypeScript will emit code that allows other JavaScript code to use the enum.  If false (the default), TypeScript will inline the enum values as magic numbers with a comment in the emitted JS.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        preserveConstEnums: true
      }
    }
  }
});
````

#### preserveSymlinks

````javascript
true | false (default)
````

Set to true to pass `--preserveSymlinks` to the compiler.  If set, TypeScript will not resolve symlinks to their real path; instead it will treat a symlinked file like a real one.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        preserveSymlinks: true
      }
    }
  }
});
````

#### pretty

````javascript
true | false (default)
````

Stylize errors and messages using color and context.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        pretty: true
      }
    }
  }
});
````

#### reactNamespace

````javascript
string
````

Specifies the object invoked for `createElement` and  `__spread`  when targeting 'react' JSX emit.  Requires TypeScript 1.8 or higher and grunt-ts 5.5 or higher.

````javascript
grunt.initConfig({
  ts: {
    options: {
      rootDir: "src/app"
    }
  }
});
````

#### removeComments

````javascript
true (default)| false
````

Removes comments in the emitted JavaScript if set to `true`.  Preserves comments if set to `false`.  Note that if `comments` and `removeComments` are both used, the value of `removeComments` will win; regardless, please don't do this as it is just confusing to everyone.

````javascript
grunt.initConfig({
  ts: {
    options: {
      removeComments: false //preserves comments in output.
    }
  }
});
````

#### rootDir

````javascript
string
````

Affects the creation of folders inside the `outDir` location.  `rootDir` allows manually specifying the desired common root folder when used in combination with `outDir`.  Otherwise, TypeScript attempts to calculate this automatically. Not specifying `rootDir` can result in `outDir` not matching structure of src folder when using `fast` compilation. [baseDir](#baseDir) provides a poor man's version of `rootDir` for those using TypeScript < 1.5.

````javascript
grunt.initConfig({
  ts: {
    options: {
      rootDir: "src/app"
    }
  }
});
````

#### skipDefaultLibCheck

````javascript
true | false (default)
````

Don't check a user-defined default lib file's validity.  This switch is deprecated in TypeScript 2.5+ (use skipLibCheck instead).

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        skipDefaultLibCheck: true
      }
    }
  }
});
````

#### skipLibCheck

````javascript
true | false (default)
````

Skip type checking of all declaration files (*.d.ts).

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        skipLibCheck: true
      }
    }
  }
});
````

#### strictFunctionTypes

````javascript
true | false (default)
````

Enforce contravariant function parameter comparison.  Under `--strictFunctionTypes`, any function type that doesn't originate from a method has its parameters compared [contravariantly](https://en.wikipedia.org/wiki/Covariance_and_contravariance_%28computer_science%29).

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        strictFunctionTypes: true
      }
    }
  }
});
````

#### strictNullChecks

````javascript
true | false (default)
````

In strict null checking mode, the `null` and `undefined` values are not in the domain of every type and are only assignable to themselves and `any` (the one exception being that `undefined` is also assignable to `void`).

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        strictNullChecks: true
      }
    }
  }
});
````

#### sourceMap

````javascript
true (default) | false
````

If true, grunt-ts will instruct `tsc` to emit source maps (`.js.map` files).  If this option is used with `inlineSourceMap`, `inlineSourceMap` will win.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        sourceMap: true
      }
    }
  }
});
````

#### sourceRoot

The sourceRoot to use in the emitted source map files.  Allows mapping moved `.js.map` files back to the original TypeScript files.  See also [mapRoot](#maproot).

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        sourceRoot: "/dev"
      }
    }
  }
});
````

#### stripInternal

Use stripInternal to prevent the emit of members marked as @internal via a comment.  For example:

```typescript
/* @internal */
export class MyClass {
}
```

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        sourceRoot: "/dev"
      }
    }
  }
});
````

#### suppressExcessPropertyErrors

````javascript
true | false (default)
````

Set to true to disable strict object literal assignment checking (experimental).  See https://github.com/Microsoft/TypeScript/pull/4484 for more details.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        suppressExcessPropertyErrors: true
      }
    }
  }
});
````

#### suppressImplicitAnyIndexErrors

````javascript
true | false (default)
````

Set to true to pass `--suppressImplicitAnyIndexErrors` to the compiler.  If set to true, TypeScript will allow access to properties of an object by string indexer when `--noImplicitAny` is active, even if TypeScript doesn't know about them.  This setting has no effect unless `--noImplicitAny` is active.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        suppressImplicitAnyIndexErrors: true,
        noImplicitAny: true
      }
    }
  }
});
````

For example, the following code would not compile with `--noImplicitAny` alone, but it would be legal with `--noImplicitAny` and `--suppressImplicitAnyIndexErrors` both enabled:

````typescript
interface person {
    name: string;
}

var p : person = { name: "Test" };
p["age"] = 101;  //property age does not exist on interface person.
console.log(p["age"]);
````

#### emitDecoratorMetadata

````javascript
true | false (default)
````

Set to true to pass `--emitDecoratorMetadata` to the compiler.  If set to true, TypeScript will emit type information about type and parameter decorators, so it's available at runtime.

Used by tools like [Angular](https://angular.io/). You will probably need to import the [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) package in your app when using this feature.

#### target

````javascript
"es5" (default) | "es3" | "es6"
````

Allows the developer to specify if they are targeting ECMAScript version 3, 5, or 6.  Support for `es6` emit was added in TypeScript 1.4 and is listed as experimental.  Only select ES3 if you are targeting old browsers (IE8 or below).  The default for grunt-ts (es5) is different than the default for `tsc` (es3).

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        target: "es3" //for IE8 and below
      }
    }
  }
});
````

#### tsconfig

Grunt-ts can integrate with a `tsconfig.json` file in three ways which offer different behavior:
  * As a `boolean`: simplest way for default behavior.
  * As a `string`: still uses defaults, but allows specifying a specific path to the `tsconfig.json` file or the containing folder.
  * As an `object`: allows detailed control over how grunt-ts works with `tsconfig.json`

**When specifying tsconfig as a boolean**
In this scenario, grunt-ts will use all settings from the `tsconfig.json` file in the same folder as `Gruntfile.js`.
  * If an `include` property is present in the `tsconfig.json` file:
    * Grunt-ts will emulate the native tsconfig behavior of TypeScript with regards to the `include` array and `exclude` array (if present).
    * Note: Grunt-ts will fail the Grunt pipeline if an `include` property is present in the `tsconfig.json` file and grunt-ts has `overwriteFilesGlob` or `updateFiles` set to true.  These settings were developed for a time before `include` was available, and they don't make sense to use with it.
  * If a `filesGlob` property is present in the `tsconfig.json` file:
    * It will be evaluated, and any identified files will be added to the compilation context.
    * If a `files` property is present, it will be modified with the result from evaluating the `filesGlob` that is present **inside** `tsconfig.json` (the `files` element will **not** be updated with the results from any glob inside `Gruntfile.js`).
    * If `exclude` is present, it will be ignored.
  * If a `filesGlob` property is NOT present, but `files` is present:
    * Any files specified in `files` will be added to the compilation context.
    * If `exclude` is present, it will be ignored.
  * If neither `filesGlob` nor `files` is present:
    * All \*.ts and \*.tsx files in all subfolders will be added to the compilation context, **excluding** any subfolders specified in the optional `exclude` property.
  * If a glob is also specified in the `Gruntfile.js`, grunt-ts will NOT update the `filesGlob` in the `tsconfig.json` file with it nor will those files be added to the `tsconfig.json` `files` element.
  * The `tsconfig` property should function correctly as either a task option or a target property.
  * If the `tsconfig.json` file does not exist or there is a parse error, compilation will be aborted with an error.

```js
grunt.initConfig({
  ts: {
    default: {
      // specifying tsconfig as a boolean will use the 'tsconfig.json' in same folder as Gruntfile.js
      tsconfig: true
    }
  }
});
```

**When specifying tsconfig as a string**
This scenario follows the same behavior as specifying `tsconfig.json` as a boolean, except that it is possible to use an explicit file name.  If a directory name is provided instead, grunt-ts will use `tsconfig.json` in that directory.  The path to `tsconfig.json` (or the directory that contains it) is relative to `Gruntfile.js`.

```js
grunt.initConfig({
  ts: {
    default: {
      // specifying tsconfig as a string will use the specified `tsconfig.json` file.
      tsconfig: './some/path/to/tsconfig.json'
    }
  }
});
```

**When specifying tsconfig as an object**
This provides the most control over how grunt-ts integrates with `tsconfig.json`.  Supported properties are:
  * `tsconfig`: `string` (optional) - if absent, will default to `tsconfig.json` in same folder as `Gruntfile.js`.  If a folder is passed, will use `tsconfig.json` in that folder.
  * `ignoreFiles`: `boolean` (optional) - default is `false`.  If true, will not inlcude files in `files` array from `tsconfig.json` in the compilation context.
  * `ignoreSettings`: `boolean` (optional) - default is `false`.  If true, will ignore `compilerOptions` section in `tsconfig.json` (will only use settings from `Gruntfile.js` or grunt-ts defaults)
  * `overwriteFilesGlob`: `boolean` (optional) - default is `false`.  If true, will overwrite the contents of the `filesGlob` array with the contents of the `src` glob from grunt-ts.  This option is not supported if `include` is specified in the `tsconfig.json` file.
  * `updateFiles`: `boolean` (optional) - If `include` in the tsconfig.json file is not specified and there is a `filesGlob` present, default is `true`, otherwise false.  Will modify the `files` array in `tsconfig.json` to match the result of evaluating a `filesGlob` that is present **inside** `tsconfig.json` (the `files` element will **not** be updated with the results from any glob inside `Gruntfile.js` unless `overwriteFilesGlob` is also `true`).
  * `passThrough`: `boolean` (optional) - default is `false`.  See [passThrough](#passthrough), below.


```js
grunt.initConfig({
  ts: {
    default: {
      // specifying tsconfig as an object allows detailed configuration overrides...
      tsconfig: {
        tsconfig: './SomeOtherFolder/tsconfig.json',
        ignoreFiles: false,
        ignoreSettings: false,
        overwriteFilesGlob: false,
        updateFiles: true,
        passThrough: false
      }
    }
  }
});
```

#### passThrough
If `passThrough` is set to `true`, grunt-ts will run TypeScript (`tsc`) with the specified tsconfig, passing the `--project` option only (plus anything in `additionalFlags`).  This provides support for custom compilers with custom implementations of `tsconfig.json` support.  Note: Since this entirely depends on support from `tsc`, the `tsconfig` option must be a directory (not a file) as of TypeScript 1.6.  If you are entirely happy with your `tsconfig.json`, this is the way you should run grunt-ts.


### Important notes:
  * Globs in `filesGlob` in `tsconfig.json` are relative to the `tsconfig.json`, **not** the `Gruntfile.js`.
  * `tsconfig` has a restriction when used with `files` in the Grunt task configuration: `overwriteFilesGlob` is NOT supported if `files` has more than one element.  This will abort compilation.
  *  If `files` is absent in `tsconfig.json`, but `filesGlob` is present, grunt-ts will create and update the `files` array in `tsconfig.json` as long as `updateFiles` is `true` (the default).  Since `files` will be created in this scenario, any values in the `exclude` array will be ignored.
  * This feature may be used along with the `vs` keyword.  Any settings found in `tsconfig.json` will override any settings found in the Visual Studio project file.  Any files referenced in the Visual Studio file that are not also referenced in tsconfig.json *will* be included in the compilation context after any files from `tsconfig.json` (any files from `src` but not in `vs` or `tsconfig` will be included after that).  The order of the files in `tsconfig.json` will override the order of the files in the VS project file.

#### verbose

````javascript
false (default) | true
````

Will print the switches passed to `tsc` on the console.  Helpful for debugging.

````javascript
grunt.initConfig({
  ts: {
    default: {
      options: {
        verbose: true
      }
    }
  }
});
````

### Transforms

Objective: To allow for easier code refactoring by taking relative path maintenance burden off the developer.  If the path to a referenced file changes, `grunt-ts` will regenerate the relevant lines.

Transforms begin with a three-slash comment `///` and are prefixed with `ts:`.  When grunt-ts is run against your TypeScript file, it will add a new line with the appropriate TypeScript code to reference the file, or it will generate a comment indicating that the file you referenced could not be found.

For example, if you put this in your code:

```typescript
///ts:ref=mylibrary
```

The next time grunt-ts runs, it might change that line to this:

```typescript
///ts:ref=mylibrary
/// <reference path='../path/to/mylibrary.d.ts'/> ///ts:ref:generated
```

**Important Note:** All transforms require the searched-for file to be *included* in the result of the `files`, `src`, or `vs` Grunt globs.  Grunt-ts will only search within the results that *Grunt has identified*; it does not go searching through your disk for files!


You can also run transforms without compiling your code by setting `compile: false` in your config. For example:
```javascript
grunt.initConfig({
  ts: {
    "transforms-only": {
      options: {
        compile: false
      },
      // in addition to your standard settings:
      // src: ...
      // outDir: ...
    },
    // ...
  }
} );
```

#### Import Transform

```typescript
///ts:import=<fileOrDirectoryName>[,<variableName>]
```

This will generate the relevant `import foo = require('./path/to/foo');` code without you having to figure out the relative path.

If a directory is provided, the entire contents of the directory will be imported. However if a directory has a file `index.ts` inside of it, then instead of importing the entire folder only `index.ts` is imported.

##### Examples

Import file:
```typescript
///ts:import=filename
import filename = require('../path/to/filename'); ///ts:import:generated
```

Import file with an alternate name:
```typescript
///ts:import=BigLongClassName,foo
import foo = require('../path/to/BigLongClassName'); ///ts:import:generated
```

Import directory:
```typescript
///ts:import=directoryName
import filename = require('../path/to/directoryName/filename'); ///ts:import:generated
import anotherfile = require('../path/to/directoryName/deeper/anotherfile'); ///ts:import:generated
...
```

Import directory that has an `index.ts` file in it:
```typescript
///ts:import=directoryName
import directoryName = require('../path/to/directoryName/index'); ///ts:import:generated
```
> See Exports for examples of how grunt-ts can generate an `index.ts` file for you

#### Export Transform

```typescript
///ts:export=<fileOrDirectoryName>[,<variableName>]
```

This is similar to `///ts:import` but will generate `export import foo = require('./path/to/foo');` and is very useful for generating indexes of entire module directories when using external modules (which you should **always** be using).

##### Examples

Export file:
```typescript
///ts:export=filename
export import filename = require('../path/to/filename'); ///ts:export:generated
```

Export file with an alternate name:
```typescript
///ts:export=filename,foo
export import foo = require('../path/to/filename'); ///ts:export:generated
```

Export directory:
```typescript
///ts:export=dirName
export import filename = require('../path/to/dirName/filename'); ///ts:export:generated
export import anotherfile = require('../path/to/dirName/deeper/anotherfile'); ///ts:export:generated
...
```

#### References

```typescript
///ts:ref=<fileName>
```

This will generate the relevant `/// <references path="./path/to/foo" />` code without you having to figure out the relative path.

**Note:** grunt-ts only searches through the enumerated results of the `src` or `files` property in the Grunt target.  The referenced TypeScript file *must* be included for compilation (either directly or via wildcard/glob) or the transform won't work.  This is so that grunt-ts doesn't go searching through your whole drive for files.

##### Examples

Reference file:
```typescript
///ts:ref=filename
/// <reference path='../path/to/filename'/> ///ts:ref:generated
```

### JavaScript Generation

When a output file is specified via `out` in combination with a reference file via `reference` then grunt-ts uses the generated reference file to *order the code in the generated JavaScript*.

Use `reference.ts` to specify the order for the few files the build really cares about and leave the rest to be maintained by grunt-ts.

E.g. in the following case the generated JavaScript for `someBaseClass.ts` is guaranteed to be at the top, and the generated JavaScript for `main.ts` is guaranteed to be at the bottom of the single merged `js` file.

Everything between `grunt-start` and `grunt-end` is generated and maintained by grunt-ts. If there is no `grunt-start` section found, it is created. If `reference.ts` does not exist originally, it is also created.

````typescript
/// <reference path="someBaseClass.ts" />

// Put comments here and they are preserved

//grunt-start
/// <reference path="autoreference.ts" />
/// <reference path="someOtherFile.ts" />
//grunt-end


/// <reference path="main.ts" />
````

### Standardizing Line Endings

As of grunt-ts v2.0.2, If you wish to standardize the line endings used by grunt-ts transforms, you can set the `grunt.util.linefeed` property in your gruntfile.js to the desired standard line ending for the grunt-ts managed TypeScript files.

````javascript
module.exports = function(grunt) {

  grunt.util.linefeed = '\r\n';  // this would standardize on CRLF

  /* rest of config */
};
````

Note that it is not currently possible to force TypeScript to emit all JavaScript with a particular line ending, but a switch to allow that is under discussion here: https://github.com/Microsoft/TypeScript/issues/1693


## Video Examples
**TypeScript programming using grunt-ts (YouTube):**

<a href="https://youtu.be/Km0DpfX5ZxM" target="_blank" alt="TypeScript programming using grunt-ts"><img src="https://img.youtube.com/vi/Km0DpfX5ZxM/0.jpg" /></a>

**AngularJS + TypeScript : Workflow with grunt-ts (YouTube)**

<a href="https://youtu.be/0-6vT7xgE4Y" target="_blank" alt="AngularJS + TypeScript : Workflow"><img src="https://img.youtube.com/vi/0-6vT7xgE4Y/0.jpg" /></a>

## License

Licensed under the MIT License.
