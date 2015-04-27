// TEST Process: 
// delete a generated lines
//// Now compile and see if they reappear

// regular expression
///ts:import=/*.ts/
import c1 = require('./bar/c/c1'); ///ts:import:generated
import c2 = require('./bar/c/c2'); ///ts:import:generated
import A1 = require('./foo/a/A1'); ///ts:import:generated
import A2 = require('./foo/a/A2'); ///ts:import:generated
import a = require('./foo/a/index'); ///ts:import:generated
import b1 = require('./foo/b/b1'); ///ts:import:generated
import b2 = require('./foo/b/b2'); ///ts:import:generated
import foo = require('./foo/index'); ///ts:import:generated
import regularExpressions = require('./regularExpressions'); ///ts:import:generated
import rootLevel = require('./rootLevel'); ///ts:import:generated

// USE CLASSES FROM A/B:

// With `export =` and naming file same as main export variable:
var a1 = new a.A1();
var a2 = new a.A2();

// Conventional javascript file naming and exporting class with `export class ClassName`
var b1Instance = new b1.B1();
var b2Instance = new b2.B2();

// Tests:
console.log(a1.a1());
console.log(a2.a2());

console.log(b1Instance.b1());
console.log(b2Instance.b2());

console.log('executed c');


// regular expression invalid
///ts:import=/*.notvalid/
/// No file or directory matched name "/*.notvalid/" ///ts:import:generated