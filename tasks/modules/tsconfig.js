'use strict';
var es6_promise_1 = require('es6-promise');
var fs = require('fs');
var path = require('path');
var stripBom = require('strip-bom');
var _ = require('lodash');
function resolveAsync(applyTo, taskOptions, targetOptions) {
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
                    tsconfig.tsconfig = targetTSConfig.tsconfig;
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
            reject(ex);
            return;
        }
        if (!applyTo.tsconfig) {
            resolve(applyTo);
            return;
        }
        var projectFile = applyTo.tsconfig.tsconfig;
        try {
            var projectFileTextContent = fs.readFileSync(projectFile, 'utf8');
        }
        catch (ex) {
            if (ex && ex.code === 'ENOENT') {
                reject('Could not find file "' + projectFile + '".');
                return;
            }
            else if (ex && ex.errno) {
                reject('Error ' + ex.errno + ' reading "' + projectFile + '".');
                return;
            }
            else {
                reject('Error reading "' + projectFile + '": ' + JSON.stringify(ex));
                return;
            }
            reject(ex);
            return;
        }
        try {
            var projectSpec = JSON.parse(stripBom(projectFileTextContent));
        }
        catch (ex) {
            reject('Error parsing "' + projectFile + '".  It may not be valid JSON in UTF-8.');
            return;
        }
        applyTo = applyCompilerOptions(applyTo, projectSpec);
        resolve(applyTo);
    });
}
exports.resolveAsync = resolveAsync;
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
            var tsconfigName = raw.tsconfig;
            var fileInfo = fs.lstatSync(tsconfigName);
            if (fileInfo.isDirectory()) {
                tsconfigName = path.join(tsconfigName, 'tsconfig.json');
            }
            return {
                tsconfig: tsconfigName
            };
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
    if (!tsconfig.ignoreSettings) {
        var tsconfigMappingToGruntTSProperty = ['declaration', 'emitDecoratorMetadata',
            'experimentalDecorators', 'isolatedModules',
            'inlineSourceMap', 'inlineSources', 'mapRoot', 'module', 'newLine', 'noEmit',
            'noEmitHelpers', 'noEmitOnError', 'noImplicitAny', 'noLib', 'noResolve',
            'out', 'outDir', 'preserveConstEnums', 'removeComments', 'sourceMap',
            'sourceRoot', 'suppressImplicitAnyIndexErrors', 'target'];
        tsconfigMappingToGruntTSProperty.forEach(function (propertyName) {
            if (propertyName in co) {
                if (!(propertyName in result)) {
                    result[propertyName] = co[propertyName];
                }
            }
        });
    }
    if (applyTo.CompilationTasks.length === 0) {
        applyTo.CompilationTasks.push({ src: [] });
    }
    var src = applyTo.CompilationTasks[0].src;
    var absolutePathToTSConfig = path.resolve(tsconfig.tsconfig, '..');
    var gruntfileFolder = path.resolve('.');
    _.map(_.uniq(projectSpec.files), function (file) {
        var absolutePathToFile = path.normalize(path.join(absolutePathToTSConfig, file));
        var relativePathToFileFromGruntfile = path.relative(gruntfileFolder, absolutePathToFile).replace(new RegExp('\\' + path.sep, 'g'), '/');
        if (src.indexOf(absolutePathToFile) === -1 &&
            src.indexOf(relativePathToFileFromGruntfile) === -1) {
            src.push(relativePathToFileFromGruntfile);
        }
    });
    return result;
}
//# sourceMappingURL=tsconfig.js.map