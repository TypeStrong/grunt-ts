/// <reference path="../defs/tsd.d.ts"/>
/// <reference path="./modules/interfaces.d.ts"/>

'use strict';

/*
 * grunt-ts
 * Licensed under the MIT license.
 */

import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import {Promise} from 'es6-promise';
import * as utils from './modules/utils';
import * as compileModule from './modules/compile';
import * as referenceModule from './modules/reference';
import * as amdLoaderModule from './modules/amdLoader';
import * as html2tsModule from './modules/html2ts';
import * as templateCacheModule from './modules/templateCache';
import * as transformers from './modules/transformers';
import * as optionsResolver from '../tasks/modules/optionsResolver';
const {asyncSeries, timeIt} = utils;
const fail_event = 'grunt-ts.failure';


const pluginFn = function (grunt: IGrunt) {

    /////////////////////////////////////////////////////////////////////
    // The grunt task
    ////////////////////////////////////////////////////////////////////
    grunt.registerMultiTask('ts', 'Compile TypeScript files', function () {

        // tracks which index in the task "files" property is next for processing
        let filesCompilationIndex = 0;

        let done: grunt.task.AsyncResultCatcher,
          options: IGruntTSOptions;

        {
          const currentGruntTask: grunt.task.IMultiTask<ITargetOptions> = this;
          const resolvedFiles: IGruntTSCompilationInfo[] = currentGruntTask.files;
          // make async
          done = currentGruntTask.async();

          // get unprocessed templates from configuration
          let rawTaskConfig =
             <ITargetOptions>(grunt.config.getRaw(currentGruntTask.name) || {});
          let rawTargetConfig =
            <ITargetOptions>(grunt.config.getRaw(currentGruntTask.name + '.' + currentGruntTask.target) || {});

          optionsResolver.resolveAsync(rawTaskConfig, rawTargetConfig, currentGruntTask.target, resolvedFiles,
              grunt.template.process, grunt.file.expand, grunt.log.verbose.writeln).then((result) => {
            options = result;

            options.warnings.forEach((warning) => {
              grunt.log.writeln(warning.magenta);
            });

            options.errors.forEach((error) => {
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
          }).catch((error) => {
            grunt.log.writeln((error + '').red);
            done(false);
          });

        }


        function proceed() {

            var srcFromVS_RelativePathsFromGruntFile: string[] = [];

            // Run compiler
            asyncSeries(options.CompilationTasks, (currentFiles) => {

                // Create a reference file?
                var reference = processIndividualTemplate(options.reference);
                var referenceFile;
                var referencePath;
                if (!!reference) {
                    referenceFile = path.resolve(reference);
                    referencePath = path.dirname(referenceFile);
                }
                function isReferenceFile(filename: string) {
                    return path.resolve(filename) === referenceFile;
                }

                // Create an output file?
                var outFile = currentFiles.out;
                var outFile_d_ts: string;

                if (!!outFile) {
                    outFile = path.resolve(outFile);
                    outFile_d_ts = outFile.replace('.js', '.d.ts');
                }
                function isOutFile(filename: string): boolean {
                    return path.resolve(filename) === outFile_d_ts;
                }

                // see https://github.com/grunt-ts/grunt-ts/issues/77
                function isBaseDirFile(filename: string, targetFiles: string[]) {

                    var baseDirFile: string = '.baseDir.ts';
                    var bd = options.baseDir || utils.findCommonPath(targetFiles, '/');

                    return path.resolve(filename) === path.resolve(path.join(bd, baseDirFile));
                }

                // Create an amd loader?
                let amdloader = options.amdloader;
                let amdloaderFile: string, amdloaderPath: string;
                if (!!amdloader) {
                    amdloaderFile = path.resolve(amdloader);
                    amdloaderPath = path.dirname(amdloaderFile);
                }

                // Compiles all the files
                // Uses the blind tsc compile task
                // logs errors
                function runCompilation(options: IGruntTSOptions, compilationInfo: IGruntTSCompilationInfo): Promise<boolean> {
                    grunt.log.writeln('Compiling...'.yellow);

                    // Time the compiler process
                    var starttime = new Date().getTime();
                    var endtime;

                    // Compile the files
                    return compileModule.compileAllFiles(options, compilationInfo)
                        .then((result: ICompileResult) => {
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
                        var hasPreventEmitErrors = _.reduce(result.output.split('\n'), (memo, errorMsg) => {
                            var isPreventEmitError = false;
                            if (errorMsg.search(/error TS7017:/g) >= 0) {
                                hasTS7017Error = true;
                            }
                            if (errorMsg.search(/error TS1\d+:/g) >= 0) {
                                level1ErrorCount += 1;
                                isPreventEmitError = true;
                            } else if (errorMsg.search(/error TS5\d+:/) >= 0) {
                                level5ErrorCount += 1;
                                isPreventEmitError = true;
                            } else if (errorMsg.search(/error TS\d+:/) >= 0) {
                                nonEmitPreventingWarningCount += 1;
                            }
                            return memo || isPreventEmitError;
                        }, false) || false;

                        // Because we can't think of a better way to determine it,
                        //   assume that emitted JS in spite of error codes implies type-only errors.
                        var isOnlyTypeErrors = !hasPreventEmitErrors;

                        if (hasTS7017Error) {
                            grunt.log.writeln(('Note:  You may wish to enable the suppressImplicitAnyIndexErrors' +
                                ' grunt-ts option to allow dynamic property access by index.  This will' +
                                ' suppress TypeScript error TS7017.').magenta);
                        }

                        // Log error summary
                        if (level1ErrorCount + level5ErrorCount + nonEmitPreventingWarningCount > 0) {
                            if ((level1ErrorCount + level5ErrorCount > 0) || options.failOnTypeErrors) {
                                grunt.log.write(('>> ').red);
                            } else {
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

                        // !!! To do: To really be confident that the build was actually successful,
                        //   we have to check timestamps of the generated files in the destination.
                        var isSuccessfulBuild = (!isError ||
                            (isError && isOnlyTypeErrors && !options.failOnTypeErrors)
                            );

                        if (isSuccessfulBuild) {
                            // Report successful build.
                            let time = (endtime - starttime) / 1000;
                            grunt.log.writeln('');
                            let message = 'TypeScript compilation complete: ' + time.toFixed(2) + 's';
                            if (utils.shouldPassThrough(options)) {
                              message += ' for TypeScript pass-through.';
                            } else {
                              message += ' for ' + result.fileCount + ' TypeScript files.';
                            }
                            grunt.log.writeln(message.green);
                        } else {
                            // Report unsuccessful build.
                            grunt.log.error(('Error: tsc return code: ' + result.code).yellow);
                        }

                        return isSuccessfulBuild;
                    }).catch(function(err) {
                      grunt.log.writeln(('Error: ' + err).red);
                      if (options.emitGruntEvents) {
                        grunt.event.emit(fail_event);
                      }
                      return false;
                    });
                }

                // Find out which files to compile, codegen etc.
                // Then calls the appropriate functions + compile function on those files
                function filterFilesTransformAndCompile(): Promise<boolean> {

                    var filesToCompile: string[] = [];

                    if (currentFiles.src || options.vs) {

                        _.map(currentFiles.src, (file) => {
                          if (filesToCompile.indexOf(file) === -1) {
                              filesToCompile.push(file);
                          }
                        });

                        _.map(srcFromVS_RelativePathsFromGruntFile, (file) => {
                            if (filesToCompile.indexOf(file) === -1) {
                                filesToCompile.push(file);
                            }
                        });

                    } else {
                        filesCompilationIndex += 1;
                    }

                    // ignore directories, and clear the files of output.d.ts and baseDirFile
                    filesToCompile = filesToCompile.filter((file) => {
                        var stats = fs.lstatSync(file);
                        return !stats.isDirectory() && !isOutFile(file) && !isBaseDirFile(file, filesToCompile);
                    });


                    ///// Html files:
                    // Note:
                    //    compile html files must be before reference file creation
                    var generatedFiles = [];
                    if (options.html) {
                        let html2tsOptions : html2tsModule.IHtml2TSOptions = {
                            moduleFunction: _.template(options.htmlModuleTemplate),
                            varFunction: _.template(options.htmlVarTemplate),
                            htmlOutputTemplate: options.htmlOutputTemplate,
                            htmlOutDir: options.htmlOutDir,
                            flatten: options.htmlOutDirFlatten,
                            eol: (options.newLine || utils.eol)
                        };

                        let htmlFiles = grunt.file.expand(options.html);
                        generatedFiles = _.map(htmlFiles, (filename) => html2tsModule.compileHTML(filename, html2tsOptions));
                        generatedFiles.forEach((fileName) => {
                          if (filesToCompile.indexOf(fileName) === -1 &&
                            grunt.file.isMatch(currentFiles.glob, fileName)) {
                            filesToCompile.push(fileName);
                          }
                        });
                    }

                    ///// Template cache
                    // Note: The template cache files do not go into generated files.
                    // Note: You are free to generate a `ts OR js` file for template cache, both should just work
                    if (options.templateCache) {
                        if (!options.templateCache.src || !options.templateCache.dest || !options.templateCache.baseUrl) {
                            grunt.log.writeln('templateCache : src, dest, baseUrl must be specified if templateCache option is used'.red);
                        }
                        else {
                            let templateCacheSrc = grunt.file.expand(options.templateCache.src); // manual reinterpolation
                            let templateCacheDest = path.resolve(options.templateCache.dest);
                            let templateCacheBasePath = path.resolve(options.templateCache.baseUrl);
                            templateCacheModule.generateTemplateCache(templateCacheSrc,
                              templateCacheDest, templateCacheBasePath, (options.newLine || utils.eol));
                        }
                    }

                    ///// Reference File
                    // Generate the reference file
                    // Create a reference file if specified
                    if (!!referencePath) {
                        var result = timeIt(() => {
                            return referenceModule.updateReferenceFile(
                                filesToCompile.filter(f => !isReferenceFile(f)),
                                generatedFiles,
                                referenceFile,
                                referencePath,
                                (options.newLine || utils.eol));
                        });
                        if (result.it === true) {
                            grunt.log.writeln(('Updated reference file (' + result.time + 'ms).').green);
                        }
                    }

                    ///// AMD loader
                    // Create the amdLoader if specified
                    if (!!amdloaderPath) {
                        var referenceOrder: amdLoaderModule.IReferences
                            = amdLoaderModule.getReferencesInOrder(referenceFile, referencePath, generatedFiles);
                        amdLoaderModule.updateAmdLoader(referenceFile, referenceOrder, amdloaderFile, amdloaderPath, currentFiles.outDir);
                    }

                    // Transform files as needed. Currently all of this logic in is one module
                    transformers.transformFiles(filesToCompile /*TODO: only unchanged files*/,
                      filesToCompile, options);

                    currentFiles.src = filesToCompile;

                    // Return promise to compliation
                    if (utils.shouldCompile(options)) {
                        if (filesToCompile.length > 0 || options.testExecute || utils.shouldPassThrough(options)) {
                            return runCompilation(options, currentFiles).then((success: boolean) => {
                                return success;
                            });
                        }
                        else {
                            // Nothing to do
                            grunt.log.writeln('No files to compile'.red);
                            return Promise.resolve(true);
                        }
                    }
                    else { // Nothing to do
                        return Promise.resolve(true);
                    }
                }

                // Time (in ms) when last compile took place
                var lastCompile = 0;

                // Watch a folder?
                if (!!options.watch) {

                    // get path(s)
                    var watchpath = grunt.file.expand([options.watch]);

                    // create a file watcher for path
                    var chokidar = require('chokidar');
                    var watcher = chokidar.watch(watchpath, { ignoreInitial: true, persistent: true });

                    // Log what we are doing
                    grunt.log.writeln(('Watching all TypeScript / Html files under : ' + watchpath).cyan);

                    // A file has been added/changed/deleted has occurred
                    watcher
                        .on('add', function (path) {
                        handleFileEvent(path, '+++ added   ');
                        // Reset the time for last compile call
                        lastCompile = new Date().getTime();
                    })
                        .on('change', function (path) {
                        handleFileEvent(path, '### changed ');
                        // Reset the time for last compile call
                        lastCompile = new Date().getTime();
                    })
                        .on('unlink', function (path) {
                        handleFileEvent(path, '--- removed ');
                        // Reset the time for last compile call
                        lastCompile = new Date().getTime();
                    })
                        .on('error', function (error) {
                        console.error('Error happened in chokidar: ', error);
                    });
                }

                // Reset the time for last compile call
                lastCompile = new Date().getTime();

                // Run initial compile
                return filterFilesTransformAndCompile();

                // local event to handle file event
                function handleFileEvent(filepath: string, displaystr: string) {

                    const acceptedExtentions = ['.ts', '.tsx', '.js', '.jsx', '.html'];

                    acceptedExtentions.forEach(
                        (extension) => {

                            // If extension is accepted and was not just run
                            if (utils.endsWith(filepath.toLowerCase(), extension) && (new Date().getTime() - lastCompile) > 100) {

                                // Log and run the debounced version.
                                grunt.log.writeln((displaystr + ' >>' + filepath).yellow);

                                filterFilesTransformAndCompile();

                                return;
                            }

                            // Uncomment for debugging which files were ignored
                            // else if ((new Date().getTime() - lastCompile) <= 100){
                                // grunt.log.writeln((' ///'  + ' >>' + filepath).grey);
                            // }
                        }
                    );
                }

            }).then((res: boolean[]) => {
                // Ignore res? (either logs or throws)
                if (!options.watch) {
                    if (res.some((success: boolean) => {
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

    function processIndividualTemplate(template: string) {
        if (template) {
            return grunt.template.process(template, {});
        }
        return template;
    }

};

export = pluginFn;
