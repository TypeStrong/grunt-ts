"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var A1 = require("./A1");
var A2 = /** @class */ (function (_super) {
    __extends(A2, _super);
    function A2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    A2.prototype.a2 = function () { return this.a1() + "a2"; };
    return A2;
}(A1));
module.exports = A2;
//# sourceMappingURL=A2.js.map