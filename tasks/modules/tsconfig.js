'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var es6_promise_1 = require("es6-promise");
var fs = require("fs");
var path = require("path");
var stripBom = require("strip-bom");
var _ = require("lodash");
var detectIndent = require("detect-indent");
var detectNewline = require("detect-newline");
var utils = require("./utils");
var jsmin = require("jsmin2");
var templateProcessor = null;
var globExpander = null;
var gruntfileGlobs = null;
var verboseLogger = null;
var absolutePathToTSConfig;
var detectedIndentString = '    ', detectedNewline = utils.eol;
var gruntfileFolder = path.resolve('.');
function resolveAsync(applyTo, taskOptions, targetOptions, theTemplateProcessor, theGlobExpander, theVerboseLogger) {
    if (theGlobExpander === void 0) { theGlobExpander = null; }
    if (theVerboseLogger === void 0) { theVerboseLogger = null; }
    templateProcessor = theTemplateProcessor;
    globExpander = theGlobExpander;
    gruntfileGlobs = getGlobs(taskOptions, targetOptions);
    verboseLogger = theVerboseLogger || (function (logText) { });
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
            var projectSpec = { extends: applyTo.tsconfig.tsconfig };
            while (projectSpec.extends) {
                var pathOfTsconfig = path.resolve(projectSpec.extends, '..');
                try {
                    var projectFileTextContent = fs.readFileSync(projectSpec.extends, 'utf8');
                }
                catch (ex) {
                    if (ex && ex.code === 'ENOENT') {
                        return reject('Could not find file "' + projectSpec.extends + '".');
                    }
                    else if (ex && ex.errno) {
                        return reject('Error ' + ex.errno + ' reading "' + projectSpec.extends + '".');
                    }
                    else {
                        return reject('Error reading "' + projectSpec.extends + '": ' + JSON.stringify(ex));
                    }
                }
                try {
                    var content = stripBom(projectFileTextContent);
                    if (content.trim() === '') {
                        projectSpec.extends = undefined;
                    }
                    else {
                        detectedIndentString = detectIndent(content).indent;
                        detectedNewline = detectNewline(content);
                        var minifiedContent = jsmin(content);
                        var parentContent = JSON.parse(minifiedContent.code);
                        projectSpec = _.defaultsDeep(projectSpec, parentContent);
                        if (parentContent.extends) {
                            projectSpec.extends = path.resolve(pathOfTsconfig, parentContent.extends);
                            if (!_.endsWith(projectSpec.extends, '.json')) {
                                projectSpec.extends += '.json';
                            }
                        }
                        else {
                            projectSpec.extends = undefined;
                        }
                    }
                }
                catch (ex) {
                    return reject('Error parsing "' + projectSpec.extends + '".  It may not be valid JSON in UTF-8.');
                }
            }
            applyTo = handleBadConfiguration(applyTo, projectSpec);
            applyTo = applyCompilerOptions(applyTo, projectSpec);
            applyTo = resolve_output_locations(applyTo, projectSpec);
        }
        resolve(applyTo);
    });
}
exports.resolveAsync = resolveAsync;
function handleBadConfiguration(options, projectSpec) {
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
    var tsconfigSetting = options.tsconfig;
    if (projectSpec.include && tsconfigSetting.overwriteFilesGlob) {
        options.errors.push('Error: grunt-ts does not support using the `overwriteFilesGlob` feature with a tsconfig.json' +
            ' file that has an `include` array.  If your version of TypeScript supports `include`, you should just use that.');
    }
    if (projectSpec.include && tsconfigSetting.updateFiles) {
        options.errors.push('Error: grunt-ts does not support using the `updateFiles` feature with a tsconfig.json' +
            ' file that has an `include` array.  If your version of TypeScript supports `include`, you should just use that.');
    }
    return options;
}
function getGlobs(taskOptions, targetOptions) {
    var globs = null;
    if (taskOptions && isStringOrArray(taskOptions.src)) {
        globs = _.map(getFlatCloneOf([taskOptions.src]), function (item) { return templateProcessor(item, {}); });
    }
    if (targetOptions && isStringOrArray(targetOptions.src)) {
        globs = _.map(getFlatCloneOf([targetOptions.src]), function (item) { return templateProcessor(item, {}); });
    }
    return globs;
    function isStringOrArray(thing) {
        return (_.isArray(thing) || _.isString(thing));
    }
    function getFlatCloneOf(array) {
        return _.flattenDeep(array).slice();
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
                tsconfig: path.join(gruntfileFolder, 'tsconfig.json')
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
    var co = projectSpec.compilerOptions, tsconfig = applyTo.tsconfig;
    absolutePathToTSConfig = path.resolve(tsconfig.tsconfig, '..');
    if (!tsconfig.ignoreSettings && co) {
        var sameNameInTSConfigAndGruntTS = [
            'allowJs',
            'allowSyntheticDefaultImports',
            'allowUnreachableCode',
            'allowUnusedLabels',
            'alwaysStrict',
            'baseUrl',
            'charset',
            'checkJs',
            'declaration',
            'declarationDir',
            'diagnostics',
            'disableSizeLimit',
            'downlevelIteration',
            'emitBOM',
            'emitDecoratorMetadata',
            'experimentalAsyncFunctions',
            'experimentalDecorators',
            'forceConsistentCasingInFileNames',
            'isolatedModules',
            'importHelpers',
            'inlineSourceMap',
            'inlineSources',
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
            'out',
            'outDir',
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
            'suppressExcessPropertyIndexErrors',
            'suppressImplicitAnyIndexErrors',
            'target',
            'traceResolution',
            'types',
        ];
        sameNameInTSConfigAndGruntTS.forEach(function (propertyName) {
            if ((propertyName in co) && !(propertyName in result)) {
                result[propertyName] = co[propertyName];
            }
        });
        if (('outFile' in co) && !('out' in result)) {
            result['out'] = co['outFile'];
        }
        if (('typeRoots' in co) && !('typeRoots' in result)) {
            var relPath_1 = relativePathFromGruntfileToTSConfig();
            result['typeRoots'] = _.map(co['typeRoots'], function (p) { return path.relative('.', path.resolve(relPath_1, p)).replace(/\\/g, '/'); });
        }
    }
    if (!('updateFiles' in tsconfig)) {
        tsconfig.updateFiles = !('include' in projectSpec) && ('filesGlob' in projectSpec);
    }
    if (applyTo.CompilationTasks.length === 0) {
        applyTo.CompilationTasks.push({ src: [] });
    }
    if (tsconfig.overwriteFilesGlob) {
        if (!gruntfileGlobs) {
            throw new Error('The tsconfig option overwriteFilesGlob is set to true, but no glob was passed-in.');
        }
        var relPath = relativePathFromGruntfileToTSConfig(), gruntGlobsRelativeToTSConfig = [];
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
    result = addFilesToCompilationContext(result, projectSpec);
    return result;
}
function addFilesToCompilationContext(applyTo, projectSpec) {
    var resolvedInclude = [], resolvedExclude = [], resolvedFiles = [];
    var result = applyTo, co = projectSpec.compilerOptions, tsconfig = applyTo.tsconfig, src = applyTo.CompilationTasks[0].src;
    if (projectSpec.exclude) {
        resolvedExclude.push.apply(resolvedExclude, (projectSpec.exclude.map(function (f) {
            var p = path.join(absolutePathToTSConfig, f);
            try {
                var stats = fs.statSync(p);
                if (stats.isDirectory()) {
                    p = path.join(p, '**');
                }
            }
            catch (err) {
                verboseLogger("Warning: \"" + p + "\" was specified in tsconfig `exclude` property, but was not found on disk.");
            }
            return utils.prependIfNotStartsWith(p, '!');
        })));
        verboseLogger('Resolved exclude from tsconfig: ' + JSON.stringify(resolvedExclude));
    }
    else {
        resolvedExclude.push(utils.prependIfNotStartsWith(path.join(absolutePathToTSConfig, 'node_modules/**'), '!'), utils.prependIfNotStartsWith(path.join(absolutePathToTSConfig, 'bower_components/**'), '!'), utils.prependIfNotStartsWith(path.join(absolutePathToTSConfig, 'jspm_packages/**'), '!'));
    }
    if (co && co.outDir) {
        resolvedExclude.push(utils.prependIfNotStartsWith(path.join(absolutePathToTSConfig, co.outDir, '**'), '!'));
    }
    if (projectSpec.include || projectSpec.files) {
        if (projectSpec.files) {
            resolvedFiles.push.apply(resolvedFiles, projectSpec.files.map(function (f) { return path.join(absolutePathToTSConfig, f); }));
            verboseLogger('Resolved files from tsconfig: ' + JSON.stringify(resolvedFiles));
        }
        if (_.isArray(projectSpec.include)) {
            resolvedInclude.push.apply(resolvedInclude, projectSpec.include.map(function (f) { return path.join(absolutePathToTSConfig, f); }));
            verboseLogger('Resolved include from tsconfig: ' + JSON.stringify(resolvedInclude));
        }
    }
    else {
        if (!tsconfig.updateFiles) {
            resolvedInclude.push(path.join(absolutePathToTSConfig, '**/*.ts'), path.join(absolutePathToTSConfig, '**/*.d.ts'), path.join(absolutePathToTSConfig, '**/*.tsx'));
            if (applyTo.allowJs) {
                resolvedInclude.push(path.join(absolutePathToTSConfig, '**/*.js'), path.join(absolutePathToTSConfig, '**/*.jsx'));
            }
            verboseLogger('Automatic include from tsconfig: ' + JSON.stringify(resolvedInclude));
        }
    }
    var resolvedExcludeFromGruntfile = (applyTo.CompilationTasks[0].glob || [])
        .filter(function (g) { return g.charAt(0) === '!'; }).map(function (g) { return '!' + path.join(gruntfileFolder, g.substr(1)); });
    var expandedCompilationContext = [];
    if (resolvedInclude.length > 0 || resolvedExclude.length > 0) {
        if (globExpander.isStub) {
            result.warnings.push('Attempt to resolve glob in tsconfig module using stub globExpander.');
        }
        var globsToResolve = resolvedInclude.concat(resolvedExclude, resolvedExcludeFromGruntfile);
        expandedCompilationContext.push.apply(expandedCompilationContext, (globExpander(globsToResolve).filter(function (p) {
            if (_.endsWith(p, '.ts') || _.endsWith(p, '.tsx')) {
                return true;
            }
            if (applyTo.allowJs && (_.endsWith(p, '.js') || _.endsWith(p, '.jsx'))) {
                return true;
            }
            return false;
        })));
    }
    var tsconfigCompilationContext = expandedCompilationContext.concat(resolvedFiles);
    verboseLogger('Will resolve tsconfig compilation context from: ' + JSON.stringify(tsconfigCompilationContext));
    addUniqueRelativeFilesToSrc(tsconfigCompilationContext, src, absolutePathToTSConfig);
    if (tsconfig.updateFiles && projectSpec.filesGlob) {
        if (projectSpec.files === undefined) {
            projectSpec.files = [];
        }
        updateTSConfigAndFilesFromGlobAndAddToCompilationContext(projectSpec.files, projectSpec.filesGlob, tsconfig.tsconfig, src);
    }
    return result;
}
function relativePathFromGruntfileToTSConfig() {
    if (!absolutePathToTSConfig) {
        throw 'attempt to get relative path to tsconfig.json before setting absolute path';
    }
    return path.relative('.', absolutePathToTSConfig).replace(/\\/g, '/');
}
function updateTSConfigAndFilesFromGlobAndAddToCompilationContext(filesRelativeToTSConfig, globRelativeToTSConfig, tsconfigFileName, currentCompilationFilesList) {
    if (globExpander.isStub) {
        return;
    }
    var absolutePathToTSConfig = path.resolve(tsconfigFileName, '..');
    var filesGlobRelativeToGruntfile = [];
    for (var i = 0; i < globRelativeToTSConfig.length; i += 1) {
        filesGlobRelativeToGruntfile.push(path.relative(gruntfileFolder, path.join(absolutePathToTSConfig, globRelativeToTSConfig[i])));
    }
    var filesRelativeToGruntfile = globExpander(filesGlobRelativeToGruntfile);
    {
        var filesRelativeToTSConfig_temp = [];
        var relativePathFromGruntfileToTSConfig_1 = path.relative('.', absolutePathToTSConfig).replace(/\\/g, '/');
        for (var i = 0; i < filesRelativeToGruntfile.length; i += 1) {
            filesRelativeToGruntfile[i] = filesRelativeToGruntfile[i].replace(/\\/g, '/');
            if (currentCompilationFilesList.indexOf(filesRelativeToGruntfile[i]) === -1) {
                currentCompilationFilesList.push(filesRelativeToGruntfile[i]);
            }
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
    fs.writeFileSync(fileName, prettyJSON(content, detectedIndentString, detectedNewline));
}
function prettyJSON(object, indent, newLine) {
    if (indent === void 0) { indent = 4; }
    if (newLine === void 0) { newLine = utils.eol; }
    var cache = [];
    var value = JSON.stringify(object, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return;
            }
            cache.push(value);
        }
        return value;
    }, indent);
    value = value.replace(/(?:\r\n|\r|\n)/g, newLine) + newLine;
    return value;
}
exports.prettyJSON = prettyJSON;
var replaceSlashesRegex = new RegExp('\\' + path.sep, 'g');
function addUniqueRelativeFilesToSrc(tsconfigFilesArray, compilationTaskSrc, absolutePathToTSConfig) {
    _.map(_.uniq(tsconfigFilesArray), function (file) {
        var absolutePathToFile = utils.isAbsolutePath(file) ? file : path.normalize(path.join(absolutePathToTSConfig, file));
        var relativePathToFileFromGruntfile = path.relative(gruntfileFolder, absolutePathToFile).replace(replaceSlashesRegex, '/');
        if (compilationTaskSrc.indexOf(absolutePathToFile) === -1 &&
            compilationTaskSrc.indexOf(relativePathToFileFromGruntfile) === -1) {
            compilationTaskSrc.push(relativePathToFileFromGruntfile);
        }
    });
}
//# sourceMappingURL=tsconfig.js.map