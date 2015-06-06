/// <reference path="../defs/tsd.d.ts"/>
/// <reference path="../tasks/modules/interfaces.d.ts"/>
/// <reference path="../defs/csproj2ts/csproj2ts.d.ts" />
exports.decoratorMetadataPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.emitDecoratorMetadata === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected emitDecoratorMetadata === true";
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
        if (options.task.inlineSources === true && options.task.sourceMap === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected inlineSourcesPassed and sourceMap true";
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
        throw "expected inlineSourcesPassed and sourceMap false.  Was " +
            JSON.stringify([options.task.inlineSources, options.task.sourceMap]);
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
//# sourceMappingURL=commandLineAssertions.js.map