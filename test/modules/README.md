This is a living document till we've finalized everything:

# Background 

This is a proposal to target both requirejs / nodejs with codegen to reduce the need to have explicit file paths when not required. So you can simply add a new TypeScript file and start writing code without unnecessary ceremony required by the javascript module system.

# Implementation
`index: 'directorya'` will create an `index/` directory inside directorya and a file.ts inside `index/` for each subfile of directorya. If a file is called `index.ts` then it is exported as `foldername.ts`. If two files at any level of the directory are called the same then an error is thrown.

# Sample
The file structure: 

```
foo
  a
  |--a1.ts
  |--a2.ts
  b
  |--b1.ts
  |--b2.ts
bar
  c
  |--c.ts
```

And we want to use `a1,a2,b1,b2` (foo module) from `c.ts`.

# Limitations
* Inside a module  (e.g. `foo`) dependencies need to be explict e.g. a2 must explicitly require a1 if it needs it. 

* *No* file should import an index file above it in the tree (since this index file already has a require pointing to this subfile)

* There is still some unnecessary dots e.g. note `foo.` but this is tolerable. 

```
// With `export =` and naming file same as main export variable: 
var a1 = new foo.A1();
var a2 = new foo.A2();

// Conventional javascript file naming and exporting class with `export class ClassName`
var B1 = foo.b1.B1;
var B2 = foo.b2.B2;
var b1 = new B1();
var b2 = new B2();
```

* Two files in a module cannot share the same filename. It is a bad practice to do this anyways.

# Rejected Ideas

## Idea A
Have a target option called `modules` that takes `"moduleDirectory" : "gruntFileGlobs"` generates an index.ts at each moduleDirectory which contains every file from the file glob as 
```
import filename_file = require('./path/to/filename');
export var file = filename_file;
```

This is good for when you want lazy loading and only need a few modules to be explicit. 

## Idea B
`index: ['directorya','directoryb']` will create an index.ts in *each* folder inside `directorya`,`directoryb`... . You can ignore these from your repo. 

This is great for when you don't care about lazy loading within your code.

## Idea C 
`index: 'directorya'` will create an `index/` directory inside directorya and a folder.ts inside `index/` for each subfolder of directorya