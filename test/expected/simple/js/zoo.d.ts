declare class Animal {
    name: string;
    constructor(name: string);
    move(meters: number): void;
}
declare class Snake extends Animal {
    constructor(name: string);
    move(): void;
}
declare class Horse extends Animal {
    constructor(name: string);
    move(): void;
}
declare var sam: Snake;
declare var tom: Animal;
