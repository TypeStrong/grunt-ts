/// <reference path="Bar.ts" />
	
class Foo extends Bar {
		
	constructor() {
		super();
		this.value = 'foo ' + this.value;
	}
	
}