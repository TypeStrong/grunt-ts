const enum Stuff {
    A = 0x1,
    B = 0x2,
    C = 0x4,
    All = A | B | C
}

var x: Stuff = Stuff.A;