'use strict';
var es6_promise_1 = require('es6-promise');
var fs = require('fs');
var path = require('path');
var stripBom = require('strip-bom');
var _ = require('lodash');
var utils = require('./utils');
var templateProcessor = null;
var globExpander = null;
var gruntfileGlobs = null;
var absolutePathToTSConfig;
function resolveAsync(applyTo, taskOptions, targetOptions, theTemplateProcessor, theGlobExpander) {
    if (theGlobExpander === void 0) { theGlobExpander = null; }
    templateProcessor = theTemplateProcessor;
    globExpander = theGlobExpander;
    gruntfileGlobs = getGlobs(taskOptions, targetOptions);
    return new es6_promise_1.Promise(function (resolve, reject) {
        try {
            var taskTSConfig = getTSConfigSettings(taskOptions);
            var targetTSConfig = getTSConfigSettings(targetOptions);
            var tsconfig = null;
            if (taskTSConfig) {
                tsconfig = taskTSConfig;
            }
            if (targetTSConfig) {
                if (!tsconfig) {
                    tsconfig = targetTSConfig;
                }
                if ('tsconfig' in targetTSConfig) {
                    tsconfig.tsconfig = templateProcessor(targetTSConfig.tsconfig, {});
                }
                if ('ignoreSettings' in targetTSConfig) {
                    tsconfig.ignoreSettings = targetTSConfig.ignoreSettings;
                }
                if ('overwriteFilesGlob' in targetTSConfig) {
                    tsconfig.overwriteFilesGlob = targetTSConfig.overwriteFilesGlob;
                }
                if ('updateFiles' in targetTSConfig) {
                    tsconfig.updateFiles = targetTSConfig.updateFiles;
                }
                if ('passThrough' in targetTSConfig) {
                    tsconfig.passThrough = targetTSConfig.passThrough;
                }
            }
            applyTo.tsconfig = tsconfig;
        }
        catch (ex) {
            return reject(ex);
        }
        if (!applyTo.tsconfig) {
            return resolve(applyTo);
        }
        if (applyTo.tsconfig.passThrough) {
            if (applyTo.CompilationTasks.length === 0) {
                applyTo.CompilationTasks.push({ src: [] });
            }
            if (!applyTo.tsconfig.tsconfig) {
                applyTo.tsconfig.tsconfig = '.';
            }
        }
        else {
            var projectFile = applyTo.tsconfig.tsconfig;
            try {
                var projectFileTextContent = fs.readFileSync(projectFile, 'utf8');
            }
            catch (ex) {
                if (ex && ex.code === 'ENOENT') {
                    return reject('Could not find file "' + projectFile + '".');
                }
                else if (ex && ex.errno) {
                    return reject('Error ' + ex.errno + ' reading "' + projectFile + '".');
                }
                else {
                    return reject('Error reading "' + projectFile + '": ' + JSON.stringify(ex));
                }
            }
            try {
                var projectSpec;
                var content = stripBom(projectFileTextContent);
                if (content.trim() === '') {
                    projectSpec = {};
                }
                else {
                    projectSpec = JSON.parse(content);
                }
            }
            catch (ex) {
                return reject('Error parsing "' + projectFile + '".  It may not be valid JSON in UTF-8.');
            }
            applyTo = warnOnBadConfiguration(applyTo, projectSpec);
            applyTo = applyCompilerOptions(applyTo, projectSpec);
            applyTo = resolve_output_locations(applyTo, projectSpec);
        }
        resolve(applyTo);
    });
}
exports.resolveAsync = resolveAsync;
function warnOnBadConfiguration(options, projectSpec) {
    if (projectSpec.compilerOptions) {
        if (projectSpec.compilerOptions.out && projectSpec.compilerOptions.outFile) {
            options.warnings.push('Warning: `out` and `outFile` should not be used together in tsconfig.json.');
        }
        if (projectSpec.compilerOptions.out) {
            options.warnings.push('Warning: Using `out` in tsconfig.json can be unreliable because it will output relative' +
                ' to the tsc working directory.  It is better to use `outFile` which is always relative to tsconfig.json, ' +
                ' but this requires TypeScript 1.6 or higher.');
        }
    }
    return options;
}
function getGlobs(taskOptions, targetOptions) {
    var globs = null;
    if (taskOptions && isStringOrArray(taskOptions.src)) {
        globs = _.map(taskOptions.src.slice(), function (item) { return templateProcessor(item, {}); });
    }
    if (targetOptions && isStringOrArray(targetOptions.src)) {
        globs = _.map(targetOptions.src.slice(), function (item) { return templateProcessor(item, {}); });
    }
    return globs;
    function isStringOrArray(thing) {
        return (_.isArray(thing) || _.isString(thing));
    }
}
function resolve_output_locations(options, projectSpec) {
    if (options.CompilationTasks
        && options.CompilationTasks.length > 0
        && projectSpec
        && projectSpec.compilerOptions) {
        options.CompilationTasks.forEach(function (compilationTask) {
            if (projectSpec.compilerOptions.out) {
                compilationTask.out = path.normalize(projectSpec.compilerOptions.out).replace(/\\/g, '/');
            }
            if (projectSpec.compilerOptions.outFile) {
                compilationTask.out = path.normalize(path.join(relativePathFromGruntfileToTSConfig(), projectSpec.compilerOptions.outFile)).replace(/\\/g, '/');
            }
            if (projectSpec.compilerOptions.outDir) {
                compilationTask.outDir = path.normalize(path.join(relativePathFromGruntfileToTSConfig(), projectSpec.compilerOptions.outDir)).replace(/\\/g, '/');
            }
        });
    }
    return options;
}
function getTSConfigSettings(raw) {
    try {
        if (!raw || !raw.tsconfig) {
            return null;
        }
        if (typeof raw.tsconfig === 'boolean') {
            return {
                tsconfig: path.join(path.resolve('.'), 'tsconfig.json')
            };
        }
        else if (typeof raw.tsconfig === 'string') {
            var tsconfigName = templateProcessor(raw.tsconfig, {});
            var fileInfo = fs.lstatSync(tsconfigName);
            if (fileInfo.isDirectory()) {
                tsconfigName = path.join(tsconfigName, 'tsconfig.json');
            }
            return {
                tsconfig: tsconfigName
            };
        }
        if (!('tsconfig' in raw.tsconfig) &&
            !raw.tsconfig.passThrough) {
            raw.tsconfig.tsconfig = 'tsconfig.json';
        }
        return raw.tsconfig;
    }
    catch (ex) {
        if (ex.code === 'ENOENT') {
            throw ex;
        }
        var exception = {
            name: 'Invalid tsconfig setting',
            message: 'Exception due to invalid tsconfig setting.  Details: ' + ex,
            code: ex.code,
            errno: ex.errno
        };
        throw exception;
    }
}
function applyCompilerOptions(applyTo, projectSpec) {
    var result = applyTo || {};
    var co = projectSpec.compilerOptions;
    var tsconfig = applyTo.tsconfig;
    if (!tsconfig.ignoreSettings && co) {
        var sameNameInTSConfigAndGruntTS = ['declaration', 'emitDecoratorMetadata',
            'experimentalAsyncFunctions', 'experimentalDecorators', 'isolatedModules',
            'inlineSourceMap', 'inlineSources', 'jsx', 'mapRoot', 'module',
            'moduleResolution', 'newLine', 'noEmit',
            'noEmitHelpers', 'noEmitOnError', 'noImplicitAny', 'noLib', 'noResolve',
            'out', 'outDir', 'preserveConstEnums', 'removeComments', 'rootDir',
            'sourceMap', 'sourceRoot', 'suppressImplicitAnyIndexErrors', 'target'];
        sameNameInTSConfigAndGruntTS.forEach(function (propertyName) {
            if ((propertyName in co) && !(propertyName in result)) {
                result[propertyName] = co[propertyName];
            }
        });
        // now copy the ones that don't have the same names.
        // `outFile` was added in TypeScript 1.6 and is the same as out for command-line
        // purposes except that `outFile` is relative to the tsconfig.json.
        if (('outFile' in co) && !('out' in result)) {
            result['out'] = co['outFile'];
        }
    }
    if (!('updateFiles' in tsconfig)) {
        tsconfig.updateFiles = true;
    }
    if (applyTo.CompilationTasks.length === 0) {
        applyTo.CompilationTasks.push({ src: [] });
    }
    var src = applyTo.CompilationTasks[0].src;
    absolutePathToTSConfig = path.resolve(tsconfig.tsconfig, '..');
    if (tsconfig.overwriteFilesGlob) {
        if (!gruntfileGlobs) {
            throw new Error('The tsconfig option overwriteFilesGlob is set to true, but no glob was passed-in.');
        }
        var relPath = relativePathFromGruntfileToTSConfig();
        var gruntGlobsRelativeToTSConfig = [];
        for (var i = 0; i < gruntfileGlobs.length; i += 1) {
            gruntfileGlobs[i] = gruntfileGlobs[i].replace(/\\/g, '/');
            gruntGlobsRelativeToTSConfig.push(path.relative(relPath, gruntfileGlobs[i]).replace(/\\/g, '/'));
        }
        if (_.difference(projectSpec.filesGlob, gruntGlobsRelativeToTSConfig).length > 0 ||
            _.difference(gruntGlobsRelativeToTSConfig, projectSpec.filesGlob).length > 0) {
            projectSpec.filesGlob = gruntGlobsRelativeToTSConfig;
            if (projectSpec.files) {
                projectSpec.files = [];
            }
            saveTSConfigSync(tsconfig.tsconfig, projectSpec);
        }
    }
    if (tsconfig.updateFiles && projectSpec.filesGlob) {
        if (projectSpec.files === undefined) {
            projectSpec.files = [];
        }
        updateTSConfigAndFilesFromGlob(projectSpec.files, projectSpec.filesGlob, tsconfig.tsconfig);
    }
    if (projectSpec.files) {
        addUniqueRelativeFilesToSrc(projectSpec.files, src, absolutePathToTSConfig);
    }
    else {
        if (!globExpander.isStub) {
            var virtualGlob = [];
            if (projectSpec.exclude && _.isArray(projectSpec.exclude)) {
                virtualGlob.push(path.resolve(absolutePathToTSConfig, './*.ts'));
                virtualGlob.push(path.resolve(absolutePathToTSConfig, './*.tsx'));
                var tsconfigExcludedDirectories = [];
                projectSpec.exclude.forEach(function (exc) {
                    tsconfigExcludedDirectories.push(path.normalize(path.join(absolutePathToTSConfig, exc)));
                });
                fs.readdirSync(absolutePathToTSConfig).forEach(function (item) {
                    var filePath = path.normalize(path.join(absolutePathToTSConfig, item));
                    if (fs.statSync(filePath).isDirectory()) {
                        if (tsconfigExcludedDirectories.indexOf(filePath) === -1) {
                            virtualGlob.push(path.resolve(absolutePathToTSConfig, item, './**/*.ts'));
                            virtualGlob.push(path.resolve(absolutePathToTSConfig, item, './**/*.tsx'));
                        }
                    }
                });
            }
            else {
                virtualGlob.push(path.resolve(absolutePathToTSConfig, './**/*.ts'));
                virtualGlob.push(path.resolve(absolutePathToTSConfig, './**/*.tsx'));
            }
            var files = globExpander(virtualGlob);
            // make files relative to the tsconfig.json file
            for (var i = 0; i < files.length; i += 1) {
                files[i] = path.relative(absolutePathToTSConfig, files[i]).replace(/\\/g, '/');
            }
            projectSpec.files = files;
            if (projectSpec.filesGlob) {
                saveTSConfigSync(tsconfig.tsconfig, projectSpec);
            }
            addUniqueRelativeFilesToSrc(files, src, absolutePathToTSConfig);
        }
    }
    return result;
}
function relativePathFromGruntfileToTSConfig() {
    if (!absolutePathToTSConfig) {
        throw 'attempt to get relative path to tsconfig.json before setting absolute path';
    }
    return path.relative('.', absolutePathToTSConfig).replace(/\\/g, '/');
}
function updateTSConfigAndFilesFromGlob(filesRelativeToTSConfig, globRelativeToTSConfig, tsconfigFileName) {
    if (globExpander.isStub) {
        return;
    }
    var absolutePathToTSConfig = path.resolve(tsconfigFileName, '..');
    var filesGlobRelativeToGruntfile = [];
    for (var i = 0; i < globRelativeToTSConfig.length; i += 1) {
        filesGlobRelativeToGruntfile.push(path.relative(path.resolve('.'), path.join(absolutePathToTSConfig, globRelativeToTSConfig[i])));
    }
    var filesRelativeToGruntfile = globExpander(filesGlobRelativeToGruntfile);
    {
        var filesRelativeToTSConfig_temp = [];
        var relativePathFromGruntfileToTSConfig_1 = path.relative('.', absolutePathToTSConfig).replace(/\\/g, '/');
        for (var i = 0; i < filesRelativeToGruntfile.length; i += 1) {
            filesRelativeToGruntfile[i] = filesRelativeToGruntfile[i].replace(/\\/g, '/');
            filesRelativeToTSConfig_temp.push(path.relative(relativePathFromGruntfileToTSConfig_1, filesRelativeToGruntfile[i]).replace(/\\/g, '/'));
        }
        filesRelativeToTSConfig.length = 0;
        filesRelativeToTSConfig.push.apply(filesRelativeToTSConfig, filesRelativeToTSConfig_temp);
    }
    var tsconfigJSONContent = utils.readAndParseJSONFromFileSync(tsconfigFileName);
    var tempTSConfigFiles = tsconfigJSONContent.files || [];
    if (_.difference(tempTSConfigFiles, filesRelativeToTSConfig).length > 0 ||
        _.difference(filesRelativeToTSConfig, tempTSConfigFiles).length > 0) {
        try {
            tsconfigJSONContent.files = filesRelativeToTSConfig;
            saveTSConfigSync(tsconfigFileName, tsconfigJSONContent);
        }
        catch (ex) {
            var error = new Error('Error updating tsconfig.json: ' + ex);
            throw error;
        }
    }
}
function saveTSConfigSync(fileName, content) {
    fs.writeFileSync(fileName, JSON.stringify(content, null, '    '));
}
function addUniqueRelativeFilesToSrc(tsconfigFilesArray, compilationTaskSrc, absolutePathToTSConfig) {
    var gruntfileFolder = path.resolve('.');
    _.map(_.uniq(tsconfigFilesArray), function (file) {
        var absolutePathToFile = path.normalize(path.join(absolutePathToTSConfig, file));
        var relativePathToFileFromGruntfile = path.relative(gruntfileFolder, absolutePathToFile).replace(new RegExp('\\' + path.sep, 'g'), '/');
        if (compilationTaskSrc.indexOf(absolutePathToFile) === -1 &&
            compilationTaskSrc.indexOf(relativePathToFileFromGruntfile) === -1) {
            compilationTaskSrc.push(relativePathToFileFromGruntfile);
        }
    });
}
//# sourceMappingURL=tsconfig.js.map