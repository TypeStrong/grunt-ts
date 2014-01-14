///<reference path="../reference.ts"/>
class ClassB extends ClassA {
    constructor() {
        super(); 
        console.log('class B');
    }
}
console.log('reading html:', templates.a.html);
