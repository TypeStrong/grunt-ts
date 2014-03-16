# WARNING: Deprecated

## Reasons for dropping support: 
* It expects the user to do further config inside the gruntfile task. This work we can avoid. 
* It adds a directory `index` containing a bunch of files. Many of these will never even be used. 
* It is unintutive from a simple import of a directory what are all the files you are actually loading (which might be more than you think). 
* It is still difficult to manage. You would need to commit an `index` directory into source control. And all your files will need to point to this. I personally would not even want to type `require('../../../../index/someotherfile.ts');`

For new plan see : https://github.com/grunt-ts/grunt-ts/issues/85

# Background 

Target both requirejs / nodejs with codegen to reduce the need to have explicit file paths when not required. So you can simply add a new TypeScript file and start writing code without unnecessary ceremony required by the javascript module system. This is similar to the `reference.ts` concept except it is for *external modules*

# Implementation

`index: ['directorya',...]` will create a `directorya/index/` directory if not already there. 

Inside `/index` it will create the following files (contents of these files are explained later):

* `filename.ts` for each subfile of directorya, excluding files called `index.ts` and immediate children of `directorya`.
* `foldername.ts` for each subfolder of directorya.
* If any `index.ts` files are found at any folder these will replace the corresponding `foldername.ts`. 

If two files (or folders) at any level of the directory are called the same (excluding `index.ts`) then an error is thrown.

A generated `filename.ts` (or `foldername.ts` created for existing `index.ts`) consists of the following for a given file: 

```
import filename = require('./path/to/filename');
export = filename;
```

A generated `foldername.ts` (other than `index.ts`) consists of the following for each subfile of the folder: 

```
import filename1_file = require('./path/to/filename1');
export var filename1 = filename1_file;
import filename2_file = require('./path/to/filename2');
export var filename2 = filename2_file;
```

# Usage
This allows you to import stuff within your application from the index folder. And then you are free to reorganize your code over time and not update all the referenced places. Additionally `foldername.ts` files make it easy to import entire folders without manual effort.

Consider the example folder [source](https://github.com/grunt-ts/grunt-ts/tree/master/test/index/ts): 
```
foo
  a
  |--A1.ts
  |--A2.ts
  b
  |--b1.ts
  |--b2.ts
bar
  c
  |--c.ts
index
  | This will be dynamically created  
```  
And we want to use a1,a2,b1,b2 (foo module) from c.ts,  It becomes as simple as: 

``` TypeScript
import foo = require('../../index/foo');

// USE CLASSES FROM A/B:

// With `export =` and naming file same as main export variable: 
var a1 = new foo.A1();
var a2 = new foo.A2();

// Conventional javascript file naming and exporting class with `export class ClassName`
var B1 = foo.b1.B1;
var B2 = foo.b2.B2;
var b1 = new B1();
var b2 = new B2();
```

Or you can import at a more granular level (for lazy loads): 
```
import a = require('../../index/a');
import b1 = require('../../index/b1');
import b2 = require('../../index/b2');

// USE CLASSES FROM A/B:

// With `export =` and naming file same as main export variable: 
var a1 = new a.A1();
var a2 = new a.A2();

// Conventional javascript file naming and exporting class with `export class ClassName`
var b1Instance = new b1.B1();
var b2Instance = new b2.B2();
```

# Limitations

* *No* file should import a `foldername.ts` above it in the tree to prevent a cyclic dependency (since `foldername.ts` already has a require statement pointing to this subfile)

* The files which are immediate children of `directorya` are excluded to prevent unintentional cyclic references. These file should contain code to kick off the application.  
