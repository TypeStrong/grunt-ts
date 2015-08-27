/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>
'use strict';
var defaults_1 = require('./defaults');
var utils = require('./utils');
var _ = require('lodash');
var es6_promise_1 = require('es6-promise');
var visualStudioOptionsResolver_1 = require('./visualStudioOptionsResolver');
var tsconfig_1 = require('./tsconfig');
var propertiesFromTarget = ['amdloader', 'html', 'htmlOutDir', 'htmlOutDirFlatten', 'reference', 'testExecute', 'tsconfig',
    'templateCache', 'vs', 'watch'], propertiesFromTargetOptions = ['additionalFlags', 'comments', 'compile', 'compiler', 'declaration',
    'emitDecoratorMetadata', 'experimentalDecorators', 'failOnTypeErrors', 'fast', 'htmlModuleTemplate',
    'htmlVarTemplate', 'inlineSourceMap', 'inlineSources', 'isolatedModules', 'mapRoot', 'module', 'newLine', 'noEmit',
    'noEmitHelpers', 'noEmitOnError', 'noImplicitAny', 'noResolve', 'preserveConstEnums', 'removeComments', 'sourceRoot',
    'sourceMap', 'suppressImplicitAnyIndexErrors', 'target', 'verbose'];
function resolveAsync(rawTaskOptions, rawTargetOptions, targetName, files) {
    if (targetName === void 0) { targetName = ''; }
    if (files === void 0) { files = []; }
    return new es6_promise_1.Promise(function (resolve, reject) {
        fixMissingOptions(rawTaskOptions);
        fixMissingOptions(rawTargetOptions);
        var _a = resolveAndWarnOnCapitalizationErrors(rawTaskOptions, rawTargetOptions, targetName), errors = _a.errors, warnings = _a.warnings;
        var result = emptyOptionsResolveResult();
        (_b = result.errors).push.apply(_b, errors);
        (_c = result.warnings).push.apply(_c, warnings);
        result = applyGruntOptions(result, rawTaskOptions);
        result = applyGruntOptions(result, rawTargetOptions);
        result = copyCompilationTasks(result, files);
        visualStudioOptionsResolver_1.resolveVSOptionsAsync(result, rawTaskOptions, rawTargetOptions).then(function (result) {
            tsconfig_1.resolveAsync(result, rawTaskOptions, rawTargetOptions).then(function (result) {
                result = addressAssociatedOptionsAndResolveConflicts(result);
                result = applyGruntTSDefaults(result);
                if (result.targetName === undefined ||
                    (!result.targetName && targetName)) {
                    result.targetName = targetName;
                }
                resolve(result);
                return;
            }).catch(function (error) {
                reject(error);
                return;
            });
        }).catch(function (error) {
            reject(error);
            return;
        });
        var _b, _c;
    });
}
exports.resolveAsync = resolveAsync;
function fixMissingOptions(config) {
    if (config && !config.options) {
        config.options = {};
    }
}
function emptyOptionsResolveResult() {
    return {
        warnings: [],
        errors: []
    };
}
function resolveAndWarnOnCapitalizationErrors(task, target, targetName) {
    var errors = [], warnings = [];
    var lowercaseTargetProps = _.map(propertiesFromTarget, function (prop) { return prop.toLocaleLowerCase(); });
    var lowercaseTargetOptionsProps = _.map(propertiesFromTargetOptions, function (prop) { return prop.toLocaleLowerCase(); });
    checkFixableCaseIssues(task, 'ts task');
    checkFixableCaseIssues(target, "target \"" + targetName + "\"");
    checkLocations(task, 'ts task');
    checkLocations(target, "target \"" + targetName + "\"");
    return { errors: errors, warnings: warnings };
    function checkLocations(task, configName) {
        if (task) {
            for (var propertyName in task) {
                if (propertiesFromTarget.indexOf(propertyName) === -1 && propertyName !== 'options') {
                    if (propertiesFromTargetOptions.indexOf(propertyName) > -1) {
                        var warningText = ("Property \"" + propertyName + "\" in " + configName + " is possibly in the wrong place and will be ignored.  ") +
                            "It is expected on the options object.";
                        warnings.push(warningText);
                    }
                    else if (lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase()) === -1
                        && lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase()) > -1) {
                        var index = lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase());
                        var correctPropertyName = propertiesFromTargetOptions[index];
                        var warningText = ("Property \"" + propertyName + "\" in " + configName + " is possibly in the wrong place and will be ignored.  ") +
                            ("It is expected on the options object.  It is also the wrong case and should be " + correctPropertyName + ".");
                        warnings.push(warningText);
                    }
                }
            }
        }
    }
    function checkFixableCaseIssues(task, configName) {
        if (task) {
            for (var propertyName in task) {
                if ((propertiesFromTarget.indexOf(propertyName) === -1)
                    && (lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase()) > -1)
                    && (propertiesFromTargetOptions.indexOf(propertyName) === -1)) {
                    var index = lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase());
                    var correctPropertyName = propertiesFromTarget[index];
                    var warningText = ("Property \"" + propertyName + "\" in " + configName + " is incorrectly cased; it should ") +
                        ("be \"" + correctPropertyName + "\".  Fixing it for you and proceeding.");
                    warnings.push(warningText);
                    task[correctPropertyName] = task[propertyName];
                    delete task[propertyName];
                }
            }
            for (var propertyName in task.options) {
                if ((propertiesFromTargetOptions.indexOf(propertyName) === -1)
                    && (lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase()) > -1)
                    && (propertiesFromTarget.indexOf(propertyName) === -1)) {
                    var index = lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase());
                    var correctPropertyName = propertiesFromTargetOptions[index];
                    var warningText = ("Property \"" + propertyName + "\" in " + configName + " options is incorrectly cased; it should ") +
                        ("be \"" + correctPropertyName + "\".  Fixing it for you and proceeding.");
                    warnings.push(warningText);
                    task.options[correctPropertyName] = task.options[propertyName];
                    delete task.options[propertyName];
                }
            }
        }
    }
}
function applyGruntOptions(applyTo, gruntOptions) {
    if (gruntOptions) {
        for (var _i = 0; _i < propertiesFromTarget.length; _i++) {
            var propertyName = propertiesFromTarget[_i];
            if (propertyName in gruntOptions && propertyName !== 'vs') {
                applyTo[propertyName] = gruntOptions[propertyName];
            }
        }
        if (gruntOptions.options) {
            for (var _a = 0; _a < propertiesFromTargetOptions.length; _a++) {
                var propertyName = propertiesFromTargetOptions[_a];
                if (propertyName in gruntOptions.options) {
                    applyTo[propertyName] = gruntOptions.options[propertyName];
                }
            }
        }
    }
    return applyTo;
}
function copyCompilationTasks(options, files) {
    if (options.CompilationTasks === null || options.CompilationTasks === undefined) {
        options.CompilationTasks = [];
    }
    for (var i = 0; i < files.length; i += 1) {
        var compilationSet = {
            src: _.map(files[i].src, function (fileName) { return utils.escapePathIfRequired(fileName); }),
            out: utils.escapePathIfRequired(files[i].out),
            outDir: utils.escapePathIfRequired(files[i].outDir)
        };
        if ('dest' in files[i]) {
            if (utils.isJavaScriptFile(files[i].dest)) {
                compilationSet.out = files[i].dest;
            }
            else {
                compilationSet.outDir = files[i].dest;
            }
        }
        options.CompilationTasks.push(compilationSet);
    }
    return options;
}
function addressAssociatedOptionsAndResolveConflicts(options) {
    if (options.emitDecoratorMetadata) {
        options.experimentalDecorators = true;
    }
    if (options.inlineSourceMap && options.sourceMap) {
        options.warnings.push('TypeScript cannot use inlineSourceMap and sourceMap together.  Ignoring sourceMap.');
        options.sourceMap = false;
    }
    if (options.inlineSources && options.sourceMap) {
        options.errors.push('It is not permitted to use inlineSources and sourceMap together.  Use one or the other.');
    }
    if (options.inlineSources && !options.sourceMap) {
        options.inlineSources = true;
        options.inlineSourceMap = true;
        options.sourceMap = false;
    }
    if ('comments' in options && !('removeComments' in options)) {
        options.comments = !!options.comments;
        options.removeComments = !options.comments;
    }
    else if (!('comments' in options) && ('removeComments' in options)) {
        options.removeComments = !!options.removeComments;
        options.comments = !options.removeComments;
    }
    options.CompilationTasks.forEach(function (compileTask) {
        if (compileTask.out && compileTask.outDir) {
            console.log(JSON.stringify(compileTask));
            options.warnings.push('The parameter `out` is incompatible with `outDir`; pass one or the other - not both.  Ignoring `out` and using `outDir`.');
            compileTask.out = '';
        }
    });
    return options;
}
function applyGruntTSDefaults(options) {
    if (!('sourceMap' in options) && !('inlineSourceMap' in options)) {
        options.sourceMap = defaults_1.GruntTSDefaults.sourceMap;
    }
    if (!('target' in options)) {
        options.target = defaults_1.GruntTSDefaults.target;
    }
    if (!('fast' in options)) {
        options.fast = defaults_1.GruntTSDefaults.fast;
    }
    if (!('compile' in options)) {
        options.compile = defaults_1.GruntTSDefaults.compile;
    }
    if (!('htmlOutDir' in options)) {
        options.htmlOutDir = null;
    }
    if (!('htmlOutDirFlatten' in options)) {
        options.htmlOutDirFlatten = defaults_1.GruntTSDefaults.htmlOutDirFlatten;
    }
    if (!('htmlModuleTemplate' in options)) {
        options.htmlModuleTemplate = defaults_1.GruntTSDefaults.htmlModuleTemplate;
    }
    if (!('htmlVarTemplate' in options)) {
        options.htmlVarTemplate = defaults_1.GruntTSDefaults.htmlVarTemplate;
    }
    if (!('removeComments' in options) && !('comments' in options)) {
        options.removeComments = defaults_1.GruntTSDefaults.removeComments;
    }
    return options;
}
//# sourceMappingURL=optionsResolver.js.map