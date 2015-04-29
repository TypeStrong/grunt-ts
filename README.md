# grunt-ts

[![Build Status](https://secure.travis-ci.org/TypeStrong/grunt-ts.svg?branch=master)](http://travis-ci.org/TypeStrong/grunt-ts) [![NPM version](https://badge.fury.io/js/grunt-ts.svg)](http://badge.fury.io/js/grunt-ts)

## TypeScript Compilation Task for GruntJS

Grunt-ts is an npm package that handles TypeScript compilation work in GruntJS build scripts.  It provides a [Grunt-compatible wrapper](#support-for-tsc-switches) for the `tsc` command-line compiler, and provides some [additional functionality](#grunt-ts-gruntfilejs-options) that improves the TypeScript development workflow. Grunt-ts even supports compiling against a [Visual Studio project](#vs) directly.  Grunt-ts is itself written in [TypeScript](./tasks/ts.ts).

## Getting Started

If you've never used GruntJS on your computer, you should [follow the detailed instructions here](/docs/DetailedGettingStartedInstructions.md) to get Node.js and the grunt-cli working.  If you're a Grunt expert, simply follow these steps:

 * Run `npm install grunt-ts` in your project directory; this will install `grunt-ts`, TypeScript, and GruntJS.
 * Add the `ts` task in your `Gruntfile.js` (see below for a minimalist one).
 * Run `grunt` at the command line in your project folder to compile your TypeScript code.

This minimalist `Gruntfile.js` will compile `*.ts` files in all subdirectories of the project folder, excluding anything under `node_modules`:

````javascript
module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default : {
        src: ["**/*.ts", "!node_modules/**/*.ts"]
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
 * Provides a [transforms](#transforms) feature that eases code refactoring by taking the burden of relative path maintenance off the developer. If the paths to a set of files changes, grunt-ts will regenerate the relevant sections.  This feature supports:
   * External module [import transforms](#import-transform) by file name, aliasing, directories, regular expressions, indexed directories, and re-exported imports.
   * Internal module [reference maintenance](#references)
   * Common [reference file](#reference) management
 * Allows [concatenation](#out) where supported by the TypeScript compiler's `--out` switch
 * [Encodes HTML](#html) files as TypeScript variables (for HTML templating engines)
 * Performs live file [watching](#watch) (compile on save)
 * Enables ["Fast" compile](#fast) when using external modules

## Support for tsc Switches

Grunt-ts supports most `tsc` switches.  Click the link to cross-reference to the grunt-ts option.

|`tsc` switch|grunt-ts analogue|description|
|:----:|:----:|:-----|
| --declaration|[declaration](#declaration)|Generates a `.d.ts` definitions file for compiled TypeScript files|
|--mapRoot LOCATION|[mapRoot](#maproot)|Specifies the location where debugger should locate map files instead of generated locations.|
|--module KIND|[module](#module)|Specify module style for code generation|
|--noImplicitAny|[noImplicitAny](#noimplicitany)|Warn on expressions and declarations with an implied `any` type.|
|--noResolve|[noResolve](#noresolve)|Skip resolution and preprocessing (deprecated)|
|--out FILE|[out](#out)|Concatenate and emit output to a single file.|
|--outDir DIRECTORY|[outDir](#outdir)|Redirect output structure to the directory.|
|--preserveConstEnums|[preserveConstEnums](#preserveconstenums)|Const enums will be kept as enums in the emitted JS.|
|--removeComments|[removeComments](#removecomments)|Configures if comments should be included in the output|
|--sourceMap|[sourceMap](#sourcemap)|Generates corresponding `.map` file|
|--sourceRoot LOCATION|[sourceRoot](#sourceroot)|Specifies the location where debugger should locate TypeScript files instead of source locations.|
|--suppressImplicitAnyIndexErrors|[suppressImplicitAnyIndexErrors](#suppressimplicitanyindexerrors)|Specifies the location where debugger should locate TypeScript files instead of source locations.|
|--target VERSION|[target](#target)|Specify ECMAScript target version: `'es3'`, `'es5'`, or `'es6'`|


For file ordering, look at [JavaScript Generation](#javascript-generation).

## grunt-ts gruntfile.js options

|property|where to define|description|
|:----|:----|:-----|
|[comments](#comments)|option|`true`, `false` (default) - include comments in emitted JS.|
|[compile](#compile)|option|`true` (default), `false` - compile TypeScript code.|
|[compiler](#compiler)|option|`string` - path to custom compiler|
|[declaration](#declaration)|option|`true`, `false` (default) - indicates that definition files should be emitted.|
|[failOnTypeErrors](#failontypeerrors)|option|`true` (default), `false` - fail Grunt pipeline if there is a type error|
|[fast](#fast)|option|`'watch'` (default), `'always'`, `'never'` - how to decide on a "fast" grunt-ts compile.|
|[files](#files)|target|Sets of files to compile and optional output destination|
|[html](#html)|target|`string` or `string[]` - glob to HTML templates|
|[htmlModuleTemplate](#htmlmoduletemplate)|option|`string` - HTML template namespace|
|[htmlVarTemplate](#htmlvartemplate)|option|`string` - HTML property name|
|[mapRoot](#maproot)|option|`string` - root for referencing `.js.map` files in JS|
|[module](#module)|option|default to be nothing, If you want to set it you set it to either `'amd'` or `'commonjs'`|
|[noImplicitAny](#noimplicitany)|option|`true`, `false` (default) - enable for stricter type checking|
|[noResolve](#noresolve)|option|`true`, `false` (default) - for deprecated version of TypeScript|
|[options](#grunt-ts-target-options)|target||
|[out](#out)|target|`string` - instruct `tsc` to concatenate output to this file.|
|[outDir](#outdir)|target|`string` - instruct `tsc` to emit JS to this directory.|
|[preserveConstEnums](#preserveconstenums)|option|`true`, `false` (default) - If true, const enums will be kept as enums in the emitted JS.|
|[reference](#reference)|target|`string` - tells grunt-ts which file to use for maintaining references|
|[removeComments](#removecomments)|option|`true` (default), `false` - removes comments in emitted JS|
|[sourceRoot](#sourceroot)|option|`string` - root for referencing TS files in `.js.map`|
|[sourceMap](#sourcemap)|option|`true` (default), `false` - indicates if source maps should be generated (`.js.map`)|
|[suppressImplicitAnyIndexErrors](#suppressimplicitanyindexerrors)|option|`false` (default), `true` - indicates if TypeScript should allow access to properties of an object by string indexer when `--noImplicitAny` is active, even if TypeScript doesn't know about them.|
|[src](#src)|target|`string` or `string[]` - glob of TypeScript files to compile.|
|[target](#target)|option|`'es5'` (default), `'es3'`, or `'es6'` - targeted ECMAScript version|
|[verbose](#verbose)|option|`true`, `false` (default) - logs `tsc` command-line options to console|
|[vs](#vs)|target|`string` referencing a `.csproj` or `.vbproj` file or, `{}` (object) (see [Visual Studio Projects](#vs) for details)|
|[watch](#watch)|target|`string` - will watch for changes in the specified directory or below|

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

<!--
#### nolib

Specify this option if you do not want the lib.d.ts to be loaded by the TypeScript compiler.
-->

#### out

Passes the --out switch to `tsc`.  This will cause the emitted JavaScript to be concatenated to a single file if your code allows for that.

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



#### noResolve

````javascript
true | false (default)
````

*Deprecated:* Grunt-ts supports passing this parameter to legacy versions of `tsc`.  It will pass `--noResolve` on the command line.

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
"amd" (default) | "commonjs" | ""
````

Specifies if TypeScript should emit AMD or CommonJS-style external modules.  Has no effect if internal modules are used.

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

#### sourceMap

````javascript
true (default) | false
````

If true, grunt-ts will instruct `tsc` to emit source maps (`.js.map` files).

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

Import files with a regular expression:
```typescript
///ts:import=/*.ts/
import filename = require('../path/to/directoryName/filename'); ///ts:import:generated
import anotherfile = require('../path/to/anotherDirectoryName/anotherfile'); ///ts:import:generated
```

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

Export files with a regular expression:
```typescript
///ts:export=/*.ts/
export import filename = require('../path/to/directoryName/filename'); ///ts:export:generated
export import anotherfile = require('../path/to/anotherDirectoryName/anotherfile'); ///ts:export:generated
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

The easiest/fastest way to work on grunt-ts is to modify `tasksToTest` toward the bottom of the `gruntfile.js`.  The `grunt dev` command is set up to compile grunt-ts with your changes and then reload itself; then, your newly-compiled grunt-ts will be used to run whatever tasks are listed in the `tasksToTest` array.

Without using `tasksToTest` while working on grunt-ts, the old grunt-ts remains in memory for successive tasks on the same run.  This means you might have to run your grunt commands twice; once to compile grunt-ts and once to see how the new grunt-ts works with your code.


### Additional commands
Update the current `grunt-ts` to be the last known good version (dogfood). Commit message should be `Update LKG`.

```bash
$ grunt upgrade
```

### Publishing Checklist

 * Run `grunt release` and ensure it comes back clean (should finish but with warnings).
 * Update the version in package.json.
 * Update CHANGELOG.md.
 * Commit to master.
 * Publish to npm.
 * Push version tag to GitHub.

## License

Licensed under the MIT License.
