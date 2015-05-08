/// <reference path="../defs/tsd.d.ts"/>
/// <reference path="./modules/interfaces.d.ts"/>
/// <reference path="../defs/csproj2ts/csproj2ts.d.ts" />
/*
 * grunt-ts
 * Licensed under the MIT license.
 */
// Typescript imports
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var csproj2ts = require('csproj2ts');
// Modules of grunt-ts
var utils = require('./modules/utils');
var compileModule = require('./modules/compile');
var referenceModule = require('./modules/reference');
var amdLoaderModule = require('./modules/amdLoader');
var html2tsModule = require('./modules/html2ts');
var templateCacheModule = require('./modules/templateCache');
var transformers = require('./modules/transformers');
// plain vanilla imports
var Promise = require('es6-promise').Promise;
/**
 * Time a function and print the result.
 *
 * @param makeIt the code to time
 * @returns the result of the block of code
 */
function timeIt(makeIt) {
    var starttime = new Date().getTime();
    var it = makeIt();
    var endtime = new Date().getTime();
    return {
        it: it,
        time: endtime - starttime
    };
}
/**
 * Run a map operation async in series (simplified)
 */
function asyncSeries(arr, iter) {
    arr = arr.slice(0);
    var memo = [];
    // Run one at a time
    return new Promise(function (resolve, reject) {
        var next = function () {
            if (arr.length === 0) {
                resolve(memo);
                return;
            }
            Promise.cast(iter(arr.shift())).then(function (res) {
                memo.push(res);
                next();
            }, reject);
        };
        next();
    });
}
function pluginFn(grunt) {
    /////////////////////////////////////////////////////////////////////
    // The grunt task
    ////////////////////////////////////////////////////////////////////
    // Note: this function is called once for each target
    // so task + target options are a bit blurred inside this function
    grunt.registerMultiTask('ts', 'Compile TypeScript files', function () {
        var currenttask = this;
        // make async
        var done = currenttask.async();
        var watch;
        // tracks which index in the task "files" property is next for processing
        var filesCompilationIndex = 0;
        // setup default options
        var options = currenttask.options({
            allowBool: false,
            allowImportModule: false,
            compile: true,
            declaration: false,
            mapRoot: '',
            module: null,
            noImplicitAny: false,
            noResolve: false,
            comments: null,
            removeComments: null,
            sourceMap: true,
            sourceRoot: '',
            target: 'es5',
            verbose: false,
            fast: 'watch',
            compiler: '',
            htmlCwd: '',
            htmlUseQuotesForContent: true,
            htmlModuleTemplate: '<%= filename %>',
            htmlVarTemplate: '<%= ext %>',
            htmlOutDir: null,
            htmlOutDirFlatten: false,
            failOnTypeErrors: true,
            noEmitOnError: false,
            preserveConstEnums: false,
            suppressImplicitAnyIndexErrors: false
        });
        // get unprocessed templates from configuration
        var rawTaskOptions = (grunt.config.getRaw(currenttask.name + '.options') || {});
        var rawTargetConfig = (grunt.config.getRaw(currenttask.name + '.' + currenttask.target) || {});
        var rawTargetOptions = (grunt.config.getRaw(currenttask.name + '.' + currenttask.target + '.options') || {});
        var vs = getVSSettings(rawTargetConfig);
        if (vs) {
            csproj2ts.getTypeScriptSettings({
                ProjectFileName: vs.project,
                ActiveConfiguration: vs.config || undefined
            }).then(function (vsConfig) {
                proceed(vsConfig);
            }).catch(function (error) {
                var errormessage;
                if (error.errno === 34) {
                    errormessage = 'In task "' + currenttask.target + '" - could not find VS project at "' + error.path + '".';
                }
                else {
                    errormessage = 'In task "' + currenttask.target + '".  Error #' + error.errno + '.  ' + error;
                }
                grunt.fail.warn(errormessage, error.errno);
                done(error);
            });
        }
        else {
            proceed();
        }
        function proceed(vsProjectTypeScriptSettings) {
            if (vsProjectTypeScriptSettings && !vs.ignoreSettings) {
                options.declaration = utils.firstElementWithValue([vsProjectTypeScriptSettings.GeneratesDeclarations, options.declaration]);
                options.mapRoot = utils.firstElementWithValue([vsProjectTypeScriptSettings.MapRoot, options.mapRoot]);
                options.module = utils.firstElementWithValue([vsProjectTypeScriptSettings.ModuleKind, options.module]);
                if (options.module === 'none') {
                    options.module = null;
                }
                options.noEmitOnError = utils.firstElementWithValue([vsProjectTypeScriptSettings.NoEmitOnError, options.noEmitOnError]);
                options.noImplicitAny = utils.firstElementWithValue([vsProjectTypeScriptSettings.NoImplicitAny, options.noImplicitAny]);
                options.noResolve = utils.firstElementWithValue([vsProjectTypeScriptSettings.NoResolve, options.noResolve]);
                rawTargetConfig.outDir = utils.firstElementWithValue([vsProjectTypeScriptSettings.OutDir, rawTargetConfig.outDir]);
                rawTargetConfig.out = utils.firstElementWithValue([vsProjectTypeScriptSettings.OutFile, rawTargetConfig.out]);
                options.preserveConstEnums = utils.firstElementWithValue([vsProjectTypeScriptSettings.PreserveConstEnums, options.preserveConstEnums]);
                options.removeComments = utils.firstElementWithValue([vsProjectTypeScriptSettings.RemoveComments, options.removeComments]);
                if (options.removeComments) {
                    options.comments = null;
                }
                else {
                    options.comments = true;
                }
                options.sourceMap = utils.firstElementWithValue([vsProjectTypeScriptSettings.SourceMap, options.sourceMap]);
                options.sourceRoot = utils.firstElementWithValue([vsProjectTypeScriptSettings.SourceRoot, options.sourceRoot]);
                options.suppressImplicitAnyIndexErrors = utils.firstElementWithValue([vsProjectTypeScriptSettings.SuppressImplicitAnyIndexErrors, options.suppressImplicitAnyIndexErrors]);
                options.target = utils.firstElementWithValue([vsProjectTypeScriptSettings.Target, options.target]);
            }
            var srcFromVS_RelativePathsFromGruntFile = [];
            if (vsProjectTypeScriptSettings) {
                // make all VS project paths relative to the gruntfile.
                var absolutePathToVSProjectFolder = path.resolve(vsProjectTypeScriptSettings.VSProjectDetails.ProjectFileName, '..');
                if (!vs.ignoreFiles) {
                    _.map(_.uniq(vsProjectTypeScriptSettings.files), function (file) {
                        var absolutePathToFile = path.normalize(path.join(absolutePathToVSProjectFolder, file));
                        var relativePathToFile = path.relative(path.resolve('.'), absolutePathToFile).replace(new RegExp('\\' + path.sep, 'g'), '/');
                        if (srcFromVS_RelativePathsFromGruntFile.indexOf(relativePathToFile) === -1 && currenttask.filesSrc.indexOf(relativePathToFile) === -1) {
                            srcFromVS_RelativePathsFromGruntFile.push(relativePathToFile);
                        }
                    });
                    if (srcFromVS_RelativePathsFromGruntFile.length > 0) {
                        currenttask.files.push({ src: srcFromVS_RelativePathsFromGruntFile });
                    }
                }
                if (!vs.ignoreSettings) {
                    if (vsProjectTypeScriptSettings.OutDir) {
                        rawTargetConfig.outDir = path.relative(path.resolve('.'), path.normalize(path.join(absolutePathToVSProjectFolder, vsProjectTypeScriptSettings.OutDir)));
                    }
                    if (vsProjectTypeScriptSettings.OutFile) {
                        rawTargetConfig.out = path.relative(path.resolve('.'), path.normalize(path.join(absolutePathToVSProjectFolder, vsProjectTypeScriptSettings.OutFile)));
                    }
                }
            }
            options.htmlCwd = rawTargetOptions.htmlCwd || rawTaskOptions.htmlCwd;
            options.htmlUseQuotesForContent = rawTargetOptions.htmlUseQuotesForContent || rawTaskOptions.htmlUseQuotesForContent;
            options.htmlModuleTemplate = rawTargetOptions.htmlModuleTemplate || rawTaskOptions.htmlModuleTemplate;
            options.htmlVarTemplate = rawTargetOptions.htmlVarTemplate || rawTaskOptions.htmlVarTemplate;
            options.htmlOutDir = rawTargetConfig.htmlOutDir;
            options.htmlOutDirFlatten = rawTargetConfig.htmlOutDirFlatten;
            // fix the properly cased options to their appropriate values
            options.allowBool = 'allowbool' in options ? options['allowbool'] : options.allowBool;
            options.allowImportModule = 'allowimportmodule' in options ? options['allowimportmodule'] : options.allowImportModule;
            options.sourceMap = 'sourcemap' in options ? options['sourcemap'] : options.sourceMap;
            // Warn the user of invalid values
            if (options.fast !== 'watch' && options.fast !== 'always' && options.fast !== 'never') {
                console.warn(('"fast" needs to be one of : "watch" (default) | "always" | "never" but you provided: ' + options.fast).magenta);
                if (currenttask.files) {
                    options.fast = 'never'; // to keep things simple, we are not supporting fast with files.
                }
                else {
                    options.fast = 'watch';
                }
            }
            if ((options.fast === 'watch' || options.fast === 'always') && rawTargetConfig.files) {
                grunt.log.writeln(('Warning: Task "' + currenttask.target + '" is attempting to use fast compilation with "files".  This is not currently supported.  Setting "fast" to "never".').magenta);
                options.fast = 'never';
            }
            logBadConfigWithFiles(rawTargetConfig, currenttask, rawTargetOptions);
            if (!options.htmlCwd) {
                // use default value
                options.htmlCwd = '';
            }
            if (!options.htmlModuleTemplate) {
                // use default value
                options.htmlModuleTemplate = '<%= filename %>';
            }
            if (!options.htmlVarTemplate) {
                // use default value
                options.htmlVarTemplate = '<%= ext %>';
            }
            if (!options.htmlOutDir) {
                // use default value
                options.htmlOutDir = null;
            }
            if (!options.htmlOutDirFlatten) {
                // use default value
                options.htmlOutDirFlatten = false;
            }
            // Remove comments based on the removeComments flag first then based on the comments flag, otherwise true
            if (options.removeComments === null) {
                options.removeComments = !options.comments;
            }
            else if (options.comments !== null && !vs) {
                console.warn('WARNING: Option "comments" and "removeComments" should not be used together'.magenta);
                if (options.removeComments === options.comments) {
                    console.warn('Either option will suffice (and removing the other will have no effect).'.magenta);
                }
                else {
                    console.warn(('The --removeComments value of "' + options.removeComments + '" ' + 'supercedes the --comments value of "' + options.comments + '"').magenta);
                }
            }
            options.removeComments = !!options.removeComments;
            if (currenttask.files.length === 0 && rawTargetOptions.compile) {
                grunt.log.writeln('Zero files found to compile in target "' + currenttask.target + '". Compilation will be skipped.');
            }
            // Run compiler
            asyncSeries(currenttask.files, function (target) {
                // Create a reference file?
                var reference = rawTargetConfig.reference;
                var referenceFile;
                var referencePath;
                if (!!reference) {
                    referenceFile = path.resolve(reference);
                    referencePath = path.dirname(referenceFile);
                }
                function isReferenceFile(filename) {
                    return path.resolve(filename) === referenceFile;
                }
                function fetchTargetOutOrElseTryTargetDest(target) {
                    var targetout = target.out;
                    if (!targetout) {
                        if (target.dest) {
                            if (Array.isArray(target.dest)) {
                                if (target.dest.length > 0) {
                                    // A dest array is meaningless in TypeScript, so just take
                                    // the first one.
                                    targetout = target.dest[0];
                                }
                            }
                            else if (utils.isJavaScriptFile(target.dest)) {
                                targetout = target.dest;
                            }
                        }
                    }
                    return targetout;
                }
                // Create an output file?
                var outFile = fetchTargetOutOrElseTryTargetDest(rawTargetConfig);
                var outFile_d_ts;
                if (!!outFile) {
                    outFile = path.resolve(rawTargetConfig.out);
                    outFile_d_ts = outFile.replace('.js', '.d.ts');
                }
                function isOutFile(filename) {
                    return path.resolve(filename) === outFile_d_ts;
                }
                // see https://github.com/grunt-ts/grunt-ts/issues/77
                function isBaseDirFile(filename, targetFiles) {
                    var baseDirFile = '.baseDir.ts';
                    var bd = '';
                    if (!rawTargetConfig.baseDir) {
                        bd = utils.findCommonPath(targetFiles, '/');
                        rawTargetConfig.baseDir = bd;
                    }
                    return path.resolve(filename) === path.resolve(path.join(bd, baseDirFile));
                }
                // Create an amd loader?
                var amdloader = rawTargetConfig.amdloader;
                var amdloaderFile;
                var amdloaderPath;
                if (!!amdloader) {
                    amdloaderFile = path.resolve(amdloader);
                    amdloaderPath = path.dirname(amdloaderFile);
                }
                processAllTemplates(rawTargetConfig, rawTargetOptions);
                // Compiles all the files
                // Uses the blind tsc compile task
                // logs errors
                function runCompilation(files, target, options) {
                    // Don't run it yet
                    grunt.log.writeln('Compiling...'.yellow);
                    // The files to compile
                    var filesToCompile = files;
                    // Time the compiler process
                    var starttime = new Date().getTime();
                    var endtime;
                    // Compile the files
                    return compileModule.compileAllFiles(filesToCompile, target, options, currenttask.target).then(function (result) {
                        // End the timer
                        endtime = new Date().getTime();
                        grunt.log.writeln('');
                        // Analyze the results of our tsc execution,
                        //   then tell the user our analysis results
                        //   and mark the build as fail or success
                        if (!result) {
                            grunt.log.error('Error: No result from tsc.'.red);
                            return false;
                        }
                        if (result.code === 8) {
                            grunt.log.error('Error: Node was unable to run tsc.  Possibly it could not be found?'.red);
                            return false;
                        }
                        // In TypeScript 1.3 and above, the result code corresponds to the ExitCode enum in 
                        //   TypeScript/src/compiler/sys.ts
                        var isError = (result.code !== 0);
                        // If the compilation errors contain only type errors, JS files are still
                        //   generated. If tsc finds type errors, it will return an error code, even
                        //   if JS files are generated. We should check this for this,
                        //   only type errors, and call this a successful compilation.
                        // Assumptions:
                        //   Level 1 errors = syntax errors - prevent JS emit.
                        //   Level 2 errors = semantic errors - *not* prevents JS emit.
                        //   Level 5 errors = compiler flag misuse - prevents JS emit.
                        var level1ErrorCount = 0, level5ErrorCount = 0, nonEmitPreventingWarningCount = 0;
                        var hasTS7017Error = false;
                        var hasPreventEmitErrors = _.foldl(result.output.split('\n'), function (memo, errorMsg) {
                            var isPreventEmitError = false;
                            if (errorMsg.search(/error TS7017:/g) >= 0) {
                                hasTS7017Error = true;
                            }
                            if (errorMsg.search(/error TS1\d+:/g) >= 0) {
                                level1ErrorCount += 1;
                                isPreventEmitError = true;
                            }
                            else if (errorMsg.search(/error TS5\d+:/) >= 0) {
                                level5ErrorCount += 1;
                                isPreventEmitError = true;
                            }
                            else if (errorMsg.search(/error TS\d+:/) >= 0) {
                                nonEmitPreventingWarningCount += 1;
                            }
                            return memo || isPreventEmitError;
                        }, false) || false;
                        // Because we can't think of a better way to determine it,
                        //   assume that emitted JS in spite of error codes implies type-only errors.
                        var isOnlyTypeErrors = !hasPreventEmitErrors;
                        if (hasTS7017Error) {
                            grunt.log.writeln(('Note:  You may wish to enable the suppressImplicitAnyIndexErrors' + ' grunt-ts option to allow dynamic property access by index.  This will' + ' suppress TypeScript error TS7017.').magenta);
                        }
                        // Log error summary
                        if (level1ErrorCount + level5ErrorCount + nonEmitPreventingWarningCount > 0) {
                            if ((level1ErrorCount + level5ErrorCount > 0) || options.failOnTypeErrors) {
                                grunt.log.write(('>> ').red);
                            }
                            else {
                                grunt.log.write(('>> ').green);
                            }
                            if (level5ErrorCount > 0) {
                                grunt.log.write(level5ErrorCount.toString() + ' compiler flag error' + (level5ErrorCount === 1 ? '' : 's') + '  ');
                            }
                            if (level1ErrorCount > 0) {
                                grunt.log.write(level1ErrorCount.toString() + ' syntax error' + (level1ErrorCount === 1 ? '' : 's') + '  ');
                            }
                            if (nonEmitPreventingWarningCount > 0) {
                                grunt.log.write(nonEmitPreventingWarningCount.toString() + ' non-emit-preventing type warning' + (nonEmitPreventingWarningCount === 1 ? '' : 's') + '  ');
                            }
                            grunt.log.writeln('');
                            if (isOnlyTypeErrors && !options.failOnTypeErrors) {
                                grunt.log.write(('>> ').green);
                                grunt.log.writeln('Type errors only.');
                            }
                        }
                        // !!! To do: To really be confident that the build was actually successful,
                        //   we have to check timestamps of the generated files in the destination.
                        var isSuccessfulBuild = (!isError || (isError && isOnlyTypeErrors && !options.failOnTypeErrors));
                        if (isSuccessfulBuild) {
                            // Report successful build.
                            var time = (endtime - starttime) / 1000;
                            grunt.log.writeln('');
                            grunt.log.writeln(('TypeScript compilation complete: ' + time.toFixed(2) + 's for ' + result.fileCount + ' typescript files').green);
                        }
                        else {
                            // Report unsuccessful build.
                            grunt.log.error(('Error: tsc return code: ' + result.code).yellow);
                        }
                        return isSuccessfulBuild;
                    });
                }
                // Find out which files to compile, codegen etc. 
                // Then calls the appropriate functions + compile function on those files
                function filterFilesAndCompile() {
                    var filesToCompile = [];
                    if (currenttask.data.src || currenttask.data.vs) {
                        // Reexpand the original file glob
                        if (currenttask.data.src) {
                            filesToCompile = grunt.file.expand(currenttask.data.src);
                        }
                        _.map(srcFromVS_RelativePathsFromGruntFile, function (file) {
                            if (filesToCompile.indexOf(file) === -1) {
                                filesToCompile.push(file);
                            }
                        });
                    }
                    else {
                        if (_.isArray(currenttask.data.files)) {
                            filesToCompile = grunt.file.expand(currenttask.data.files[filesCompilationIndex].src);
                            filesCompilationIndex += 1;
                        }
                        else if (currenttask.data.files[target.dest]) {
                            filesToCompile = grunt.file.expand(currenttask.data.files[target.dest]);
                        }
                        else {
                            filesToCompile = grunt.file.expand([currenttask.data.files.src]);
                        }
                    }
                    // ignore directories, and clear the files of output.d.ts and baseDirFile
                    filesToCompile = filesToCompile.filter(function (file) {
                        var stats = fs.lstatSync(file);
                        return !stats.isDirectory() && !isOutFile(file) && !isBaseDirFile(file, filesToCompile);
                    });
                    ///// Html files:
                    // Note:
                    //    compile html files must be before reference file creation
                    var generatedFiles = [];
                    if (currenttask.data.html) {
                        var html2tsOptions = {
                            cwd: options.htmlCwd,
                            useQuotes: options.htmlUseQuotesForContent,
                            moduleFunction: _.template(options.htmlModuleTemplate),
                            varFunction: _.template(options.htmlVarTemplate),
                            htmlOutDir: options.htmlOutDir,
                            flatten: options.htmlOutDirFlatten
                        };
                        var htmlFiles = grunt.file.expand(currenttask.data.html);
                        generatedFiles = _.map(htmlFiles, function (filename) { return html2tsModule.compileHTML(filename, html2tsOptions); });
                    }
                    ///// Template cache
                    // Note: The template cache files do not go into generated files.
                    // Note: You are free to generate a `ts OR js` file for template cache, both should just work
                    if (currenttask.data.templateCache) {
                        if (!currenttask.data.templateCache.src || !currenttask.data.templateCache.dest || !currenttask.data.templateCache.baseUrl) {
                            grunt.log.writeln('templateCache : src, dest, baseUrl must be specified if templateCache option is used'.red);
                        }
                        else {
                            var templateCacheSrc = grunt.file.expand(currenttask.data.templateCache.src); // manual reinterpolation
                            var templateCacheDest = path.resolve(rawTargetConfig.templateCache.dest);
                            var templateCacheBasePath = path.resolve(rawTargetConfig.templateCache.baseUrl);
                            templateCacheModule.generateTemplateCache(templateCacheSrc, templateCacheDest, templateCacheBasePath);
                        }
                    }
                    ///// Reference File
                    // Generate the reference file
                    // Create a reference file if specified
                    if (!!referencePath) {
                        var result = timeIt(function () {
                            return referenceModule.updateReferenceFile(filesToCompile.filter(function (f) { return !isReferenceFile(f); }), generatedFiles, referenceFile, referencePath);
                        });
                        if (result.it === true) {
                            grunt.log.writeln(('Updated reference file (' + result.time + 'ms).').green);
                        }
                    }
                    ///// AMD loader
                    // Create the amdLoader if specified 
                    if (!!amdloaderPath) {
                        var referenceOrder = amdLoaderModule.getReferencesInOrder(referenceFile, referencePath, generatedFiles);
                        amdLoaderModule.updateAmdLoader(referenceFile, referenceOrder, amdloaderFile, amdloaderPath, rawTargetConfig.outDir);
                    }
                    // Transform files as needed. Currently all of this logic in is one module
                    transformers.transformFiles(filesToCompile, filesToCompile, rawTargetConfig, options);
                    // Return promise to compliation
                    if (options.compile) {
                        // Compile, if there are any files to compile!
                        if (filesToCompile.length > 0) {
                            return runCompilation(filesToCompile, rawTargetConfig, options).then(function (success) {
                                return success;
                            });
                        }
                        else {
                            grunt.log.writeln('No files to compile'.red);
                            return Promise.resolve(true);
                        }
                    }
                    else {
                        return Promise.resolve(true);
                    }
                }
                // Time (in ms) when last compile took place
                var lastCompile = 0;
                if (rawTargetConfig.files && rawTargetConfig.watch) {
                    grunt.log.writeln(('WARNING: Use of "files" with "watch" in target ' + currenttask.target + ' is not supported in grunt-ts.  The "watch" will be ignored.  Use "src", or use grunt-contrib-watch' + ' if you really do need to use "files".').magenta);
                }
                // Watch a folder?
                watch = rawTargetConfig.watch;
                if (!!watch) {
                    // local event to handle file event
                    function handleFileEvent(filepath, displaystr, addedOrChanged) {
                        if (addedOrChanged === void 0) { addedOrChanged = false; }
                        // Only ts and html :
                        if (!utils.endsWith(filepath.toLowerCase(), '.ts') && !utils.endsWith(filepath.toLowerCase(), '.html')) {
                            return;
                        }
                        // Do not run if just ran, behaviour same as grunt-watch
                        // These are the files our run modified
                        if ((new Date().getTime() - lastCompile) <= 100) {
                            // Uncomment for debugging which files were ignored
                            // grunt.log.writeln((' ///'  + ' >>' + filepath).grey);
                            return;
                        }
                        // Log and run the debounced version.
                        grunt.log.writeln((displaystr + ' >>' + filepath).yellow);
                        filterFilesAndCompile();
                    }
                    // get path(s)
                    var watchpath = grunt.file.expand(watch);
                    // create a file watcher for path
                    var chokidar = require('chokidar');
                    var watcher = chokidar.watch(watchpath, { ignoreInitial: true, persistent: true });
                    // Log what we are doing
                    grunt.log.writeln(('Watching all TypeScript / Html files under : ' + watchpath).cyan);
                    // A file has been added/changed/deleted has occurred
                    watcher.on('add', function (path) {
                        handleFileEvent(path, '+++ added   ', true);
                        // Reset the time for last compile call
                        lastCompile = new Date().getTime();
                    }).on('change', function (path) {
                        handleFileEvent(path, '### changed ', true);
                        // Reset the time for last compile call
                        lastCompile = new Date().getTime();
                    }).on('unlink', function (path) {
                        handleFileEvent(path, '--- removed ');
                        // Reset the time for last compile call
                        lastCompile = new Date().getTime();
                    }).on('error', function (error) {
                        console.error('Error happened in chokidar: ', error);
                    });
                }
                // Reset the time for last compile call
                lastCompile = new Date().getTime();
                // Run initial compile
                return filterFilesAndCompile();
            }).then(function (res) {
                // Ignore res? (either logs or throws)
                if (!watch) {
                    if (res.some(function (succes) {
                        return !succes;
                    })) {
                        done(false);
                    }
                    else {
                        done();
                    }
                }
            }, done);
        }
    });
    function logBadConfigWithFiles(config, task, targetOpt) {
        if (config.files) {
            if (config.vs) {
                grunt.log.writeln(('Warning: In task "' + task.target + '", either "files" or "vs" should be used - not both.').magenta);
                return;
            }
            if (config.src) {
                grunt.log.writeln(('Warning: In task "' + task.target + '", either "files" or "src" should be used - not both.').magenta);
                return;
            }
            if (config.out) {
                grunt.log.writeln(('Warning: In task "' + task.target + '", either "files" or "out" should be used - not both.').magenta);
                return;
            }
            if (config.outDir) {
                grunt.log.writeln(('Warning: In task "' + task.target + '", either "files" or "outDir" should be used - not both.').magenta);
                return;
            }
        }
        else {
            if (!config.src && !config.vs && targetOpt.compile) {
                grunt.log.writeln(('Warning: In task "' + task.target + '", neither "files" nor "src" nor "vs" is specified.  Nothing will be compiled.').magenta);
                return;
            }
        }
    }
    function processAllTemplates(targetCfg, targetOpt) {
        targetCfg.out = processTemplate(targetCfg.out);
        targetCfg.outDir = processTemplate(targetCfg.outDir);
        targetCfg.reference = processTemplate(targetCfg.reference);
        targetOpt.mapRoot = processTemplate(targetOpt.mapRoot);
        targetOpt.sourceRoot = processTemplate(targetOpt.sourceRoot);
    }
    function processTemplate(template) {
        if (template) {
            return grunt.template.process(template, {});
        }
        return template;
    }
    function getVSSettings(rawTargetOptions) {
        var vs = null;
        if (rawTargetOptions.vs) {
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
}
module.exports = pluginFn;
//# sourceMappingURL=ts.js.map