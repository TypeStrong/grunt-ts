
import main = require('../index');

// USE CLASSES FROM A/B:

// With `export =` and naming file same as main export variable: 
var a1 = new main.A1();
var a2 = new main.A2();

// Conventional javascript file naming and exporting class with `export class ClassName`
var B1 = main.b1.B1;
var B2 = main.b2.B2;
var b1 = new B1();
var b2 = new B2();


// Tests:  

console.log(a1.a1());
console.log(a2.a2());

console.log(b1.b1());
console.log(b2.b2());

console.log('executed c');
