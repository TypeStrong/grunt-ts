'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var csproj2ts = require("csproj2ts");
var path = require("path");
var utils = require("./utils");
var es6_promise_1 = require("es6-promise");
var _ = require("lodash");
var templateProcessor = null;
function resolveVSOptionsAsync(applyTo, taskOptions, targetOptions, theTemplateProcessor) {
    templateProcessor = theTemplateProcessor;
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
                if (typeof applyTo.vs.project === 'string') {
                    applyTo.vs.project = templateProcessor(applyTo.vs.project, {});
                }
                if (typeof applyTo.vs.config === 'string') {
                    applyTo.vs.config = templateProcessor(applyTo.vs.config, {});
                }
            }
        }
        if (applyTo.vs) {
            return csproj2ts.getTypeScriptSettings({
                ProjectFileName: applyTo.vs.project,
                ActiveConfiguration: applyTo.vs.config || undefined
            }).then(function (vsConfig) {
                try {
                    applyTo = applyVSOptions(applyTo, vsConfig);
                    applyTo = resolve_out_and_outDir(applyTo, taskOptions, targetOptions);
                    return resolve(applyTo);
                }
                catch (ex) {
                    return reject(ex);
                }
            }).catch(function (error) {
                if (error.errno === 34) {
                    applyTo.errors.push('In target "' + applyTo.targetName + '" - could not find VS project at "' + error.path + '".');
                }
                else {
                    applyTo.errors.push('In target "' + applyTo.targetName + '".  Error #' + error.errno + '.  ' + error);
                }
                return reject(error);
            });
        }
        return resolve(applyTo);
    });
}
exports.resolveVSOptionsAsync = resolveVSOptionsAsync;
function resolve_out_and_outDir(options, taskOptions, targetOptions) {
    if (options.CompilationTasks && options.CompilationTasks.length > 0) {
        options.CompilationTasks.forEach(function (compilationTask) {
            [taskOptions, targetOptions].forEach(function (optionSet) {
                if (optionSet && optionSet.out) {
                    compilationTask.out = optionSet.out;
                }
                if (optionSet && optionSet.outDir) {
                    compilationTask.outDir = optionSet.outDir;
                }
            });
        });
    }
    return options;
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
        var src_1 = options.CompilationTasks[0].src;
        var absolutePathToVSProjectFolder_1 = path.resolve(vsSettings.VSProjectDetails.ProjectFileName, '..');
        var gruntfileFolder_1 = path.resolve('.');
        _.map(_.uniq(vsSettings.files), function (file) {
            var absolutePathToFile = path.normalize(path.join(absolutePathToVSProjectFolder_1, file));
            var relativePathToFileFromGruntfile = path.relative(gruntfileFolder_1, absolutePathToFile).replace(new RegExp('\\' + path.sep, 'g'), '/');
            if (src_1.indexOf(absolutePathToFile) === -1 &&
                src_1.indexOf(relativePathToFileFromGruntfile) === -1) {
                src_1.push(relativePathToFileFromGruntfile);
            }
        });
    }
    if (!ignoreSettings) {
        options = applyVSSettings(options, vsSettings);
    }
    return options;
}
function relativePathToVSProjectFolderFromGruntfile(settings) {
    return path.resolve(settings.VSProjectDetails.ProjectFileName, '..');
}
function applyVSSettings(options, vsSettings) {
    var simpleVSSettingsToGruntTSMappings = {
        'AdditionalFlags': 'additionalFlags',
        'AllowSyntheticDefaultImports': 'allowSyntheticDefaultImports',
        'AllowUnreachableCode': 'allowUnreachableCode',
        'AllowUnusedLabels': 'allowUnusedLabels',
        'BaseUrl': 'baseUrl',
        'Charset': 'charset',
        'DeclarationDir': 'declarationDir',
        'EmitBOM': 'emitBom',
        'EmitDecoratorMetadata': 'emitDecoratorMetadata',
        'ExperimentalAsyncFunctions': 'experimentalAsyncFunctions',
        'ExperimentalDecorators': 'experimentalDecorators',
        'ForceConsistentCasingInFileNames': 'forceConsistentCasingInFileNames',
        'GeneratesDeclarations': 'declaration',
        'InlineSourceMap': 'inlineSourceMap',
        'InlineSources': 'inlineSources',
        'IsolatedModules': 'isolatedModules',
        'JSXEmit': 'jsx',
        'MapRoot': 'mapRoot',
        'ModuleKind': 'module',
        'ModuleResolution': 'moduleResolution',
        'NewLine': 'newLine',
        'NoEmitHelpers': 'noEmitHelpers',
        'NoEmitOnError': 'noEmitOnError',
        'NoFallthroughCasesInSwitch': 'noFallthroughCasesInSwitch',
        'NoImplicitAny': 'noImplicitAny',
        'NoImplicitReturns': 'noImplicitReturns',
        'NoImplicitThis': 'noImplicitThis',
        'NoImplicitUseStrict': 'noImplicitUseStrict',
        'NoLib': 'noLib',
        'NoStrictGenericChecks': 'noStrictGenericChecks',
        'NoResolve': 'noResolve',
        'PreferredUILang': 'locale',
        'PreserveConstEnums': 'preserveConstEnums',
        'PreserveSymlinks': 'preserveSymlinks',
        'ReactNamespace': 'reactNamespace',
        'RemoveComments': 'removeComments',
        'RootDir': 'rootDir',
        'SkipLibCheck': 'skipLibCheck',
        'SkipDefaultLibCheck': 'skipDefaultLibCheck',
        'SourceMap': 'sourceMap',
        'SourceRoot': 'sourceRoot',
        'StrictFunctionTypes': 'strictFunctionTypes',
        'StrictNullChecks': 'strictNullChecks',
        'SuppressExcessPropertyErrors': 'suppressExcessPropertyErrors',
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
    var gruntfileToProject = relativePathToVSProjectFolderFromGruntfile(vsSettings);
    if (utils.hasValue(vsSettings.OutDir) && vsSettings.OutDir !== '') {
        options.CompilationTasks.forEach(function (item) {
            var absolutePath = path.resolve(gruntfileToProject, vsSettings.OutDir);
            item.outDir = utils.enclosePathInQuotesIfRequired(path.relative(path.resolve('.'), absolutePath).replace(new RegExp('\\' + path.sep, 'g'), '/'));
        });
    }
    if (utils.hasValue(vsSettings.OutFile) && vsSettings.OutFile !== '') {
        options.CompilationTasks.forEach(function (item) {
            var absolutePath = path.resolve(gruntfileToProject, vsSettings.OutFile);
            item.out = utils.enclosePathInQuotesIfRequired(path.relative(path.resolve('.'), absolutePath).replace(new RegExp('\\' + path.sep, 'g'), '/'));
        });
    }
    return options;
}
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
//# sourceMappingURL=visualStudioOptionsResolver.js.map