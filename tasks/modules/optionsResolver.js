'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var defaults_1 = require("./defaults");
var utils = require("./utils");
var _ = require("lodash");
var es6_promise_1 = require("es6-promise");
var visualStudioOptionsResolver_1 = require("./visualStudioOptionsResolver");
var tsconfig_1 = require("./tsconfig");
var propertiesFromTarget = ['amdloader', 'baseDir', 'html', 'htmlOutDir', 'htmlOutDirFlatten', 'reference', 'testExecute', 'tsconfig',
    'templateCache', 'vs', 'watch'], propertiesFromTargetOptions = ['additionalFlags',
    'allowJs',
    'allowSyntheticDefaultImports',
    'allowUnreachableCode',
    'allowUnusedLabels',
    'alwaysStrict',
    'baseUrl',
    'charset',
    'checkJs',
    'comments',
    'compile',
    'compiler',
    'declaration',
    'declarationDir',
    'diagnostics',
    'disableSizeLimit',
    'downlevelIteration',
    'emitBOM',
    'emitDecoratorMetadata',
    'emitGruntEvents',
    'experimentalAsyncFunctions',
    'experimentalDecorators',
    'failOnTypeErrors',
    'fast',
    'forceConsistentCasingInFileNames',
    'htmlModuleTemplate',
    'htmlOutDir',
    'htmlOutDirFlatten',
    'htmlOutputTemplate',
    'htmlVarTemplate',
    'importHelpers',
    'inlineSourceMap',
    'inlineSources',
    'isolatedModules',
    'jsx',
    'jsxFactory',
    'lib',
    'listEmittedFiles',
    'listFiles',
    'locale',
    'mapRoot',
    'maxNodeModuleJsDepth',
    'module',
    'moduleResolution',
    'newLine',
    'noEmit',
    'noEmitHelpers',
    'noEmitOnError',
    'noFallthroughCasesInSwitch',
    'noImplicitAny',
    'noImplicitReturns',
    'noImplicitThis',
    'noImplicitUseStrict',
    'noLib',
    'noResolve',
    'noStrictGenericChecks',
    'noUnusedLocals',
    'noUnusedParameters',
    'preserveConstEnums',
    'preserveSymlinks',
    'pretty',
    'reactNamespace',
    'removeComments',
    'rootDir',
    'skipDefaultLibCheck',
    'skipLibCheck',
    'sourceMap',
    'sourceRoot',
    'strict',
    'strictFunctionTypes',
    'strictNullChecks',
    'stripInternal',
    'suppressExcessPropertyErrors',
    'suppressImplicitAnyIndexErrors',
    'target',
    'traceResolution',
    'tsCacheDir',
    'types',
    'typeRoots',
    'verbose'], delayTemplateExpansion = ['htmlModuleTemplate', 'htmlVarTemplate', 'htmlOutputTemplate'];
