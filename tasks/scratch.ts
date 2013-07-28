interface String {
    endsWith(suffix: string): boolean;
}
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

console.log("asdf".endsWith("f"));

function test(){}
export = test;