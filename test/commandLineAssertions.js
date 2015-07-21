/// <reference path="../defs/tsd.d.ts"/>
/// <reference path="../tasks/modules/interfaces.d.ts"/>
/// <reference path="../defs/csproj2ts/csproj2ts.d.ts" />
exports.decoratorMetadataPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.emitDecoratorMetadata === true &&
            options.task.experimentalDecorators === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected emitDecoratorMetadata === true and experimentalDecorators === true";
    });
};
exports.decoratorMetadataNotPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.emitDecoratorMetadata === false) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected emitDecoratorMetadata === false";
    });
};
exports.experimentalDecoratorsPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.experimentalDecorators === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected experimentalDecorators === true";
    });
};
exports.noEmitPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.noEmit === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected noEmit === true";
    });
};
exports.noEmitNotPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.noEmit === false) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected noEmit === false";
    });
};
exports.inlineSourcesPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.inlineSources === true &&
            options.task.sourceMap === false &&
            options.task.inlineSourceMap === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        var result = JSON.stringify({
            inlineSources: options.task.inlineSources,
            sourceMap: options.task.inlineSources,
            inlineSourceMap: options.task.inlineSourceMap
        });
        throw "expected inlineSources and inlineSourceMap, but not sourceMap.  Got " + result;
    });
};
exports.inlineSourceMapPassedWithSourceMap = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.inlineSources === false &&
            options.task.sourceMap === false &&
            options.task.inlineSourceMap === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        var result = JSON.stringify({
            inlineSources: options.task.inlineSources,
            sourceMap: options.task.inlineSources,
            inlineSourceMap: options.task.inlineSourceMap
        });
        throw "expected inlineSourceMap only.  Got " + result;
    });
};
exports.inlineSourcesNotPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.inlineSources === false && options.task.sourceMap === false) {
            resolve({
                code: 0,
                output: ""
            });
        }
        var result = JSON.stringify({
            inlineSources: options.task.inlineSources,
            sourceMap: options.task.inlineSources,
            inlineSourceMap: options.task.inlineSourceMap
        });
        throw "expected inlineSourcesPassed and sourceMap false.  Got " + result;
    });
};
exports.vsproj_test = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.sourceMap === true &&
            options.task.removeComments === false &&
            options.task.module === 'commonjs' &&
            options.target.outDir.indexOf('vsproj_test') >= 0) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected sourceMap === true, removeComments===" +
            "false, module===commonjs, outDir===vsproj_test.  Was " +
            JSON.stringify([options.task.sourceMap,
                options.task.removeComments, options.task.module, options.target.outDir]);
    });
};
exports.vsproj_test_config = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.sourceMap === false &&
            options.task.removeComments === true &&
            options.target.outDir.indexOf('vsproj_test_config') >= 0) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected sourceMap === false, removeComments===" +
            "true, outDir contains vsproj_test_config.  Was " +
            JSON.stringify([options.task.sourceMap,
                options.task.removeComments, options.target.outDir]);
    });
};
exports.param_newLine_CRLF = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.newLine === "CRLF") {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected newLine=CRLF.  Was " +
            JSON.stringify([options.task.newLine]);
    });
};
exports.param_newLine_LF = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.newLine === "LF") {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected newLine=LF.  Was " +
            JSON.stringify([options.task.newLine]);
    });
};
exports.files_testFilesUsedWithDestAsAFolder = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.target.outDir === "test/multifile/files_testFilesUsedWithDestAsAJSFolder" &&
            options.target.out || "not specified" === "not specified") {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected --out not specified and outDir=test/multifile/files_testFilesUsedWithDestAsAJSFolder.  Was " +
            JSON.stringify([options.target.outDir]);
    });
};
exports.files_testFilesUsedWithDestAsAFile = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.target.out === "test/multifile/files_testFilesUsedWithDestAsAJSFile/testDest.js" &&
            options.target.outDir || "not specified" === "not specified") {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected --outDir not specified and out=test/multifile/files_testFilesUsedWithDestAsAJSFile/testDest.js.  Was " +
            JSON.stringify([options.target.outDir]);
    });
};
exports.test_systemJS = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.module === "system") {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected system.  Was " +
            JSON.stringify([options.task.module]);
    });
};
exports.test_umd = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.module === "umd") {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected umd.  Was " +
            JSON.stringify([options.task.module]);
    });
};
exports.test_isolatedModules = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.isolatedModules === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected --isolatedModules.  Got " + JSON.stringify(options);
    });
};
exports.test_noEmitHelpers = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.noEmitHelpers === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected --noEmitHelpers.  Got " + JSON.stringify(options);
    });
};
exports.test_additionalFlags = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.additionalFlags === '--version') {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected --version.  Got " + JSON.stringify(options);
    });
};
//# sourceMappingURL=commandLineAssertions.js.map