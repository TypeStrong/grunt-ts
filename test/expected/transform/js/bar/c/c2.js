var a = require('../../foo/a/index');

var b1 = require('../../foo/b/b1');

var b2 = require('../../foo/b/b2');

var a1 = new a.A1();
var a2 = new a.A2();

var b1Instance = new b1.B1();
var b2Instance = new b2.B2();

console.log(a1.a1());
console.log(a2.a2());

console.log(b1Instance.b1());
console.log(b2Instance.b2());

console.log('executed c');
//# sourceMappingURL=c2.js.map
