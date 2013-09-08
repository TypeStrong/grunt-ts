var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ClassC = (function (_super) {
    __extends(ClassC, _super);
    function ClassC() {
        _super.call(this);
        console.log('class c');
    }
    return ClassC;
})(ClassA);
console.log('reading html:', test.tpl.html);
//# sourceMappingURL=classc.js.map
