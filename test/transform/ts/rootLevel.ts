// TEST Process: 
// delete a generated lines
//// Now compile and see if they reappear

// valid argument folder with index
///ts:import=foo
import foo = require('./foo/index'); ///ts:import:generated

// valid argument folder without index
///ts:import=bar
import c1 = require('./bar/c/c1'); ///ts:import:generated
import c2 = require('./bar/c/c2'); ///ts:import:generated

// valid argument file
///ts:import=A1
import A1 = require('./foo/a/A1'); ///ts:import:generated

// valid argument file renamed
///ts:import=A1,a1
import a1 = require('./foo/a/A1'); ///ts:import:generated

///ts:import=nonexistent
/// No file or directory matched name "nonexistent" ///ts:import:generated

///ts:someunknowntransform
/// Unknown transform ///ts:unknown:generated
