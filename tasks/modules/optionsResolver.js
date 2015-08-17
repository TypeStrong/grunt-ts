/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>
var defaults_1 = require('./defaults');
var propertiesOnTarget = ['files', 'html', 'out', 'outDir', 'reference', 'src', 'testExecute', 'tsconfig', 'templateCache',
    'vs', 'watch'], propertiesOnTargetOptions = ['additionalFlags', 'comments', 'compile', 'compiler', 'declaration',
    'emitDecoratorMetadata', 'experimentalDecorators', 'failOnTypeErrors', 'fast', 'htmlModuleTemplate',
    'htmlVarTemplate', 'inlineSourceMap', 'inlineSources', 'isolatedModules', 'mapRoot', 'module', 'newLine', 'noEmit',
    'noEmitHelpers', 'noImplicitAny', 'noResolve', 'preserveConstEnums', 'removeComments', 'sourceRoot', 'sourceMap',
    'suppressImplicitAnyIndexErrors', 'target', 'verbose'];
function resolve(rawTaskOptions, rawTargetOptions, targetName) {
    if (targetName === void 0) { targetName = ''; }
    var result = applyGruntOptions(null, rawTaskOptions);
    result = applyGruntOptions(result, rawTargetOptions);
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
        for (var _i = 0; _i < propertiesOnTarget.length; _i++) {
            var propertyName = propertiesOnTarget[_i];
            if (propertyName in gruntOptions) {
                result.options[propertyName] = gruntOptions[propertyName];
            }
        }
        if (gruntOptions.options) {
            for (var _a = 0; _a < propertiesOnTargetOptions.length; _a++) {
                var propertyName = propertiesOnTargetOptions[_a];
                if (propertyName in gruntOptions.options) {
                    result.options[propertyName] = gruntOptions.options[propertyName];
                }
            }
        }
    }
    return result;
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
    return options;
}
//# sourceMappingURL=optionsResolver.js.map