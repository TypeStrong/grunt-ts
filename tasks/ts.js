/// <reference path="../defs/tsd.d.ts"/>
/*
* grunt-ts
* Licensed under the MIT license.
*/
// Typescript imports
var _ = require('underscore');
var path = require('path');
var fs = require('fs');

// Modules of grunt-ts
var utils = require('./modules/utils');
var indexModule = require('./modules/index');
var referenceModule = require('./modules/reference');
var amdLoaderModule = require('./modules/amdLoader');
var html2tsModule = require('./modules/html2ts');
var templateCacheModule = require('./modules/templateCache');

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
* Get a random hex value
*
* @returns {string} hex string
*/
function getRandomHex(length) {
    if (typeof length === "undefined") { length = 16; }
    var name = '';
    do {
        name += Math.round(Math.random() * Math.pow(16, 8)).toString(16);
    } while(name.length < length);

    return name.substr(0, length);
}

/**
* Get a unique temp file
*
* @returns {string} unique-ish path to file in given directory.
* @throws when it cannot create a temp file in the specified directory
*/
function getTempFile(prefix, dir, extension) {
    if (typeof dir === "undefined") { dir = ''; }
    if (typeof extension === "undefined") { extension = '.tmp.txt'; }
    prefix = (prefix ? prefix + '-' : '');
    var attempts = 100;
    do {
        var name = prefix + getRandomHex(8) + extension;
        var dest = path.join(dir, name);

        if (!fs.existsSync(dest)) {
            return dest;
        }
        attempts--;
    } while(attempts > 0);

    throw 'Cannot create temp file in ' + dir;
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
    ///////////////////////////
    // Helper
    ///////////////////////////
    function executeNode(args) {
        return new Promise(function (resolve, reject) {
            grunt.util.spawn({
                cmd: 'node',
                args: args
            }, function (error, result, code) {
                var ret = {
                    code: code,
                    output: String(result)
                };
                resolve(ret);
            });
        });
    }

    /////////////////////////////////////////////////////////////////////
    // tsc handling.
    ////////////////////////////////////////////////////////////////////
    function resolveTypeScriptBinPath() {
        var ownRoot = path.resolve(path.dirname((module).filename), '..');
        var userRoot = path.resolve(ownRoot, '..', '..');
        var binSub = path.join('node_modules', 'typescript', 'bin');

        if (fs.existsSync(path.join(userRoot, binSub))) {
            // Using project override
            return path.join(userRoot, binSub);
        }
        return path.join(ownRoot, binSub);
    }

    function getTsc(binPath) {
        var pkg = JSON.parse(fs.readFileSync(path.resolve(binPath, '..', 'package.json')).toString());
        grunt.log.writeln('Using tsc v' + pkg.version);

        return path.join(binPath, 'tsc');
    }

    // Blindly runs the tsc task using provided options
    function compileAllFiles(files, target, task) {
        var args = files.slice(0);

        // boolean options
        if (task.sourceMap) {
            args.push('--sourcemap');
        }
        if (task.declaration) {
            args.push('--declaration');
        }
        if (task.removeComments) {
            args.push('--removeComments');
        }
        if (task.noImplicitAny) {
            args.push('--noImplicitAny');
        }
        if (task.noResolve) {
            args.push('--noResolve');
        }

        // string options
        args.push('--target', task.target.toUpperCase());
        args.push('--module', task.module.toLowerCase());

        // Target options:
        if (target.out) {
            args.push('--out', target.out);
        }
        if (target.outDir) {
            if (target.out) {
                console.warn('WARNING: Option "out" and "outDir" should not be used together'.magenta);
            }
            args.push('--outDir', target.outDir);
        }
        if (task.sourceRoot) {
            args.push('--sourceRoot', task.sourceRoot);
        }
        if (task.mapRoot) {
            args.push('--mapRoot', task.mapRoot);
        }

        // Locate a compiler
        var tsc = getTsc(resolveTypeScriptBinPath());

        // To debug the tsc command
        if (task.verbose) {
            console.log(args.join(' ').yellow);
        } else {
            grunt.log.verbose.writeln(args.join(' ').yellow);
        }

        // Create a temp last command file and use that to guide tsc.
        // Reason: passing all the files on the command line causes TSC to go in an infinite loop.
        var tempfilename = getTempFile('tscommand');
        if (!tempfilename) {
            throw (new Error('cannot create temp file'));
        }

        fs.writeFileSync(tempfilename, args.join(' '));

        // Execute command
        return executeNode([tsc, '@' + tempfilename]).then(function (result) {
            fs.unlinkSync(tempfilename);

            grunt.log.writeln(result.output);

            return Promise.cast(result);
        }, function (err) {
            fs.unlinkSync(tempfilename);
            throw err;
        });
    }

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

        // setup default options
        var options = currenttask.options({
            allowBool: false,
            allowImportModule: false,
            compile: true,
            declaration: false,
            mapRoot: '',
            module: 'amd',
            noImplicitAny: false,
            noResolve: false,
            comments: null,
            removeComments: null,
            sourceMap: true,
            sourceRoot: '',
            target: 'es5',
            verbose: false
        });

        // fix the properly cased options to their appropriate values
        options.allowBool = 'allowbool' in options ? options['allowbool'] : options.allowBool;
        options.allowImportModule = 'allowimportmodule' in options ? options['allowimportmodule'] : options.allowImportModule;
        options.sourceMap = 'sourcemap' in options ? options['sourcemap'] : options.sourceMap;

        // Remove comments based on the removeComments flag first then based on the comments flag, otherwise true
        if (options.removeComments === null) {
            options.removeComments = !options.comments;
        } else if (options.comments !== null) {
            console.warn('WARNING: Option "comments" and "removeComments" should not be used together'.magenta);
            if (options.removeComments === options.comments) {
                console.warn('Either option will suffice (and removing the other will have no effect).'.magenta);
            } else {
                console.warn(('The --removeComments value of "' + options.removeComments + '" ' + 'supercedes the --comments value of "' + options.comments + '"').magenta);
            }
        }
        options.removeComments = !!options.removeComments;

        // Some interesting logs:
        // http://gruntjs.com/api/inside-tasks#inside-multi-tasks
        // console.log(this)
        // console.log(this.files[0]); // An array of target files ( only one in our case )
        // console.log(this.files[0].src); // a getter for a resolved list of files
        // console.log(this.files[0].orig.src); // The original glob / array / !array / <% array %> for files. Can be very fancy :)
        // NOTE: to access the specified src files we use
        // currenttaks.data as that is the raw (non interpolated) string that we reinterpolate ourselves,
        //     in case the file system as changed since this task was started
        // this.files[0] is actually a single in our case as we gave examples of  one source / out per target
        // Run compiler
        asyncSeries(this.files, function (target) {
            // Create a reference file?
            var reference = target.reference;
            var referenceFile;
            var referencePath;
            if (!!reference) {
                referenceFile = path.resolve(reference);
                referencePath = path.dirname(referenceFile);
            }
            function isReferenceFile(filename) {
                return path.resolve(filename) === referenceFile;
            }

            // Create an output file?
            var out = target.out;
            var outFile;
            var outFile_d_ts;
            if (!!out) {
                outFile = path.resolve(out);
                outFile_d_ts = outFile.replace('.js', '.d.ts');
            }
            function isOutFile(filename) {
                return path.resolve(filename) === outFile_d_ts;
            }

            // Create an amd loader?
            var amdloader = target.amdloader;
            var amdloaderFile;
            var amdloaderPath;
            if (!!amdloader) {
                amdloaderFile = path.resolve(amdloader);
                amdloaderPath = path.dirname(amdloaderFile);
            }

            // Compiles all the files
            // Uses the blind tsc compile task
            // logs errors
            function runCompilation(files, target, options) {
                // Don't run it yet
                grunt.log.writeln('Compiling...'.yellow);

                // The files to compile
                var filesToCompile = files;

                // If reference and out are both specified.
                // Then only compile the udpated reference file as that contains the correct order
                if (!!referencePath && target.out) {
                    filesToCompile = [referenceFile];
                }

                // Quote the files to compile
                filesToCompile = _.map(filesToCompile, function (item) {
                    return '"' + item + '"';
                });

                // Time the compiler process
                var starttime = new Date().getTime();
                var endtime;

                // Compile the files
                return compileAllFiles(filesToCompile, target, options).then(function (result) {
                    // End the timer
                    endtime = new Date().getTime();

                    // Evaluate the result
                    if (!result || result.code) {
                        grunt.log.error('Compilation failed'.red);
                        return false;
                    } else {
                        var time = (endtime - starttime) / 1000;
                        grunt.log.writeln(('Success: ' + time.toFixed(2) + 's for ' + files.length + ' typescript files').green);
                        return true;
                    }
                });
            }

            // Find out which files to compile
            // Then calls the compile function on those files
            // Also this funciton is debounced
            function filterFilesAndCompile(changedFile) {
                // Html files:
                // Note:
                //    compile html files before reference file creation. Which is done in runCompilation
                //    compile html files before globbing the file system again
                var generatedHtmlFiles = [];
                if (currenttask.data.html) {
                    var htmlFiles = grunt.file.expand(currenttask.data.html);
                    generatedHtmlFiles = _.map(htmlFiles, function (filename) {
                        return html2tsModule.compileHTML(filename);
                    });
                }

                // The template cache files do not go into generated files.
                // You are free to generate a `ts OR js` file, both should just work
                if (currenttask.data.templateCache) {
                    if (!currenttask.data.templateCache.src || !currenttask.data.templateCache.dest || !currenttask.data.templateCache.baseUrl) {
                        grunt.log.writeln('templateCache : src, dest, baseUrl must be specified if templateCache option is used'.red);
                    } else {
                        var templateCacheSrc = grunt.file.expand(currenttask.data.templateCache.src);
                        var templateCacheDest = path.resolve(target.templateCache.dest);
                        var templateCacheBasePath = path.resolve(target.templateCache.baseUrl);
                        templateCacheModule.generateTemplateCache(templateCacheSrc, templateCacheDest, templateCacheBasePath);
                    }
                }

                // Reexpand the original file glob:
                var files = grunt.file.expand(currenttask.data.src);
                var fastCompiling = false;
                var baseDirFile = 'ignoreBaseDirFile.ts';
                var baseDirFilePath;

                // If fast compile and a file changed
                if (target.fast && changedFile) {
                    if (target.out) {
                        grunt.log.write('Fast compile will not work when --out is specified. Ignoring.'.red);
                    } else {
                        fastCompiling = true;
                        var completeFiles = _.map(files, function (file) {
                            return path.resolve(file);
                        });
                        var intersect = _.intersection(completeFiles, [path.resolve(changedFile)]);

                        if (intersect) {
                            files = intersect;
                        }
                    }
                }

                // If baseDir is specified create a temp tsc file to make sure that `--outDir` works fine
                // see https://github.com/grunt-ts/grunt-ts/issues/77
                if (target.outDir && target.baseDir) {
                    baseDirFilePath = path.join(target.baseDir, baseDirFile);
                    if (!fs.existsSync(baseDirFilePath)) {
                        fs.writeFileSync(baseDirFilePath, '// Ignore this file. See https://github.com/grunt-ts/grunt-ts/issues/77');
                    }
                    files.push(baseDirFilePath);
                }

                // Create the index if specified
                var index = target.index;
                if (!!index) {
                    if (!_.isArray(index)) {
                        grunt.warn('Index option needs to be an array of directories');
                    }
                    indexModule.indexDirectories(_.map(index, function (folder) {
                        return path.resolve(folder);
                    }));
                }

                if (!!options.compile) {
                    // ignore directories
                    files = files.filter(function (file) {
                        var stats = fs.lstatSync(file);
                        return !stats.isDirectory();
                    });

                    // remove the generated files from files:
                    files = _.difference(files, generatedHtmlFiles);

                    // Clear the files of output.d.ts and reference.ts
                    files = _.filter(files, function (filename) {
                        return (!isReferenceFile(filename) && !isOutFile(filename));
                    });

                    // Generate the reference file
                    // Create a reference file if specified
                    if (!fastCompiling && !!referencePath) {
                        var result = timeIt(function () {
                            return referenceModule.updateReferenceFile(files, generatedHtmlFiles, referenceFile, referencePath);
                        });
                        if (result.it === true) {
                            grunt.log.writeln(('Updated reference file (' + result.time + 'ms).').green);
                        }
                    }

                    // Compile, if there are any files to compile!
                    if (files.length > 0) {
                        return runCompilation(files, target, options).then(function (success) {
                            // Create the loader if specified & compiliation succeeded
                            if (!fastCompiling && success && !!amdloaderPath) {
                                var referenceOrder = amdLoaderModule.getReferencesInOrder(referenceFile, referencePath, generatedHtmlFiles);
                                amdLoaderModule.updateAmdLoader(referenceFile, referenceOrder, amdloaderFile, amdloaderPath, target.outDir);
                            }
                            return success;
                        });
                    } else {
                        grunt.log.writeln('No files to compile'.red);
                    }
                }

                // Nothing to do
                return Promise.resolve(true);
            }

            // Time (in ms) when last compile took place
            var lastCompile = 0;

            // Watch a folder?
            watch = target.watch;
            if (!!watch) {
                // local event to handle file event
                function handleFileEvent(filepath, displaystr, addedOrChanged) {
                    if (typeof addedOrChanged === "undefined") { addedOrChanged = false; }
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

                    if (addedOrChanged) {
                        filterFilesAndCompile(filepath);
                    } else {
                        filterFilesAndCompile();
                    }
                }

                // get path
                var watchpath = path.resolve(watch);

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
                } else {
                    done();
                }
            }
        }, done);
    });
}
module.exports = pluginFn;
//# sourceMappingURL=ts.js.map
