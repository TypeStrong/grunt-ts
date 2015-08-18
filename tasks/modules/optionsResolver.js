/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>
var defaults_1 = require('./defaults');
var utils = require('./utils');
var _ = require('lodash');
var propertiesFromTarget = ['html', 'htmlOutDir', 'htmlOutDirFlatten', 'reference', 'testExecute', 'tsconfig',
    'templateCache', 'vs', 'watch'], propertiesFromTargetOptions = ['additionalFlags', 'comments', 'compile', 'compiler', 'declaration',
    'emitDecoratorMetadata', 'experimentalDecorators', 'failOnTypeErrors', 'fast', 'htmlModuleTemplate',
    'htmlVarTemplate', 'inlineSourceMap', 'inlineSources', 'isolatedModules', 'mapRoot', 'module', 'newLine', 'noEmit',
    'noEmitHelpers', 'noImplicitAny', 'noResolve', 'preserveConstEnums', 'removeComments', 'sourceRoot', 'sourceMap',
    'suppressImplicitAnyIndexErrors', 'target', 'verbose'];
function resolve(rawTaskOptions, rawTargetOptions, targetName, files) {
    if (targetName === void 0) { targetName = ''; }
    if (files === void 0) { files = []; }
    var result = applyGruntOptions(null, rawTaskOptions);
    result = applyGruntOptions(result, rawTargetOptions);
    result = copyCompilationTasks(result, files);
    result = applyGruntTSDefaults(result);
    if (result.options.targetName === undefined ||
        (!result.options.targetName && targetName)) {
        result.options.targetName = targetName;
    }
    return result;
}
exports.resolve = resolve;
function emptyOptionsResolveResult() {
    return {
        options: {},
        warnings: [],
        errors: []
    };
}
function applyGruntOptions(applyTo, gruntOptions) {
    var result = applyTo || emptyOptionsResolveResult();
    if (gruntOptions) {
        for (var _i = 0; _i < propertiesFromTarget.length; _i++) {
            var propertyName = propertiesFromTarget[_i];
            if (propertyName in gruntOptions) {
                result.options[propertyName] = gruntOptions[propertyName];
            }
        }
        if (gruntOptions.options) {
            for (var _a = 0; _a < propertiesFromTargetOptions.length; _a++) {
                var propertyName = propertiesFromTargetOptions[_a];
                if (propertyName in gruntOptions.options) {
                    result.options[propertyName] = gruntOptions.options[propertyName];
                }
            }
        }
    }
    return result;
}
function copyCompilationTasks(options, files) {
    var o = options.options;
    if (o.CompilationTasks === null || o.CompilationTasks === undefined) {
        o.CompilationTasks = [];
    }
    for (var i = 0; i < files.length; i += 1) {
        var compilationSet = {
            src: _.map(files[i].src, function (fileName) { return escapePathIfRequired(fileName); }),
            out: escapePathIfRequired(files[i].out),
            outDir: escapePathIfRequired(files[i].outDir)
        };
        if ('dest' in files[i]) {
            if (utils.isJavaScriptFile(files[i].dest)) {
                compilationSet.out = files[i].dest;
            }
            else {
                compilationSet.outDir = files[i].dest;
            }
        }
        o.CompilationTasks.push(compilationSet);
    }
    return options;
}
function applyGruntTSDefaults(options) {
    var o = options.options;
    if (!('sourceMap' in o) && !('inlineSourceMap' in o)) {
        o.sourceMap = defaults_1.GruntTSDefaults.sourceMap;
    }
    if (!('target' in o)) {
        o.target = defaults_1.GruntTSDefaults.target;
    }
    if (!('fast' in o)) {
        o.fast = 'watch';
    }
    if (!('compile' in o)) {
        o.compile = true;
    }
    if (!('htmlOutDir' in o)) {
        o.htmlOutDir = null;
    }
    if (!('htmlOutDirFlatten' in o)) {
        o.htmlOutDirFlatten = false;
    }
    if (!('htmlModuleTemplate' in o)) {
        o.htmlModuleTemplate = '<%= filename %>';
    }
    if (!('htmlVarTemplate' in o)) {
        o.htmlVarTemplate = '<%= ext %>';
    }
    return options;
}
function escapePathIfRequired(path) {
    if (!path || !path.indexOf) {
        return path;
    }
    if (path.indexOf(' ') === -1) {
        return path;
    }
    else {
        var newPath = path.trim();
        if (newPath.indexOf('"') === 0 && newPath.lastIndexOf('"') === newPath.length - 1) {
            return newPath;
        }
        else {
            return '"' + newPath + '"';
        }
    }
}
exports.escapePathIfRequired = escapePathIfRequired;
//# sourceMappingURL=optionsResolver.js.map