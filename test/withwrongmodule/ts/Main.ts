///<reference path="Foo.ts" />

import Foo = require("Foo");

class Main {
	
	private foo:Foo;
	
	constructor() {
		this.foo = new Foo();
	}
	
	public init() {
		console.log(this.foo.bar)
	}
}

new Main().init();

export = Main;