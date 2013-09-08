var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ClassB = (function (_super) {
    __extends(ClassB, _super);
    function ClassB() {
        _super.call(this);
        console.log('class b');
    }
    return ClassB;
})(ClassA);
console.log('reading html:', test.tpl.html);
//# sourceMappingURL=classb.js.map
