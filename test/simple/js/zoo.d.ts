declare class Animal {
    public name: string;
    constructor(name: string);
    public move(meters: number): void;
}
declare class Snake extends Animal {
    constructor(name: string);
    public move(): void;
}
declare class Horse extends Animal {
    constructor(name: string);
    public move(): void;
}
declare var sam: Snake;
declare var tom: Animal;
