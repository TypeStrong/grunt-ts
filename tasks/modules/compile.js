'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var _ = require("lodash");
var utils = require("./utils");
var cache = require("./cacheUtils");
var semver = require("semver");
var es6_promise_1 = require("es6-promise");
exports.grunt = require('grunt');
var executeNode;
var executeNodeDefault = function (args, optionalInfo) {
    return new es6_promise_1.Promise(function (resolve, reject) {
        exports.grunt.util.spawn({
            cmd: process.execPath,
            args: args
        }, function (error, result, code) {
            var ret = {
                code: code,
                output: result.stdout || result.stderr
            };
            resolve(ret);
        });
    });
};
var cacheClearedOnce = {};
function getChangedFiles(files, targetName, cacheDir, verbose) {
    files = cache.getNewFilesForTarget(files, targetName, cacheDir);
    if (verbose) {
        _.forEach(files, function (file) {
            exports.grunt.log.writeln(('### Fast Compile >>' + file).cyan);
        });
    }
    return files;
}
function resetChangedFiles(files, targetName, cacheDir) {
    cache.compileSuccessfull(files, targetName, cacheDir);
}
function clearCache(targetName, cacheDir) {
    cache.clearCache(targetName, cacheDir);
    cacheClearedOnce[targetName] = true;
}
function resolveTypeScriptBinPath() {
    var ownRoot = path.resolve(path.dirname(module.filename), '../..');
    var userRoot = path.resolve(ownRoot, '..', '..');
    var binSub = path.join('node_modules', 'typescript', 'bin');
    if (fs.existsSync(path.join(userRoot, binSub))) {
        return path.join(userRoot, binSub);
    }
    return path.join(ownRoot, binSub);
}
function getTsc(binPath) {
    return path.join(binPath, 'tsc');
}
function compileResultMeansFastCacheShouldBeRefreshed(options, result) {
    return (options.fast !== 'never' &&
        (result.code === 0 || (result.code === 2 && !options.failOnTypeErrors)));
}
exports.compileResultMeansFastCacheShouldBeRefreshed = compileResultMeansFastCacheShouldBeRefreshed;
function compileAllFiles(options, compilationInfo) {
    var targetFiles = compilationInfo.src;
    var files = _.map(targetFiles, function (file) { return file; });
    var newFiles = files;
    if (options.fast === 'watch') {
        if (cacheClearedOnce[exports.grunt.task.current.target] === undefined) {
            clearCache(options.targetName, options.tsCacheDir);
        }
    }
    if (options.fast !== 'never') {
        if (compilationInfo.out) {
            exports.grunt.log.writeln('Fast compile will not work when --out is specified. Ignoring fast compilation'.cyan);
        }
        else {
            newFiles = getChangedFiles(files, options.targetName, options.tsCacheDir, options.verbose);
            if (newFiles.length !== 0 || options.testExecute || utils.shouldPassThrough(options)) {
                if (options.forceCompileRegex) {
                    var regex_1 = new RegExp(options.forceCompileRegex);
                    var additionalFiles = files.filter(function (file) {
                        return regex_1.test(file);
                    });
                    newFiles = newFiles.concat(additionalFiles).filter(function (value, index, self) {
                        return self.indexOf(value) === index;
                    });
                }
                files = newFiles;
                if (compilationInfo.outDir && !options.baseDir) {
                    options.baseDir = utils.findCommonPath(files, '/');
                }
            }
            else {
                exports.grunt.log.writeln('No file changes were detected. Skipping Compile'.green);
                return new es6_promise_1.Promise(function (resolve) {
                    var ret = {
                        code: 0,
                        fileCount: 0,
                        output: 'No files compiled as no change detected'
                    };
                    resolve(ret);
                });
            }
        }
    }
    var tsconfig = options.tsconfig;
    var tsc, tscVersion = '';
    if (options.compiler) {
        exports.grunt.log.writeln('Using the custom compiler : ' + options.compiler);
        tsc = options.compiler;
        tscVersion = '';
    }
    else {
        var tscPath = resolveTypeScriptBinPath();
        tsc = getTsc(tscPath);
        tscVersion = getTscVersion(tscPath);
        exports.grunt.log.writeln('Using tsc v' + tscVersion);
    }
    if (compilationInfo.outDir && options.baseDir && files.length > 0 && !options.rootDir) {
        var baseDirFile = '.baseDir.ts', baseDirFilePath = path.join(options.baseDir, baseDirFile), settingsSource = !!tsconfig ? 'tsconfig.json' : 'Gruntfile ts `options`', settingsSection = !!tsconfig ? 'in the `compilerOptions` section' : 'under the task or ' +
            'target `options` object';
        if (!fs.existsSync(baseDirFilePath)) {
            var baseDir_Message = "// grunt-ts creates this file to help TypeScript find " +
                "the compilation root of your project.  If you wish to get to stop creating " +
                ("it, specify a `rootDir` setting in the " + settingsSource + ".  See ") +
                "https://github.com/TypeStrong/grunt-ts#rootdir for details.  Note that " +
                "`rootDir` goes under `options`, and is case-sensitive.  This message " +
                "was revised in grunt-ts v6.  Note that `rootDir` requires TypeScript 1.5 " +
                " or higher.";
            exports.grunt.file.write(baseDirFilePath, baseDir_Message);
        }
        if (tscVersion && semver.satisfies(tscVersion, '>=1.5.0')) {
            exports.grunt.log.warn(("Warning: created " + baseDirFilePath + " file because `outDir` was " +
                ("specified in the " + settingsSource + ", but not `rootDir`.  Add `rootDir` ") +
                (" " + settingsSection + " to fix this warning.")).magenta);
        }
        files.push(baseDirFilePath);
    }
    if (options.reference && compilationInfo.out) {
        var referenceFile = path.resolve(options.reference);
        files = [referenceFile];
    }
    files = _.map(files, function (item) { return utils.possiblyQuotedRelativePath(item); });
    var args = files.slice(0);
    exports.grunt.log.verbose.writeln("TypeScript path: " + tsc);
    if (tsconfig && tsconfig.passThrough) {
        args.push('--project', tsconfig.tsconfig);
    }
    else {
        if (options.sourceMap) {
            args.push('--sourcemap');
        }
        if (options.emitDecoratorMetadata) {
            args.push('--emitDecoratorMetadata');
        }
        if (options.declaration) {
            args.push('--declaration');
        }
        if (options.removeComments) {
            args.push('--removeComments');
        }
        if (options.noImplicitAny) {
            args.push('--noImplicitAny');
        }
        if (options.noResolve) {
            args.push('--noResolve');
        }
        if (options.noStrictGenericChecks) {
            args.push('--noStrictGenericChecks');
        }
        if (options.noEmitOnError) {
            args.push('--noEmitOnError');
        }
        if (options.preserveConstEnums) {
            args.push('--preserveConstEnums');
        }
        if (options.preserveSymlinks) {
            args.push('--preserveSymlinks');
        }
        if (options.suppressImplicitAnyIndexErrors) {
            args.push('--suppressImplicitAnyIndexErrors');
        }
        if (options.noEmit) {
            args.push('--noEmit');
        }
        if (options.inlineSources) {
            args.push('--inlineSources');
        }
        if (options.inlineSourceMap) {
            args.push('--inlineSourceMap');
        }
        if (options.newLine && !utils.newLineIsRedundantForTsc(options.newLine)) {
            args.push('--newLine', options.newLine);
        }
        if (options.isolatedModules) {
            args.push('--isolatedModules');
        }
        if (options.noEmitHelpers) {
            args.push('--noEmitHelpers');
        }
        if (options.experimentalDecorators) {
            args.push('--experimentalDecorators');
        }
        if (options.experimentalAsyncFunctions) {
            args.push('--experimentalAsyncFunctions');
        }
        if (options.jsx) {
            args.push('--jsx', options.jsx.toLocaleLowerCase());
        }
        if (options.moduleResolution) {
            args.push('--moduleResolution', options.moduleResolution.toLocaleLowerCase());
        }
        if (options.rootDir) {
            args.push('--rootDir', options.rootDir);
        }
        if (options.noLib) {
            args.push('--noLib');
        }
        if (options.emitBOM) {
            args.push('--emitBOM');
        }
        if (options.locale) {
            args.push('--locale', options.locale);
        }
        if (options.suppressExcessPropertyErrors) {
            args.push('--suppressExcessPropertyErrors');
        }
        if (options.stripInternal) {
            args.push('--stripInternal');
        }
        if (options.allowSyntheticDefaultImports) {
            args.push('--allowSyntheticDefaultImports');
        }
        if (options.reactNamespace) {
            args.push('--reactNamespace', options.reactNamespace);
        }
        if (options.skipLibCheck) {
            args.push('--skipLibCheck');
        }
        if (options.skipDefaultLibCheck) {
            args.push('--skipDefaultLibCheck');
        }
        if (options.pretty) {
            args.push('--pretty');
        }
        if (options.allowUnusedLabels) {
            args.push('--allowUnusedLabels');
        }
        if (options.noImplicitReturns) {
            args.push('--noImplicitReturns');
        }
        if (options.noFallthroughCasesInSwitch) {
            args.push('--noFallthroughCasesInSwitch');
        }
        if (options.allowUnreachableCode) {
            args.push('--allowUnreachableCode');
        }
        if (options.forceConsistentCasingInFileNames) {
            args.push('--forceConsistentCasingInFileNames');
        }
        if (options.allowJs) {
            args.push('--allowJs');
        }
        if (options.checkJs) {
            args.push('--checkJs');
        }
        if (options.noImplicitUseStrict) {
            args.push('--noImplicitUseStrict');
        }
        if (options.alwaysStrict) {
            args.push('--alwaysStrict');
        }
        if (options.diagnostics) {
            args.push('--diagnostics');
        }
        if (options.importHelpers) {
            args.push('--importHelpers');
        }
        if (options.listFiles) {
            args.push('--listFiles');
        }
        if (options.listEmittedFiles) {
            args.push('--listEmittedFiles');
        }
        if (options.noImplicitThis) {
            args.push('--noImplicitThis');
        }
        if (options.noUnusedLocals) {
            args.push('--noUnusedLocals');
        }
        if (options.noUnusedParameters) {
            args.push('--noUnusedParameters');
        }
        if (options.strictFunctionTypes) {
            args.push('--strictFunctionTypes');
        }
        if (options.esModuleInterop) {
            args.push('--esModuleInterop');
        }
        if (options.strictPropertyInitialization) {
            args.push('--strictPropertyInitialization');
        }
        if (options.strictNullChecks) {
            args.push('--strictNullChecks');
        }
        if (options.traceResolution) {
            args.push('--traceResolution');
        }
        if (options.baseUrl) {
            args.push('--baseUrl', utils.enclosePathInQuotesIfRequired(options.baseUrl));
        }
        if (options.charset) {
            args.push('--charset', options.charset);
        }
        if (options.declarationDir) {
            args.push('--declarationDir', utils.possiblyQuotedRelativePath(options.declarationDir));
        }
        if (options.jsxFactory) {
            args.push('--jsxFactory', options.jsxFactory);
        }
        if (options.lib) {
            var possibleOptions_1 = [
                'es5',
                'es6',
                'es2015',
                'es7',
                'es2016',
                'es2017',
                'esnext',
                'dom',
                'dom.iterable',
                'webworker',
                'scripthost',
                'es2015.core',
                'es2015.collection',
                'es2015.generator',
                'es2015.iterable',
                'es2015.promise',
                'es2015.proxy',
                'es2015.reflect',
                'es2015.symbol',
                'es2015.symbol.wellknown',
                'es2016.array.include',
                'es2017.object',
                'es2017.sharedmemory',
                'esnext.asynciterable'
            ];
            options.lib.forEach(function (option) {
                if (possibleOptions_1.indexOf((option + '').toLocaleLowerCase()) === -1) {
                    exports.grunt.log.warn(("WARNING: Option \"lib\" does not support " + option + " ").magenta);
                }
            });
            args.push('--lib', options.lib.join(','));
        }
        if (options.maxNodeModuleJsDepth > 0 || options.maxNodeModuleJsDepth === 0) {
            args.push('--maxNodeModuleJsDepth', options.maxNodeModuleJsDepth + '');
        }
        if (options.types) {
            args.push('--types', "\"" + _.map(options.types, function (t) { return utils.stripQuotesIfQuoted(t.trim()); }).join(',') + "\"");
        }
        if (options.typeRoots) {
            args.push('--typeRoots', "\"" + _.map(options.typeRoots, function (t) { return utils.stripQuotesIfQuoted(t.trim()); }).join(',') + "\"");
        }
        if (options.downlevelIteration) {
            args.push('--downlevelIteration');
        }
        if (options.disableSizeLimit) {
            args.push('--disableSizeLimit');
        }
        if (options.strict) {
            args.push('--strict');
        }
        args.push('--target', options.target.toUpperCase());
        if (options.module) {
            var moduleOptionString = ('' + options.module).toLowerCase();
            if ('none|amd|commonjs|system|umd|es6|es2015|esnext'.indexOf(moduleOptionString) > -1) {
                args.push('--module', moduleOptionString);
            }
            else {
                console.warn(('WARNING: Option "module" only supports "none" | "amd" | "commonjs" |' +
                    ' "system" | "umd" | "es6" | "es2015" | "esnext" ').magenta);
            }
        }
        if (compilationInfo.outDir) {
            if (compilationInfo.out) {
                console.warn('WARNING: Option "out" and "outDir" should not be used together'.magenta);
            }
            args.push('--outDir', compilationInfo.outDir);
        }
        if (compilationInfo.out) {
            args.push('--out', compilationInfo.out);
        }
        if (compilationInfo.dest && (!compilationInfo.out) && (!compilationInfo.outDir)) {
            if (utils.isJavaScriptFile(compilationInfo.dest)) {
                args.push('--out', compilationInfo.dest);
            }
            else {
                if (compilationInfo.dest === 'src') {
                    console.warn(('WARNING: Destination for target "' + options.targetName + '" is "src", which is the default.  If you have' +
                        ' forgotten to specify a "dest" parameter, please add it.  If this is correct, you may wish' +
                        ' to change the "dest" parameter to "src/" or just ignore this warning.').magenta);
                }
                if (Array.isArray(compilationInfo.dest)) {
                    if (compilationInfo.dest.length === 0) {
                    }
                    else if (compilationInfo.dest.length > 0) {
                        console.warn((('WARNING: "dest" for target "' + options.targetName + '" is an array.  This is not supported by the' +
                            ' TypeScript compiler or grunt-ts.' +
                            ((compilationInfo.dest.length > 1) ? '  Only the first "dest" will be used.  The' +
                                ' remaining items will be truncated.' : ''))).magenta);
                        args.push('--outDir', compilationInfo.dest[0]);
                    }
                }
                else {
                    args.push('--outDir', compilationInfo.dest);
                }
            }
        }
        if (args.indexOf('--out') > -1 && args.indexOf('--module') > -1) {
            if (tscVersion === '' && options.compiler) {
            }
            else if (semver.satisfies(tscVersion, '>=1.8.0')) {
                if ((options.module === 'system' || options.module === 'amd')) {
                }
                else {
                    console.warn(('WARNING: TypeScript 1.8+ requires "module" to be set to' +
                        'system or amd for concatenation of external modules to work.').magenta);
                }
            }
            else {
                console.warn(('WARNING: TypeScript < 1.8 does not allow external modules to be concatenated with' +
                    ' --out. Any exported code may be truncated.  See TypeScript issue #1544 for' +
                    ' more details.').magenta);
            }
        }
        if (options.sourceRoot) {
            args.push('--sourceRoot', options.sourceRoot);
        }
        if (options.mapRoot) {
            args.push('--mapRoot', options.mapRoot);
        }
    }
    if (options.additionalFlags) {
        args.push(options.additionalFlags);
    }
    function getTscVersion(tscPath) {
        var pkg = JSON.parse(fs.readFileSync(path.resolve(tscPath, '..', 'package.json')).toString());
        return '' + pkg.version;
    }
    if (options.verbose) {
        console.log(args.join(' ').yellow);
    }
    else {
        exports.grunt.log.verbose.writeln(args.join(' ').yellow);
    }
    var tempfilename = utils.getTempFile('tscommand', path.resolve(__dirname) + '/.tscache');
    if (!tempfilename) {
        throw (new Error('cannot create temp file'));
    }
    fs.writeFileSync(tempfilename, args.join(' '));
    var command;
    if ('testExecute' in options) {
        if (_.isFunction(options.testExecute)) {
            command = [tsc, args.join(' ')];
            executeNode = options.testExecute;
        }
        else {
            var invalidTestExecuteError = 'Invalid testExecute node present on target "' +
                options.targetName + '".  Value of testExecute must be a function.';
            throw (new Error(invalidTestExecuteError));
        }
    }
    else {
        command = [tsc, '@' + tempfilename];
        executeNode = executeNodeDefault;
    }
    return executeNode(command, options).then(function (result) {
        if (compileResultMeansFastCacheShouldBeRefreshed(options, result)) {
            resetChangedFiles(newFiles, options.targetName, options.tsCacheDir);
        }
        result.fileCount = files.length;
        fs.unlinkSync(tempfilename);
        exports.grunt.log.writeln(result.output);
        return es6_promise_1.Promise.cast(result);
    }, function (err) {
        fs.unlinkSync(tempfilename);
        throw err;
    });
}
exports.compileAllFiles = compileAllFiles;
//# sourceMappingURL=compile.js.map