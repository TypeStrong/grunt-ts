
import A1 = require('./A1');

class A2 extends A1 {
    a2() { return this.a1()+"a2" }
}


export = A2