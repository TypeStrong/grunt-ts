'use strict';
var csproj2ts = require('csproj2ts');
var path = require('path');
var utils = require('./utils');
function resolveVSOptionsAsync(applyTo, taskOptions, targetOptions) {
    return new Promise(function (resolve, reject) {
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
                applyTo = applyVSOptions(applyTo, vsConfig);
                resolve(applyTo);
                return;
            }).catch(function (error) {
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
exports.resolveVSOptionsAsync = resolveVSOptionsAsync;
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