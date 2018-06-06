"use strict";
function writeIt(value) {
    console.log(value);
}
exports.writeIt = writeIt;
System.register("allowJsConsumer", ["allowJsLibrary"], function (exports_1, context_1) {
    "use strict";
    var allowJsLibrary_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (allowJsLibrary_1_1) {
                allowJsLibrary_1 = allowJsLibrary_1_1;
            }
        ],
        execute: function () {
            allowJsLibrary_1.writeIt("test");
        }
    };
});
//# sourceMappingURL=result.js.map