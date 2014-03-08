var foo = require('../../index/foo');

var a1 = new foo.A1();
var a2 = new foo.A2();

var B1 = foo.b1.B1;
var B2 = foo.b2.B2;
var b1 = new B1();
var b2 = new B2();

console.log(a1.a1());
console.log(a2.a2());

console.log(b1.b1());
console.log(b2.b2());

console.log('executed c');
//# sourceMappingURL=c1.js.map
