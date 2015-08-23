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
    "bad sourceMap capitalization": {
        options: {
            target: 'es3',
            sourcemap: true
        }
    },
    "sourceMap in wrong place": {
        options: {
            target: 'es3'
        },
        sourceMap: true
    },
    "bad sourceMap capitalization in wrong place": {
        options: {
            target: 'es3'
        },
        sourcemap: true
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
    },
    "out has spaces": {
        out: "my folder/out has spaces.js"
    },
    "outDir has spaces": {
        outDir: "./my folder"
    },
    "reference set to ref1.ts": {
        reference: "ref1.ts"
    },
    "reference set to ref2.ts": {
        reference: "ref2.ts"
    },
    "reference set to null": {
        reference: null
    },
    "reference set to undefined": {
        reference: undefined
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
    "Warnings and Errors Tests": {
        "Bad capitalization detected and fixed": function (test) {
            test.expect(2);
            var result = or.resolveAsync(null, config["bad sourceMap capitalization"]).then(function (result) {
                var allWarnings = result.warnings.join('\n');
                test.ok(allWarnings.indexOf('Property "sourcemap" in target "" options is incorrectly cased; it should be "sourceMap"') > -1);
                test.strictEqual(result.sourcemap, undefined);
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Option in wrong place detected": function (test) {
            test.expect(1);
            var result = or.resolveAsync(null, config["sourceMap in wrong place"]).then(function (result) {
                var allWarnings = result.warnings.join('\n');
                test.ok(allWarnings.indexOf('Property "sourceMap" in target "" is possibly in the wrong place and will be ignored.  It is expected on the options object.') > -1);
                test.done();
            });
        },
        "Option in wrong place and wrong case detected": function (test) {
            test.expect(2);
            var result = or.resolveAsync(null, config["bad sourceMap capitalization in wrong place"]).then(function (result) {
                var allWarnings = result.warnings.join('\n');
                test.ok(allWarnings.indexOf('Property "sourcemap" in target "" is possibly in the wrong place and will be ignored.  It is expected on the options object.') > -1);
                test.ok(allWarnings.indexOf('It is also the wrong case and should be sourceMap') > -1);
                test.done();
            });
        }
    },
    "Special processing Tests": {
        "path with spaces gets enclosed in double-quotes": function (test) {
            test.expect(1);
            var result = or.escapePathIfRequired("this is a path/path.txt");
            test.strictEqual(result, "\"this is a path/path.txt\"");
            test.done();
        },
        "path that is already enclosed in double-quotes is unchanged": function (test) {
            test.expect(1);
            var result = or.escapePathIfRequired("\"this is a path/path.txt\"");
            test.strictEqual(result, "\"this is a path/path.txt\"");
            test.done();
        },
        "path without spaces is unchanged": function (test) {
            test.expect(1);
            var result = or.escapePathIfRequired("thisIsAPath/path.txt");
            test.strictEqual(result, "thisIsAPath/path.txt");
            test.done();
        },
        "out with spaces gets escaped with double-quotes": function (test) {
            test.expect(1);
            var files = [config["out has spaces"]];
            var result = or.resolveAsync(null, config["out has spaces"], null, files).then(function (result) {
                test.strictEqual(result.CompilationTasks[0].out, "\"my folder/out has spaces.js\"");
                test.done();
            });
        },
        "outDir with spaces gets escaped with double-quotes": function (test) {
            test.expect(1);
            var files = [config["outDir has spaces"]];
            var result = or.resolveAsync(null, config["outDir has spaces"], null, files).then(function (result) {
                test.strictEqual(result.CompilationTasks[0].outDir, "\"./my folder\"");
                test.done();
            });
        }
    },
    "Precedence and defaults override Tests": {
        "The grunt-ts defaults come through when not specified": function (test) {
            test.expect(2);
            var result = or.resolveAsync(null, config["minimalist"]).then(function (result) {
                test.strictEqual(result.target, "es5");
                test.strictEqual(result.fast, "watch");
                test.done();
            });
        },
        "Task properties should override grunt-ts defaults if not specified on the target": function (test) {
            test.expect(2);
            var result = or.resolveAsync(config["reference set to ref1.ts"], config["minimalist"]).then(function (result) {
                test.strictEqual(config["minimalist"].outDir, undefined);
                test.strictEqual(result.reference, 'ref1.ts');
                test.done();
            });
        },
        "Target name is set if specified": function (test) {
            test.expect(1);
            var result = or.resolveAsync(null, config["minimalist"], "MyTarget").then(function (result) {
                test.strictEqual(result.targetName, "MyTarget");
                test.done();
            });
        },
        "Target name is default if not specified": function (test) {
            test.expect(1);
            var result = or.resolveAsync(null, config["minimalist"]).then(function (result) {
                test.strictEqual(result.targetName, '');
                test.done();
            });
        },
        "Task options should override grunt-ts defaults if not specified in the target options": function (test) {
            test.expect(2);
            var result = or.resolveAsync(config["has ES6 and no sourceMap"], config["minimalist"]).then(function (result) {
                test.strictEqual(result.target, "es6");
                test.strictEqual(result.sourceMap, false);
                test.done();
            });
        },
        "Properties specified on the target should override anything specified in the task and the grunt-ts defaults": function (test) {
            test.expect(1);
            var result = or.resolveAsync(config["reference set to ref1.ts"], config["reference set to ref2.ts"]).then(function (result) {
                test.strictEqual(result.reference, "ref2.ts");
                test.done();
            });
        },
        "Explicit null specified on the target should override anything specified in the task and the grunt-ts defaults": function (test) {
            test.expect(1);
            var result = or.resolveAsync(config["reference set to ref1.ts"], config["reference set to null"], null, []).then(function (result) {
                test.strictEqual(result.reference, null);
                test.done();
            });
        },
        "Explicit undefined specified on the target should override anything specified in the task and the grunt-ts defaults": function (test) {
            test.expect(1);
            var files = [config["has outDir set to undefined"]];
            var result = or.resolveAsync(config["reference set to ref1.ts"], config["reference set to undefined"], null, []).then(function (result) {
                test.strictEqual(result.reference, undefined);
                test.done();
            });
        },
        "Properties on target `options` should override the task options `options` object and the grunt-ts defaults": function (test) {
            test.expect(2);
            var result = or.resolveAsync(config["has ES6 and no sourceMap"], config["has ES3 and sourceMap"]).then(function (result) {
                test.strictEqual(result.target, "es3");
                test.strictEqual(result.sourceMap, true);
                test.done();
            });
        }
    },
};
//# sourceMappingURL=optionsResolverTests.js.map