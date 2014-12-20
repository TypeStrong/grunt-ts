// Error code 1 due to explicit type error
/*var a: string = '',
    b: number = a + 2;

console.log(b);*/

// Error code 4 due to accessing private member

export class TestClass1 {
    public publicMember: PrivateInterface;

    constructor() {
        this.publicMember = {a: 1, b: 2};
        console.log(this.publicMember.b);
    }
}

export class TestClass2 {
    constructor(t: TestClass1) {
        var m: PrivateInterface = t.publicMember; // Accessing private interface
        console.log(m.b);
    }
}

interface PrivateInterface {
    a: number;
}
