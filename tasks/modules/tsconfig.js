'use strict';
var es6_promise_1 = require('es6-promise');
var fs = require('fs');
var path = require('path');
var stripBom = require('strip-bom');
var _ = require('lodash');
var templateProcessor = null;
var globExpander = null;
function resolveAsync(applyTo, taskOptions, targetOptions, theTemplateProcessor, theGlobExpander) {
    if (theGlobExpander === void 0) { theGlobExpander = null; }
    templateProcessor = theTemplateProcessor;
    globExpander = theGlobExpander;
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
                return reject(ex);
            }
            try {
                var projectSpec = JSON.parse(stripBom(projectFileTextContent));
            }
            catch (ex) {
                return reject('Error parsing "' + projectFile + '".  It may not be valid JSON in UTF-8.  ' +
                    'The shortest possible file contents that will "work" with grunt-ts is: {}');
            }
            applyTo = applyCompilerOptions(applyTo, projectSpec);
            applyTo = resolve_out_and_outDir(applyTo, projectSpec);
        }
        resolve(applyTo);
    });
}
exports.resolveAsync = resolveAsync;
function resolve_out_and_outDir(options, projectSpec) {
    if (options.CompilationTasks
        && options.CompilationTasks.length > 0
        && projectSpec
        && projectSpec.compilerOptions) {
        options.CompilationTasks.forEach(function (compilationTask) {
            if (projectSpec.compilerOptions.out) {
                compilationTask.out = projectSpec.compilerOptions.out;
            }
            if (projectSpec.compilerOptions.outDir) {
                compilationTask.outDir = projectSpec.compilerOptions.outDir;
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
    if (projectSpec.files) {
        addUniqueRelativeFilesToSrc(projectSpec.files, src, absolutePathToTSConfig);
    }
    else {
        // if files is not specified, default to including *.ts and *.tsx in folder and subfolders.
        var virtualGlob = [path.resolve(absolutePathToTSConfig, './**/*.ts'),
            path.resolve(absolutePathToTSConfig, './**/*.tsx')];
        if (projectSpec.exclude && _.isArray(projectSpec.exclude)) {
            projectSpec.exclude.forEach(function (exc) {
                virtualGlob.push('!' + path.resolve(absolutePathToTSConfig, exc, './**/*.ts'));
                virtualGlob.push('!' + path.resolve(absolutePathToTSConfig, exc, './**/*.tsx'));
            });
        }
        var files = globExpander(virtualGlob);
        // make files relative to the tsconfig.json file
        for (var i = 0; i < files.length; i += 1) {
            files[i] = path.relative(absolutePathToTSConfig, files[i]);
        }
        addUniqueRelativeFilesToSrc(files, src, absolutePathToTSConfig);
    }
    return result;
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