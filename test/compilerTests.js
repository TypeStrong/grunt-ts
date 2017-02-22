"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile = require("../tasks/modules/compile");
exports.tests = {
    "grunt-ts `fast` compile feature": {
        "Successful compile with (fast === never) should NOT refresh fast cache": function (test) {
            test.expect(1);
            var options = { fast: "never" }, compileResult = { code: 0 }, result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);
            test.strictEqual(result, false);
            test.done();
        },
        "Successful compile with (fast === always) should refresh fast cache": function (test) {
            test.expect(1);
            var options = { fast: "always" }, compileResult = { code: 0 }, result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);
            test.strictEqual(result, true);
            test.done();
        },
        "Syntax error compile with (fast === never) should NOT refresh fast cache": function (test) {
            test.expect(1);
            var options = { fast: "never" }, compileResult = { code: 1 }, result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);
            test.strictEqual(result, false);
            test.done();
        },
        "Syntax error compile with (fast === always) should NOT refresh fast cache": function (test) {
            test.expect(1);
            var options = { fast: "always" }, compileResult = { code: 1 }, result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);
            test.strictEqual(result, false);
            test.done();
        },
        "Type error compile with (fast === always) and !failOnTypeErrors should refresh fast cache": function (test) {
            test.expect(1);
            var options = { fast: "always", failOnTypeErrors: false }, compileResult = { code: 2 }, result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);
            test.strictEqual(result, true);
            test.done();
        },
        "Type error compile with (fast === always) and failOnTypeErrors should NOT refresh fast cache": function (test) {
            test.expect(1);
            var options = { fast: "always", failOnTypeErrors: true }, compileResult = { code: 2 }, result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);
            test.strictEqual(result, false);
            test.done();
        }
    }
};
//# sourceMappingURL=compilerTests.js.map