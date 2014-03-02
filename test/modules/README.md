This is a living document till we've finalized everything:

# Background 

This is a proposal to target both requirejs / nodejs with codegen to reduce the need to have explicit file paths when not required. So you can simply add a new TypeScript file and start writing code without unnecessary ceremony required by the javascript module system.

# Implementation
Have a target option called `modules` that takes `"moduleDirectory" : "gruntFileGlobs"` generates an index.ts at each moduleDirectory which contains every file from the file glob as 
```
import filename_file = require('./path/to/filename');
export var file = filename_file;
```

# Sample
The file structure: 

```
a
|--a1.ts
|--a2.ts
b
|--b1.ts
|--b2.ts
c
|--c.ts
```

And we want to use `a1,a2,b1,b2` from `c.ts`.

# Limitations
* The module cannot contain the file consuming the module. e.g. notice it does not contain `c`: 
```
//grunt-start
import A1_file = require('./a/A1');
export var A1 = A1_file;
import A2_file = require('./a/A2');
export var A2 = A2_file;
import b1_file = require('./b/b1');
export var b1 = b1_file;
import b2_file = require('./b/b2');
export var b2 = b2_file;
//grunt-end
```

* There is still some unnecessary dots e.g. note `main.` but this is tolerable. 

```
// With `export =` and naming file same as main export variable: 
var a1 = new main.A1();
var a2 = new main.A2();

// Conventional javascript file naming and exporting class with `export class ClassName`
var B1 = main.b1.B1;
var B2 = main.b2.B2;
var b1 = new B1();
var b2 = new B2();
```

* Two files in a module cannot share the same filename. It is a bad practice to do this anyways.