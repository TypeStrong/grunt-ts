// TEST Process: 
// 1 valid argument
// 2 invalid argument
// 3 delete a generated line

///ts:import=foo
import foo = require('./foo/index'); ///ts:import:generated

///ts:import=bar
import c1 = require('./bar/c/c1'); ///ts:import:generated
import c2 = require('./bar/c/c2'); ///ts:import:generated
 