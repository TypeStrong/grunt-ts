/// <reference path="../defs/tsd.d.ts" />
var or = require('../tasks/modules/optionsResolver');
var tsconfig = require('../tasks/modules/tsconfig');
var utils = require('../tasks/modules/utils');
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
    },
    "vs minimalist": {
        vs: "test/vsproj/testproject.csproj",
        options: {}
    },
    "vs ignoreSettings Release": {
        vs: {
            project: "test/vsproj/testproject.csproj",
            config: "Release",
            ignoreSettings: true
        },
        options: {}
    },
    "vs Release": {
        vs: {
            project: "test/vsproj/testproject.csproj",
            config: "Release",
        },
        options: {}
    },
    "vs TestOutFile": {
        vs: {
            project: "test/vsproj/testproject.csproj",
            config: "TestOutFile",
        },
        options: {}
    }
};
function getConfig(name, asCopy) {
    if (asCopy === void 0) { asCopy = false; }
    if (asCopy) {
        // JSON serialize/deserialize is an easy way to copy rather than reference, but it will
        // omit undefined properties.
        return JSON.parse(JSON.stringify(config[name]));
    }
    return config[name];
}
exports.tests = {
    // "Templates Tests": {
    //   "Processed on Task Properties": (test: nodeunit.Test) => {
    //       test.ok(false);
    //       test.done();
    //   },
    //   "Processed on Task Options": (test: nodeunit.Test) => {
    //       test.ok(false);
    //       test.done();
    //   },
    //   "Processed on Target Properties": (test: nodeunit.Test) => {
    //       test.ok(false);
    //       test.done();
    //   },
    //   "Processed on Target Options": (test: nodeunit.Test) => {
    //       test.ok(false);
    //       test.done();
    //   }
    // },
    "Warnings and Errors Tests": {
        "Bad capitalization detected and fixed": function (test) {
            test.expect(2);
            var result = or.resolveAsync(null, getConfig("bad sourceMap capitalization")).then(function (result) {
                var allWarnings = result.warnings.join('\n');
                test.ok(allWarnings.indexOf('Property "sourcemap" in target "" options is incorrectly cased; it should be "sourceMap"') > -1);
                test.strictEqual(result.sourcemap, undefined);
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Option in wrong place detected": function (test) {
            test.expect(1);
            var result = or.resolveAsync(null, getConfig("sourceMap in wrong place")).then(function (result) {
                var allWarnings = result.warnings.join('\n');
                test.ok(allWarnings.indexOf('Property "sourceMap" in target "" is possibly in the wrong place and will be ignored.  It is expected on the options object.') > -1);
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Option in wrong place and wrong case detected": function (test) {
            test.expect(2);
            var result = or.resolveAsync(null, getConfig("bad sourceMap capitalization in wrong place")).then(function (result) {
                var allWarnings = result.warnings.join('\n');
                test.ok(allWarnings.indexOf('Property "sourcemap" in target "" is possibly in the wrong place and will be ignored.  It is expected on the options object.') > -1);
                test.ok(allWarnings.indexOf('It is also the wrong case and should be sourceMap') > -1);
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        }
    },
    "Special processing Tests": {
        "path with spaces gets enclosed in double-quotes": function (test) {
            test.expect(1);
            var result = utils.escapePathIfRequired("this is a path/path.txt");
            test.strictEqual(result, "\"this is a path/path.txt\"");
            test.done();
        },
        "path that is already enclosed in double-quotes is unchanged": function (test) {
            test.expect(1);
            var result = utils.escapePathIfRequired("\"this is a path/path.txt\"");
            test.strictEqual(result, "\"this is a path/path.txt\"");
            test.done();
        },
        "path without spaces is unchanged": function (test) {
            test.expect(1);
            var result = utils.escapePathIfRequired("thisIsAPath/path.txt");
            test.strictEqual(result, "thisIsAPath/path.txt");
            test.done();
        },
        "out with spaces gets escaped with double-quotes": function (test) {
            test.expect(1);
            var files = [getConfig("out has spaces")];
            var result = or.resolveAsync(null, getConfig("out has spaces"), null, files).then(function (result) {
                test.strictEqual(result.CompilationTasks[0].out, "\"my folder/out has spaces.js\"");
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "outDir with spaces gets escaped with double-quotes": function (test) {
            test.expect(1);
            var files = [getConfig("outDir has spaces")];
            var result = or.resolveAsync(null, getConfig("outDir has spaces"), null, files).then(function (result) {
                test.strictEqual(result.CompilationTasks[0].outDir, "\"./my folder\"");
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        }
    },
    "Precedence and defaults override Tests": {
        "The grunt-ts defaults come through when not specified": function (test) {
            test.expect(2);
            var result = or.resolveAsync(null, getConfig("minimalist")).then(function (result) {
                test.strictEqual(result.target, "es5");
                test.strictEqual(result.fast, "watch");
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Task properties should override grunt-ts defaults if not specified on the target": function (test) {
            test.expect(2);
            var result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("minimalist")).then(function (result) {
                test.strictEqual(getConfig("minimalist").outDir, undefined);
                test.strictEqual(result.reference, 'ref1.ts');
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Target name is set if specified": function (test) {
            test.expect(1);
            var result = or.resolveAsync(null, getConfig("minimalist"), "MyTarget").then(function (result) {
                test.strictEqual(result.targetName, "MyTarget");
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Target name is default if not specified": function (test) {
            test.expect(1);
            var result = or.resolveAsync(null, getConfig("minimalist")).then(function (result) {
                test.strictEqual(result.targetName, '');
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Task options should override grunt-ts defaults if not specified in the target options": function (test) {
            test.expect(2);
            var result = or.resolveAsync(getConfig("has ES6 and no sourceMap"), getConfig("minimalist")).then(function (result) {
                test.strictEqual(result.target, "es6");
                test.strictEqual(result.sourceMap, false);
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Properties specified on the target should override anything specified in the task and the grunt-ts defaults": function (test) {
            test.expect(1);
            var result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("reference set to ref2.ts")).then(function (result) {
                test.strictEqual(result.reference, "ref2.ts");
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Explicit null specified on the target should override anything specified in the task and the grunt-ts defaults": function (test) {
            test.expect(1);
            var result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("reference set to null")).then(function (result) {
                test.strictEqual(result.reference, null);
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Explicit undefined specified on the target should override anything specified in the task and the grunt-ts defaults": function (test) {
            test.expect(1);
            var files = [getConfig("has outDir set to undefined")];
            var result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("reference set to undefined")).then(function (result) {
                test.strictEqual(result.reference, undefined);
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Properties on target `options` should override the task options `options` object and the grunt-ts defaults": function (test) {
            test.expect(2);
            var result = or.resolveAsync(getConfig("has ES6 and no sourceMap"), getConfig("has ES3 and sourceMap")).then(function (result) {
                test.strictEqual(result.target, "es3");
                test.strictEqual(result.sourceMap, true);
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        }
    },
    "Visual Studio `vs` Integration Tests": {
        "Visual Studio properties should override the grunt-ts defaults ONLY": function (test) {
            test.expect(3);
            var cfg = getConfig("vs minimalist", true);
            cfg.options.sourceMap = false;
            var result = or.resolveAsync(null, cfg).then(function (result) {
                test.strictEqual(result.removeComments, false);
                test.strictEqual(result.sourceMap, false);
                test.strictEqual(result.module, 'commonjs');
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "If a particular grunt-ts setting is not specified in the gruntfile, and `ignoreSettings` is true, the grunt-ts defaults should be used for that setting": function (test) {
            test.expect(1);
            var result = or.resolveAsync(null, getConfig("vs ignoreSettings Release")).then(function (result) {
                test.strictEqual(result.sourceMap, true, 'Since this csproj file\'s Release config sets sourceMap as false, if the setting is ignored, the grunt-ts default of true should come through.');
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Any options specified on the target should override the Visual Studio settings": function (test) {
            test.expect(1);
            var cfg = getConfig("vs Release", true);
            cfg.outDir = "this is the test outDir";
            var result = or.resolveAsync(null, cfg).then(function (result) {
                test.strictEqual(result.CompilationTasks[0].outDir, "this is the test outDir");
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Any 'options' options specified on the target should override the Visual Studio settings": function (test) {
            test.expect(1);
            var cfg = getConfig("vs Release", true);
            cfg.options.removeComments = false;
            var result = or.resolveAsync(null, cfg).then(function (result) {
                test.strictEqual(result.removeComments, false);
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "out in Visual Studio settings is converted from relative to project to relative to gruntfile.": function (test) {
            test.expect(1);
            var result = or.resolveAsync(null, getConfig("vs TestOutFile")).then(function (result) {
                test.strictEqual(result.CompilationTasks[0].out, "test/vsproj/test_out.js");
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "outDir in Visual Studio settings is converted from relative to project to relative to gruntfile.": function (test) {
            test.expect(1);
            var result = or.resolveAsync(null, getConfig("vs minimalist")).then(function (result) {
                test.strictEqual(result.CompilationTasks[0].outDir, 'test/vsproj/vsproj_test');
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "paths to TypeScript files in Visual Studio project are converted from relative to project to relative to gruntfile.": function (test) {
            test.expect(1);
            var result = or.resolveAsync(null, getConfig("vs minimalist")).then(function (result) {
                test.strictEqual(result.CompilationTasks[0].src[0], 'test/vsproj/vsprojtest1.ts');
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        }
    },
    "tsconfig.json Integration Tests": {
        "Can get config from a valid file": function (test) {
            test.expect(1);
            var t = tsconfig.resolveAsync('./test/tsconfig/full_valid_tsconfig.json').then(function (result) {
                test.ok(true);
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
        "Exception from invalid file": function (test) {
            test.expect(1);
            var t = tsconfig.resolveAsync('./test/tsconfig/invalid_tsconfig.json').then(function (result) {
                test.ok(false, 'expected exception from invalid file.');
                test.done();
            }).catch(function (err) {
                test.ok(err.indexOf('Error parsing') > -1);
                test.done();
            });
        },
        "Exception from missing file": function (test) {
            test.expect(1);
            var t = tsconfig.resolveAsync('./test/tsconfig/does_not_exist_tsconfig.json').then(function (result) {
                test.ok(false, 'expected exception from missing file.');
                test.done();
            }).catch(function (err) {
                test.ok(err.indexOf('Could not find file') > -1);
                test.done();
            });
        },
        "config entries come through appropriately": function (test) {
            test.expect(9);
            var t = tsconfig.resolveAsync('./test/tsconfig/full_valid_tsconfig.json').then(function (result) {
                test.strictEqual(result.target, 'es5');
                test.strictEqual(result.module, 'commonjs');
                test.strictEqual(result.declaration, false);
                test.strictEqual(result.noImplicitAny, false);
                test.strictEqual(result.removeComments, false);
                test.strictEqual(result.preserveConstEnums, false);
                test.strictEqual(result.suppressImplicitAnyIndexErrors, true);
                test.strictEqual(result.sourceMap, true);
                test.strictEqual(result.emitDecoratorMetadata, undefined, 'emitDecoratorMetadata is not specified in this tsconfig.json');
                test.done();
            }).catch(function (err) { test.ifError(err); test.done(); });
        },
    }
};
//# sourceMappingURL=optionsResolverTests.js.map