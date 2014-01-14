///<reference path="../reference.ts"/>
class ClassC extends ClassA {
    constructor() {
        super(); 
        console.log('class C');
    }
}
console.log('reading html:', templates.a.html);