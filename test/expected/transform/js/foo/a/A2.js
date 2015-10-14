var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var A1 = require('./A1');
var A2 = (function (_super) {
    __extends(A2, _super);
    function A2() {
        _super.apply(this, arguments);
    }
    A2.prototype.a2 = function () { return this.a1() + "a2"; };
    return A2;
})(A1);
module.exports = A2;
//# sourceMappingURL=A2.js.map