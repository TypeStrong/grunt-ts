/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>
'use strict';
var defaults_1 = require('./defaults');
var path = require('path');
var utils = require('./utils');
var _ = require('lodash');
var csproj2ts = require('csproj2ts');
var es6_promise_1 = require('es6-promise');
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
        var _a = resolveAndWarnOnCapitalizationErrors(rawTaskOptions, rawTargetOptions, targetName), errors = _a.errors, warnings = _a.warnings;
        var result = emptyOptionsResolveResult();
        (_b = result.errors).push.apply(_b, errors);
        (_c = result.warnings).push.apply(_c, warnings);
        result = applyGruntOptions(result, rawTaskOptions);
        result = applyGruntOptions(result, rawTargetOptions);
        result = copyCompilationTasks(result, files);
        resolveVSOptionsAsync(result, rawTaskOptions, rawTargetOptions).then(function (result) {
            // apply `tsconfig` configuration here
            result = applyAssociatedOptionsAndResolveConflicts(result);
            result = applyGruntTSDefaults(result);
            if (result.targetName === undefined ||
                (!result.targetName && targetName)) {
                result.targetName = targetName;
            }
            resolve(result);
        }).catch(function (error) {
            reject(error);
        });
        var _b, _c;
    });
}
exports.resolveAsync = resolveAsync;
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
function resolveVSOptionsAsync(applyTo, taskOptions, targetOptions) {
    return new es6_promise_1.Promise(function (resolve, reject) {
        {
            var vsTask = getVSSettings(taskOptions), vsTarget = getVSSettings(targetOptions);
            var vs = null;
            if (vsTask) {
                vs = vsTask;
            }
            if (vsTarget) {
                if (!vs) {
                    vs = vsTarget;
                }
                if (vsTarget.project) {
                    vs.project = vsTarget.project;
                }
                if (vsTarget.config) {
                    vs.config = vsTarget.config;
                }
                if (vsTarget.ignoreFiles) {
                    vs.ignoreFiles = vsTarget.ignoreFiles;
                }
                if (vsTarget.ignoreSettings) {
                    vs.ignoreSettings = vsTarget.ignoreSettings;
                }
            }
            if (vs) {
                applyTo.vs = vs;
            }
        }
        if (applyTo.vs) {
            csproj2ts.getTypeScriptSettings({
                ProjectFileName: applyTo.vs.project,
                ActiveConfiguration: applyTo.vs.config || undefined
            }).then(function (vsConfig) {
                debugger;
                applyTo = applyVSOptions(applyTo, vsConfig);
                resolve(applyTo);
                return;
            }).catch(function (error) {
                debugger;
                if (error.errno === 34) {
                    applyTo.errors.push('In target "' + applyTo.targetName + '" - could not find VS project at "' + error.path + '".');
                }
                else {
                    applyTo.errors.push('In target "' + applyTo.targetName + '".  Error #' + error.errno + '.  ' + error);
                }
                reject(error);
                return;
            });
            return;
        }
        resolve(applyTo);
    });
}
function applyVSOptions(options, vsSettings) {
    var ignoreFiles = false, ignoreSettings = false;
    if (typeof options.vs !== 'string') {
        var vsOptions = options.vs;
        ignoreFiles = !!vsOptions.ignoreFiles;
        ignoreSettings = !!vsOptions.ignoreSettings;
    }
    if (!ignoreFiles) {
        if (options.CompilationTasks.length === 0) {
            options.CompilationTasks.push({ src: [] });
        }
        var src = options.CompilationTasks[0].src;
        var absolutePathToVSProjectFolder = path.resolve(vsSettings.VSProjectDetails.ProjectFileName, '..');
        _.map(_.uniq(vsSettings.files), function (file) {
            var absolutePathToFile = path.normalize(path.join(absolutePathToVSProjectFolder, file));
            var relativePathToFile = path.relative(path.resolve('.'), absolutePathToFile).replace(new RegExp('\\' + path.sep, 'g'), '/');
            if (src.indexOf(absolutePathToFile) === -1 &&
                src.indexOf(relativePathToFile) === -1) {
                src.push(relativePathToFile);
            }
        });
    }
    if (!ignoreSettings) {
        options = applyVSSettings(options, vsSettings);
    }
    return options;
}
function applyVSSettings(options, vsSettings) {
    // TODO: support TypeScript 1.5 VS options.
    var simpleVSSettingsToGruntTSMappings = {
        'GeneratesDeclarations': 'declaration',
        'NoEmitOnError': 'noEmitOnError',
        'MapRoot': 'mapRoot',
        'NoImplicitAny': 'noImplicitAny',
        'NoResolve': 'noResolve',
        'PreserveConstEnums': 'preserveConstEnums',
        'RemoveComments': 'removeComments',
        'SourceMap': 'sourceMap',
        'SourceRoot': 'sourceRoot',
        'SuppressImplicitAnyIndexErrors': 'suppressImplicitAnyIndexErrors',
        'Target': 'target'
    };
    for (var item in simpleVSSettingsToGruntTSMappings) {
        if (!(simpleVSSettingsToGruntTSMappings[item] in options) && utils.hasValue(vsSettings[item])) {
            options[simpleVSSettingsToGruntTSMappings[item]] = vsSettings[item];
        }
    }
    if (!('module' in options) && utils.hasValue(vsSettings.ModuleKind)) {
        options.module = vsSettings.ModuleKind;
        if (options.module === 'none') {
            options.module = undefined;
        }
    }
    if (utils.hasValue(vsSettings.OutDir)) {
        options.CompilationTasks.forEach(function (item) {
            item.outDir = vsSettings.OutDir;
        });
    }
    if (utils.hasValue(vsSettings.OutFile)) {
        options.CompilationTasks.forEach(function (item) {
            item.out = vsSettings.OutFile;
        });
    }
    return options;
}
function copyCompilationTasks(options, files) {
    if (options.CompilationTasks === null || options.CompilationTasks === undefined) {
        options.CompilationTasks = [];
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
        options.CompilationTasks.push(compilationSet);
    }
    return options;
}
function applyAssociatedOptionsAndResolveConflicts(options) {
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
function getVSSettings(rawTargetOptions) {
    var vs = null;
    if (rawTargetOptions && rawTargetOptions.vs) {
        var targetvs = rawTargetOptions.vs;
        if (typeof targetvs === 'string') {
            vs = {
                project: targetvs,
                config: '',
                ignoreFiles: false,
                ignoreSettings: false
            };
        }
        else {
            vs = {
                project: targetvs.project || '',
                config: targetvs.config || '',
                ignoreFiles: targetvs.ignoreFiles || false,
                ignoreSettings: targetvs.ignoreSettings || false
            };
        }
    }
    return vs;
}
//# sourceMappingURL=optionsResolver.js.map