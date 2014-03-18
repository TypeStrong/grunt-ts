
import B1 = require('./b1');

export class B2 extends B1.B1 {
    b2() { return this.b1()+"b2" }
}