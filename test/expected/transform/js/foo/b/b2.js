var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var B1 = require('./b1');
var B2 = (function (_super) {
    __extends(B2, _super);
    function B2() {
        _super.apply(this, arguments);
    }
    B2.prototype.b2 = function () { return this.b1() + "b2"; };
    return B2;
})(B1.B1);
exports.B2 = B2;
//# sourceMappingURL=b2.js.map