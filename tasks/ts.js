'use strict';
var _ = require("lodash");
var path = require("path");
var fs = require("fs");
var es6_promise_1 = require("es6-promise");
var utils = require("./modules/utils");
var compileModule = require("./modules/compile");
var referenceModule = require("./modules/reference");
var amdLoaderModule = require("./modules/amdLoader");
var html2tsModule = require("./modules/html2ts");
var templateCacheModule = require("./modules/templateCache");
var transformers = require("./modules/transformers");
var optionsResolver = require("../tasks/modules/optionsResolver");
var asyncSeries = utils.asyncSeries, timeIt = utils.timeIt;
var fail_event = 'grunt-ts.failure';
var pluginFn = function (grunt) {
    grunt.registerMultiTask('ts', 'Compile TypeScript files', function () {
        var filesCompilationIndex = 0;
        var done, options;
        {
            var currentGruntTask = this;
            var resolvedFiles = currentGruntTask.files;
            done = currentGruntTask.async();
            var rawTaskConfig = (grunt.config.getRaw(currentGruntTask.name) || {});
            var rawTargetConfig = (grunt.config.getRaw(currentGruntTask.name + '.' + currentGruntTask.target) || {});
            optionsResolver.resolveAsync(rawTaskConfig, rawTargetConfig, currentGruntTask.target, resolvedFiles, grunt.template.process, grunt.file.expand, grunt.log.verbose.writeln).then(function (result) {
                options = result;
                options.warnings.forEach(function (warning) {
                    grunt.log.writeln(warning.magenta);
                });
                options.errors.forEach(function (error) {
                    grunt.log.writeln(error.red);
                });
                if (options.errors.length > 0) {
                    if (options.emitGruntEvents) {
                        grunt.event.emit(fail_event);
                    }
                    done(false);
                    return;
                }
                proceed();
            }).catch(function (error) {
                grunt.log.writeln((error + '').red);
                done(false);
            });
        }
        function proceed() {
            var srcFromVS_RelativePathsFromGruntFile = [];
            asyncSeries(options.CompilationTasks, function (currentFiles) {
                var reference = processIndividualTemplate(options.reference);
                var referenceFile;
                var referencePath;
                if (!!reference) {
                    referenceFile = path.resolve(reference);
                    referencePath = path.dirname(referenceFile);
                }
                function isReferenceFile(filename) {
                    return path.resolve(filename) === referenceFile;
                }
                var outFile = currentFiles.out;
                var outFile_d_ts;
                if (!!outFile) {
                    outFile = path.resolve(outFile);
                    outFile_d_ts = outFile.replace('.js', '.d.ts');
                }
                function isOutFile(filename) {
                    return path.resolve(filename) === outFile_d_ts;
                }
                function isBaseDirFile(filename, targetFiles) {
                    var baseDirFile = '.baseDir.ts';
                    var bd = options.baseDir || utils.findCommonPath(targetFiles, '/');
                    return path.resolve(filename) === path.resolve(path.join(bd, baseDirFile));
                }
                var amdloader = options.amdloader;
                var amdloaderFile, amdloaderPath;
                if (!!amdloader) {
                    amdloaderFile = path.resolve(amdloader);
                    amdloaderPath = path.dirname(amdloaderFile);
                }
                function runCompilation(options, compilationInfo) {
                    grunt.log.writeln('Compiling...'.yellow);
                    var starttime = new Date().getTime();
                    var endtime;
                    return compileModule.compileAllFiles(options, compilationInfo)
                        .then(function (result) {
                        endtime = new Date().getTime();
                        grunt.log.writeln('');
                        if (!result) {
                            grunt.log.error('Error: No result from tsc.'.red);
                            return false;
                        }
                        if (result.code === 8) {
                            grunt.log.error('Error: Node was unable to run tsc.  Possibly it could not be found?'.red);
                            return false;
                        }
                        var isError = (result.code !== 0);
                        var level1ErrorCount = 0, level5ErrorCount = 0, nonEmitPreventingWarningCount = 0;
                        var hasTS7017Error = false;
                        var hasPreventEmitErrors = _.reduce(result.output.split('\n'), function (memo, errorMsg) {
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
                        var isOnlyTypeErrors = !hasPreventEmitErrors;
                        if (hasTS7017Error) {
                            grunt.log.writeln(('Note:  You may wish to enable the suppressImplicitAnyIndexErrors' +
                                ' grunt-ts option to allow dynamic property access by index.  This will' +
                                ' suppress TypeScript error TS7017.').magenta);
                        }
                        if (level1ErrorCount + level5ErrorCount + nonEmitPreventingWarningCount > 0) {
                            if ((level1ErrorCount + level5ErrorCount > 0) || options.failOnTypeErrors) {
                                grunt.log.write(('>> ').red);
                            }
                            else {
                                grunt.log.write(('>> ').green);
                            }
                            if (level5ErrorCount > 0) {
                                grunt.log.write(level5ErrorCount.toString() + ' compiler flag error' +
                                    (level5ErrorCount === 1 ? '' : 's') + '  ');
                            }
                            if (level1ErrorCount > 0) {
                                grunt.log.write(level1ErrorCount.toString() + ' syntax error' +
                                    (level1ErrorCount === 1 ? '' : 's') + '  ');
                            }
                            if (nonEmitPreventingWarningCount > 0) {
                                grunt.log.write(nonEmitPreventingWarningCount.toString() +
                                    ' non-emit-preventing type warning' +
                                    (nonEmitPreventingWarningCount === 1 ? '' : 's') + '  ');
                            }
                            grunt.log.writeln('');
                            if (isOnlyTypeErrors && !options.failOnTypeErrors) {
                                grunt.log.write(('>> ').green);
                                grunt.log.writeln('Type errors only.');
                            }
                        }
                        var isSuccessfulBuild = (!isError ||
                            (isError && isOnlyTypeErrors && !options.failOnTypeErrors));
                        if (isSuccessfulBuild) {
                            var time = (endtime - starttime) / 1000;
                            grunt.log.writeln('');
                            var message = 'TypeScript compilation complete: ' + time.toFixed(2) + 's';
                            if (utils.shouldPassThrough(options)) {
                                message += ' for TypeScript pass-through.';
                            }
                            else {
                                message += ' for ' + result.fileCount + ' TypeScript files.';
                            }
                            grunt.log.writeln(message.green);
                        }
                        else {
                            grunt.log.error(('Error: tsc return code: ' + result.code).yellow);
                        }
                        return isSuccessfulBuild;
                    }).catch(function (err) {
                        grunt.log.writeln(('Error: ' + err).red);
                        if (options.emitGruntEvents) {
                            grunt.event.emit(fail_event);
                        }
                        return false;
                    });
                }
                function filterFilesTransformAndCompile() {
                    var filesToCompile = [];
                    if (currentFiles.src || options.vs) {
                        _.map(currentFiles.src, function (file) {
                            if (filesToCompile.indexOf(file) === -1) {
                                filesToCompile.push(file);
                            }
                        });
                        _.map(srcFromVS_RelativePathsFromGruntFile, function (file) {
                            if (filesToCompile.indexOf(file) === -1) {
                                filesToCompile.push(file);
                            }
                        });
                    }
                    else {
                        filesCompilationIndex += 1;
                    }
                    filesToCompile = filesToCompile.filter(function (file) {
                        var stats = fs.lstatSync(file);
                        return !stats.isDirectory() && !isOutFile(file) && !isBaseDirFile(file, filesToCompile);
                    });
                    var generatedFiles = [];
                    if (options.html) {
                        var html2tsOptions_1 = {
                            moduleFunction: _.template(options.htmlModuleTemplate),
                            varFunction: _.template(options.htmlVarTemplate),
                            htmlOutputTemplate: options.htmlOutputTemplate,
                            htmlOutDir: options.htmlOutDir,
                            flatten: options.htmlOutDirFlatten,
                            eol: (options.newLine || utils.eol)
                        };
                        var htmlFiles = grunt.file.expand(options.html);
                        generatedFiles = _.map(htmlFiles, function (filename) { return html2tsModule.compileHTML(filename, html2tsOptions_1); });
                        generatedFiles.forEach(function (fileName) {
                            if (filesToCompile.indexOf(fileName) === -1 &&
                                grunt.file.isMatch(currentFiles.glob, fileName)) {
                                filesToCompile.push(fileName);
                            }
                        });
                    }
                    if (options.templateCache) {
                        if (!options.templateCache.src || !options.templateCache.dest || !options.templateCache.baseUrl) {
                            grunt.log.writeln('templateCache : src, dest, baseUrl must be specified if templateCache option is used'.red);
                        }
                        else {
                            var templateCacheSrc = grunt.file.expand(options.templateCache.src);
                            var templateCacheDest = path.resolve(options.templateCache.dest);
                            var templateCacheBasePath = path.resolve(options.templateCache.baseUrl);
                            templateCacheModule.generateTemplateCache(templateCacheSrc, templateCacheDest, templateCacheBasePath, (options.newLine || utils.eol));
                        }
                    }
                    if (!!referencePath) {
                        var result = timeIt(function () {
                            return referenceModule.updateReferenceFile(filesToCompile.filter(function (f) { return !isReferenceFile(f); }), generatedFiles, referenceFile, referencePath, (options.newLine || utils.eol));
                        });
                        if (result.it === true) {
                            grunt.log.writeln(('Updated reference file (' + result.time + 'ms).').green);
                        }
                    }
                    if (!!amdloaderPath) {
                        var referenceOrder = amdLoaderModule.getReferencesInOrder(referenceFile, referencePath, generatedFiles);
                        amdLoaderModule.updateAmdLoader(referenceFile, referenceOrder, amdloaderFile, amdloaderPath, currentFiles.outDir);
                    }
                    transformers.transformFiles(filesToCompile, filesToCompile, options);
                    currentFiles.src = filesToCompile;
                    if (utils.shouldCompile(options)) {
                        if (filesToCompile.length > 0 || options.testExecute || utils.shouldPassThrough(options)) {
                            return runCompilation(options, currentFiles).then(function (success) {
                                return success;
                            });
                        }
                        else {
                            grunt.log.writeln('No files to compile'.red);
                            return es6_promise_1.Promise.resolve(true);
                        }
                    }
                    else {
                        return es6_promise_1.Promise.resolve(true);
                    }
                }
                var lastCompile = 0;
                if (!!options.watch) {
                    var watchpath = grunt.file.expand([options.watch]);
                    var chokidar = require('chokidar');
                    var watcher = chokidar.watch(watchpath, { ignoreInitial: true, persistent: true });
                    grunt.log.writeln(('Watching all TypeScript / Html files under : ' + watchpath).cyan);
                    watcher
                        .on('add', function (path) {
                        handleFileEvent(path, '+++ added   ');
                        lastCompile = new Date().getTime();
                    })
                        .on('change', function (path) {
                        handleFileEvent(path, '### changed ');
                        lastCompile = new Date().getTime();
                    })
                        .on('unlink', function (path) {
                        handleFileEvent(path, '--- removed ');
                        lastCompile = new Date().getTime();
                    })
                        .on('error', function (error) {
                        console.error('Error happened in chokidar: ', error);
                    });
                }
                lastCompile = new Date().getTime();
                return filterFilesTransformAndCompile();
                function handleFileEvent(filepath, displaystr) {
                    var acceptedExtentions = ['.ts', '.tsx', '.js', '.jsx', '.html'];
                    acceptedExtentions.forEach(function (extension) {
                        if (utils.endsWith(filepath.toLowerCase(), extension) && (new Date().getTime() - lastCompile) > 100) {
                            grunt.log.writeln((displaystr + ' >>' + filepath).yellow);
                            filterFilesTransformAndCompile();
                            return;
                        }
                    });
                }
            }).then(function (res) {
                if (!options.watch) {
                    if (res.some(function (success) {
                        return !success;
                    })) {
                        if (options.emitGruntEvents) {
                            grunt.event.emit(fail_event);
                        }
                        done(false);
                    }
                    else {
                        done();
                    }
                }
            }, done);
        }
    });
    function processIndividualTemplate(template) {
        if (template) {
            return grunt.template.process(template, {});
        }
        return template;
    }
};
module.exports = pluginFn;
//# sourceMappingURL=ts.js.map