var templateProcessor = null;
var globExpander = null;
var verboseLogger = null;
function noopTemplateProcessor(templateString, options) {
    return templateString;
}
function emptyGlobExpander(globs) {
    return [];
}
emptyGlobExpander.isStub = true;
function emptyVerboseLogger(logText) {
}
function resolveAsync(rawTaskOptions, rawTargetOptions, targetName, resolvedFiles, theTemplateProcessor, theGlobExpander, theVerboseLogger) {
    if (targetName === void 0) { targetName = ''; }
    if (resolvedFiles === void 0) { resolvedFiles = []; }
    if (theTemplateProcessor === void 0) { theTemplateProcessor = null; }
    if (theGlobExpander === void 0) { theGlobExpander = null; }
    if (theVerboseLogger === void 0) { theVerboseLogger = null; }
    var result = emptyOptionsResolveResult();
    return new es6_promise_1.Promise(function (resolve, reject) {
        if (theTemplateProcessor && typeof theTemplateProcessor === 'function') {
            templateProcessor = theTemplateProcessor;
        }
        else {
            templateProcessor = noopTemplateProcessor;
        }
        if (theGlobExpander && typeof theGlobExpander === 'function') {
            globExpander = theGlobExpander;
        }
        else {
            globExpander = emptyGlobExpander;
        }
        if (theVerboseLogger && typeof theVerboseLogger === 'function') {
            verboseLogger = theVerboseLogger;
        }
        else {
            verboseLogger = emptyVerboseLogger;
        }
        fixMissingOptions(rawTaskOptions);
        fixMissingOptions(rawTargetOptions);
        {
            var _a = resolveAndWarnOnConfigurationIssues(rawTaskOptions, rawTargetOptions, targetName), errors = _a.errors, warnings = _a.warnings;
            (_b = result.errors).push.apply(_b, errors);
            (_c = result.warnings).push.apply(_c, warnings);
        }
        result = applyGruntOptions(result, rawTaskOptions);
        result = applyGruntOptions(result, rawTargetOptions);
        result = copyCompilationTasks(result, resolvedFiles, resolveOutputOptions(rawTaskOptions, rawTargetOptions));
        visualStudioOptionsResolver_1.resolveVSOptionsAsync(result, rawTaskOptions, rawTargetOptions, templateProcessor).then(function (result) {
            tsconfig_1.resolveAsync(result, rawTaskOptions, rawTargetOptions, templateProcessor, globExpander, verboseLogger).then(function (result) {
                result = addressAssociatedOptionsAndResolveConflicts(result);
                result = enclosePathsInQuotesIfRequired(result);
                result = logAdditionalConfigurationWarnings(result);
                result = applyGruntTSDefaults(result);
                if (result.targetName === undefined ||
                    (!result.targetName && targetName)) {
                    result.targetName = targetName;
                }
                return resolve(result);
            }).catch(function (tsConfigError) {
                if (tsConfigError.message) {
                    result.errors.push('tsconfig error: ' + tsConfigError.message);
                }
                else {
                    result.errors.push('tsconfig error: ' + JSON.stringify(tsConfigError));
                }
                return resolve(result);
            });
        }).catch(function (vsConfigError) {
            if (vsConfigError.message) {
                result.errors.push('Visual Studio config issue: ' + vsConfigError.message);
            }
            else {
                result.errors.push('Visual Studio config issue: ' + JSON.stringify(vsConfigError));
            }
            return resolve(result);
        });
        var _b, _c;
    });
}
exports.resolveAsync = resolveAsync;
function resolveOutputOptions(rawTaskOptions, rawTargetOptions) {
    var result = {};
    var props = ['outDir', 'out'];
    var options = [rawTaskOptions, rawTargetOptions];
    options.forEach(function (opt) {
        props.forEach(function (prop) {
            if (opt && (prop in opt)) {
                result[prop] = opt[prop];
            }
        });
    });
    return result;
}
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
function logAdditionalConfigurationWarnings(options) {
    return options;
}
function resolveAndWarnOnConfigurationIssues(task, target, targetName) {
    var errors = [], warnings = [];
    var lowercaseTargetProps = _.map(propertiesFromTarget, function (prop) { return prop.toLocaleLowerCase(); });
    var lowercaseTargetOptionsProps = _.map(propertiesFromTargetOptions, function (prop) { return prop.toLocaleLowerCase(); });
    checkFixableCaseIssues(task, 'ts task');
    checkFixableCaseIssues(target, "target \"" + targetName + "\"");
    checkLocations(task, 'ts task');
    checkLocations(target, "target \"" + targetName + "\"");
    warnOnFilesUsedWithFast(task, 'ts task');
    warnOnFilesUsedWithFast(target, "target \"" + targetName + "\"");
    warnings.push.apply(warnings, getAdditionalWarnings(task, target, targetName));
    return { errors: errors, warnings: warnings };
    function getAdditionalWarnings(task, target, targetName) {
        var additionalWarnings = [];
        if (propertiesFromTarget.indexOf(targetName) >= 0) {
            additionalWarnings.push("Warning: Using the grunt-ts keyword \"" + targetName + "\" as a target name may cause " +
                "incorrect behavior or errors.");
        }
        if (((task && task.src && targetName !== 'src') || (target && target.src)) &&
            ((task && task.files) || (target && target.files))) {
            additionalWarnings.push("Warning: In task \"" + targetName + "\", either \"files\" or \"src\" should be used - not both.");
        }
        if (((task && task.vs) || (target && target.vs)) &&
            ((task && task.files) || (target && target.files))) {
            additionalWarnings.push("Warning: In task \"" + targetName + "\", either \"files\" or \"vs\" should be used - not both.");
        }
        if (usingDestArray(task) || usingDestArray(target)) {
            additionalWarnings.push("Warning: target \"" + targetName + "\" has an array specified for the files.dest property." +
                "  This is not supported.  Taking first element and ignoring the rest.");
        }
        if ((task && task.outFile) || (target && target.outFile)) {
            additionalWarnings.push("Warning: target \"" + targetName + "\" is using \"outFile\".  This is not supported by" +
                " grunt-ts via the Gruntfile - it's only relevant when present in tsconfig.json file.  Use \"out\" instead.");
        }
        return additionalWarnings;
        function usingDestArray(task) {
            var result = false;
            if (task && task.files && _.isArray(task.files)) {
                task.files.forEach(function (item) {
                    if (_.isArray(item.dest)) {
                        result = true;
                    }
                    ;
                });
            }
            return result;
        }
    }
    function warnOnFilesUsedWithFast(task, configName) {
        if (task && task.files && task.options && task.options.fast) {
            warnings.push("Warning: " + configName + " is attempting to use fast compilation with \"files\".  " +
                "This is not currently supported.  Setting \"fast\" to \"never\".");
            task.options.fast = 'never';
        }
    }
    function checkLocations(task, configName) {
        if (task) {
            for (var propertyName in task) {
                if (propertiesFromTarget.indexOf(propertyName) === -1 && propertyName !== 'options') {
                    if (propertiesFromTargetOptions.indexOf(propertyName) > -1 &&
                        !_.isPlainObject(task[propertyName])) {
                        var warningText = "Property \"" + propertyName + "\" in " + configName + " is possibly in the wrong place and will be ignored.  " +
                            "It is expected on the options object.";
                        warnings.push(warningText);
                    }
                    else if (lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase()) === -1 &&
                        lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase()) > -1 &&
                        !_.isPlainObject(task[propertyName])) {
                        var index = lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase());
                        var correctPropertyName = propertiesFromTargetOptions[index];
                        var warningText = "Property \"" + propertyName + "\" in " + configName + " is possibly in the wrong place and will be ignored.  " +
                            ("It is expected on the options object.  It is also the wrong case and should be " + correctPropertyName + ".");
                        warnings.push(warningText);
                    }
                }
            }
            if (task.options) {
                for (var propertyName in task.options) {
                    if (propertiesFromTargetOptions.indexOf(propertyName) === -1) {
                        if (propertiesFromTarget.indexOf(propertyName) > -1) {
                            var warningText = "Property \"" + propertyName + "\" in " + configName + " is possibly in the wrong place and will be ignored.  " +
                                "It is expected on the task or target, not under options.";
                            warnings.push(warningText);
                        }
                        else if (lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase()) === -1
                            && lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase()) > -1) {
                            var index = lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase());
                            var correctPropertyName = propertiesFromTarget[index];
                            var warningText = "Property \"" + propertyName + "\" in " + configName + " is possibly in the wrong place and will be ignored.  " +
                                ("It is expected on the task or target, not under options.  It is also the wrong case and should be " + correctPropertyName + ".");
                            warnings.push(warningText);
                        }
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
                    var warningText = "Property \"" + propertyName + "\" in " + configName + " is incorrectly cased; it should " +
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
                    var warningText = "Property \"" + propertyName + "\" in " + configName + " options is incorrectly cased; it should " +
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
        for (var _i = 0, propertiesFromTarget_1 = propertiesFromTarget; _i < propertiesFromTarget_1.length; _i++) {
            var propertyName = propertiesFromTarget_1[_i];
            if (propertyName in gruntOptions && propertyName !== 'vs') {
                if (typeof gruntOptions[propertyName] === 'string' && utils.hasValue(gruntOptions[propertyName]) &&
                    delayTemplateExpansion.indexOf(propertyName) === -1) {
                    applyTo[propertyName] = templateProcessor(gruntOptions[propertyName], {});
                }
                else {
                    applyTo[propertyName] = gruntOptions[propertyName];
                }
            }
        }
        if (gruntOptions.options) {
            for (var _a = 0, propertiesFromTargetOptions_1 = propertiesFromTargetOptions; _a < propertiesFromTargetOptions_1.length; _a++) {
                var propertyName = propertiesFromTargetOptions_1[_a];
                if (propertyName in gruntOptions.options) {
                    if (typeof gruntOptions.options[propertyName] === 'string' && utils.hasValue(gruntOptions.options[propertyName]) &&
                        delayTemplateExpansion.indexOf(propertyName) === -1) {
                        applyTo[propertyName] = templateProcessor(gruntOptions.options[propertyName], {});
                    }
                    else {
                        applyTo[propertyName] = gruntOptions.options[propertyName];
                    }
                }
            }
        }
    }
    return applyTo;
}
function copyCompilationTasks(options, resolvedFiles, outputInfo) {
    if (!utils.hasValue(options.CompilationTasks)) {
        options.CompilationTasks = [];
    }
    if (!utils.hasValue(resolvedFiles) || resolvedFiles.length === 0) {
        if (options.CompilationTasks.length === 0 && (('outDir' in outputInfo) || ('out' in outputInfo))) {
            var newCompilationTask = {
                src: []
            };
            if ('outDir' in outputInfo) {
                newCompilationTask.outDir = outputInfo.outDir;
            }
            if ('out' in outputInfo) {
                newCompilationTask.outDir = outputInfo.outDir;
            }
            options.CompilationTasks.push(newCompilationTask);
        }
        return options;
    }
    for (var i = 0; i < resolvedFiles.length; i += 1) {
        var glob = void 0;
        var orig = resolvedFiles[i].orig;
        if (orig && ('src' in orig)) {
            glob = [].concat(orig.src);
        }
        var compilationSet = {
            src: _.map(resolvedFiles[i].src, function (fileName) { return utils.enclosePathInQuotesIfRequired(fileName); }),
            out: utils.enclosePathInQuotesIfRequired(resolvedFiles[i].out),
            outDir: utils.enclosePathInQuotesIfRequired(resolvedFiles[i].outDir),
            glob: glob
        };
        if ('dest' in resolvedFiles[i] && resolvedFiles[i].dest) {
            var dest = void 0;
            if (_.isArray(resolvedFiles[i].dest)) {
                dest = resolvedFiles[i].dest[0];
            }
            else {
                dest = resolvedFiles[i].dest;
            }
            if (utils.isJavaScriptFile(dest)) {
                compilationSet.out = dest;
            }
            else {
                compilationSet.outDir = dest;
            }
        }
        options.CompilationTasks.push(compilationSet);
    }
    return options;
}
function enclosePathsInQuotesIfRequired(options) {
    if (options.rootDir) {
        options.rootDir = utils.enclosePathInQuotesIfRequired(options.rootDir);
    }
    if (options.mapRoot) {
        options.mapRoot = utils.enclosePathInQuotesIfRequired(options.mapRoot);
    }
    if (options.sourceRoot) {
        options.sourceRoot = utils.enclosePathInQuotesIfRequired(options.sourceRoot);
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
    if (options.inlineSources && !options.sourceMap) {
        options.inlineSources = true;
        options.inlineSourceMap = true;
        options.sourceMap = false;
    }
    if ('comments' in options && 'removeComments' in options) {
        options.warnings.push("WARNING: Option \"comments\" and \"removeComments\" should not be used together.  " +
            ("The --removeComments value of " + !!options.removeComments + " supercedes the --comments value of " + !!options.comments));
    }
    if ('comments' in options && !('removeComments' in options)) {
        options.comments = !!options.comments;
        options.removeComments = !options.comments;
    }
    else if (!('comments' in options) && ('removeComments' in options)) {
        options.removeComments = !!options.removeComments;
        options.comments = !options.removeComments;
    }
    if ('html' in options &&
        (options.CompilationTasks.length === 0 ||
            !_.some(options.CompilationTasks, function (item) { return ((item.src || []).length > 0 || (item.glob || []).length > 0); }))) {
        options.errors.push("ERROR: option \"html\" provided without corresponding TypeScript source files or glob to " +
            "compile.  The transform will not occur unless grunt-ts also expects to compile some files.");
    }
    options.CompilationTasks.forEach(function (compileTask) {
        if (compileTask.out && compileTask.outDir) {
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
    if (!('failOnTypeErrors' in options)) {
        options.failOnTypeErrors = defaults_1.GruntTSDefaults.failOnTypeErrors;
    }
    if (!('emitGruntEvents' in options)) {
        options.emitGruntEvents = defaults_1.GruntTSDefaults.emitGruntEvents;
    }
    if (!('tsCacheDir' in options)) {
        options.tsCacheDir = defaults_1.GruntTSDefaults.tsCacheDir;
    }
    return options;
}
//# sourceMappingURL=optionsResolver.js.map