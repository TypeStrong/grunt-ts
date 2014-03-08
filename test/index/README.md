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

The files at the root level of `directorya` etc are excluded to prevent unintentional cyclic references.  

# Usage
This allows you to import stuff within your application from the index folder. And then you are free to reorganize your code over time and not update all the referenced places. Additionally `foldername.ts` files make it easy to import entire folders without manual effort.

# Limitations

* *No* file should import a `foldername.ts` above it in the tree to prevent a cyclic dependency (since `foldername.ts` already has a require statement pointing to this subfile)
