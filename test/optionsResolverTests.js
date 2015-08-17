/// <reference path="../defs/tsd.d.ts" />
var or = require('../tasks/modules/optionsResolver');
var grunt = require('grunt');
var config = {
    "minimalist": {
        src: ["**/*.ts", "!node_modules/**/*.ts"]
    },
    "has ES3 and sourceMap": {
        options: {
            target: 'es3',
            sourceMap: true
        }
    },
    "has ES6 and no sourceMap": {
        options: {
            target: 'es6',
            sourceMap: false
        }
    },
    "has outDir set to ./built": {
        outDir: './built',
        options: {
            target: 'es6',
            sourceMap: false
        }
    },
    "has outDir set to ./myOutDir": {
        outDir: './myOutDir'
    },
    "has outDir set to null": {
        outDir: null
    },
    "has outDir set to undefined": {
        outDir: undefined
    }
};
exports.tests = {
    // "Templates Tests": {
    //   "Processed on Task Properties": (test) => {
    //       test.ok(false);
    //       test.done();
    //   },
    //   "Processed on Task Options": (test) => {
    //       test.ok(false);
    //       test.done();
    //   },
    //   "Processed on Target Properties": (test) => {
    //       test.ok(false);
    //       test.done();
    //   },
    //   "Processed on Target Options": (test) => {
    //       test.ok(false);
    //       test.done();
    //   }
    // },
    "Warnings and Errors Tests": {},
    "Precedence and defaults override Tests": {
        "The grunt-ts defaults come through when not specified": function (test) {
            test.expect(2);
            var result = or.resolve(null, config["minimalist"]);
            test.strictEqual(result.options.target, "es5");
            test.strictEqual(result.options.fast, "watch");
            test.done();
        },
        "Task properties should override grunt-ts defaults if not specified on the target": function (test) {
            test.expect(2);
            var result = or.resolve(config["has outDir set to ./built"], config["minimalist"]);
            test.strictEqual(config["minimalist"].outDir, undefined);
            test.strictEqual(result.options.outDir, './built');
            test.done();
        },
        "Task options should override grunt-ts defaults if not specified in the target options": function (test) {
            test.expect(2);
            var result = or.resolve(config["has ES6 and no sourceMap"], config["minimalist"]);
            test.strictEqual(result.options.target, "es6");
            test.strictEqual(result.options.sourceMap, false);
            test.done();
        },
        "Properties specified on the target should override anything specified in the task and the grunt-ts defaults": function (test) {
            test.expect(1);
            var result = or.resolve(config["has outDir set to ./built"], config["has outDir set to ./myOutDir"]);
            test.strictEqual(result.options.outDir, "./myOutDir");
            test.done();
        },
        "Explicit null specified on the target should override anything specified in the task and the grunt-ts defaults": function (test) {
            test.expect(1);
            var result = or.resolve(config["has outDir set to ./built"], config["has outDir set to null"]);
            test.strictEqual(result.options.outDir, null);
            test.done();
        },
        "Explicit undefined specified on the target should override anything specified in the task and the grunt-ts defaults": function (test) {
            test.expect(1);
            var result = or.resolve(config["has outDir set to ./built"], config["has outDir set to undefined"]);
            test.strictEqual(result.options.outDir, undefined);
            test.done();
        },
        "Properties on target `options` should override the task options `options` object and the grunt-ts defaults": function (test) {
            test.expect(2);
            var result = or.resolve(config["has ES6 and no sourceMap"], config["has ES3 and sourceMap"]);
            test.strictEqual(result.options.target, "es3");
            test.strictEqual(result.options.sourceMap, true);
            test.done();
        }
    },
};
//# sourceMappingURL=optionsResolverTests.js.map