/// <reference path="../defs/node/node.d.ts"/>
/// <reference path="../defs/grunt/grunt.d.ts"/>
/// <reference path="../defs/underscore/underscore.d.ts"/>
/// <reference path="../defs/underscore.string/underscore.string.d.ts"/>
// General util functions
function insertArrayAt(array, index, arrayToInsert) {
    Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
    return array;
}

// Useful string functions
// used to make sure string ends with a slash
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
;
function endWithSlash(path) {
    if (!endsWith(path, '/') && !endsWith(path, '\\')) {
        return path + '/';
    }
    return path;
}

// Typescript imports
var _ = require('underscore');
var _str = require('underscore.string');
var path = require('path');
var fs = require('fs');
var os = require('os');

// plain vanilla imports
var shell = require('shelljs');
var eol = os.EOL;
var pathSeperator = path.sep;

var referenceFileLoopState;
(function (referenceFileLoopState) {
    referenceFileLoopState[referenceFileLoopState["before"] = 0] = "before";
    referenceFileLoopState[referenceFileLoopState["unordered"] = 1] = "unordered";
    referenceFileLoopState[referenceFileLoopState["after"] = 2] = "after";
})(referenceFileLoopState || (referenceFileLoopState = {}));
;

function pluginFn(grunt) {
    /////////////////////////////////////////////////////////////////////
    // tsc handling.
    ////////////////////////////////////////////////////////////////////
    function resolveTypeScriptBinPath(currentPath, depth) {
        var targetPath = path.resolve(__dirname, (new Array(depth + 1)).join("../../"), "../node_modules/typescript/bin");
        if (path.resolve(currentPath, "node_modules/typescript/bin").length > targetPath.length) {
            return;
        }
        if (fs.existsSync(path.resolve(targetPath, "typescript.js"))) {
            return targetPath;
        }

        return resolveTypeScriptBinPath(currentPath, ++depth);
    }
    function getTsc(binPath) {
        return '"' + binPath + '/' + 'tsc" ';
    }
    var exec = shell.exec;
    var cwd = path.resolve(".");
    var tsc = getTsc(resolveTypeScriptBinPath(cwd, 0));

    // Blindly runs the tsc task using provided options
    function compileAllFiles(files, target, task) {
        var filepath = files.join(' ');
        var tscExecCommand = 'node ' + tsc;

        var cmd = filepath;

        if (task.sourcemap)
            cmd = cmd + ' --sourcemap';
        if (task.declaration)
            cmd = cmd + ' --declaration';
        if (!task.comments)
            cmd = cmd + ' --removeComments';

        // string options
        cmd = cmd + ' --target ' + task.target.toUpperCase();
        cmd = cmd + ' --module ' + task.module.toLowerCase();

        if (target.out) {
            cmd = cmd + ' --out ' + target.out;
        }
        if (target.outDir) {
            if (target.out) {
                console.log('WARNING: Option "out" and "outDir" should not be used together'.magenta);
            }
            cmd = cmd + ' --outDir ' + target.outDir;
        }

        if (task.verbose) {
            console.log(cmd);
        }

        // Create a temp last command file
        var tempfilename = 'tscommand.tmp.txt';
        fs.writeFileSync(tempfilename, cmd);
        tscExecCommand = tscExecCommand + ' @' + tempfilename;

        var result = exec(tscExecCommand);
        return result;
    }

    /////////////////////////////////////////////////////////////////////
    // Reference file logic
    ////////////////////////////////////////////////////////////////////
    // Converts "C:\boo" , "C:\boo\foo.ts" => "./foo.ts"; Works on unix as well.
    function makeReferencePath(folderpath, filename) {
        return path.relative(folderpath, filename).split('\\').join('/');
    }

    // Updates the reference file
    function updateReferenceFile(files, generatedFiles, referenceFile, referencePath) {
        var referenceIntro = '/// <reference path="';
        var referenceEnd = '" />';
        var referenceMatch = /\/\/\/ <reference path=\"(.*?)\"/;
        var ourSignatureStart = '//grunt-start';
        var ourSignatureEnd = '//grunt-end';
        var generatedSignature = "// generated";

        var origFileLines = [];
        var origFileReferences = [];

        // Location of our generated references
        // By default at start of file
        var signatureSectionPosition = 0;

        if (fs.existsSync(referenceFile)) {
            var lines = fs.readFileSync(referenceFile).toString().split('\n');

            var inSignatureSection = false;

            // By default our signature goes at end of file
            signatureSectionPosition = lines.length;

            for (var i = 0; i < lines.length; i++) {
                var line = _str.trim(lines[i]);

                if (_str.include(line, ourSignatureStart)) {
                    //Wait for the end signature:
                    signatureSectionPosition = i;
                    inSignatureSection = true;
                    continue;
                }
                if (_str.include(line, ourSignatureEnd)) {
                    inSignatureSection = false;
                    continue;
                }
                if (inSignatureSection)
                    continue;

                // store the line
                origFileLines.push(line);

                if (_str.include(line, referenceIntro)) {
                    var match = line.match(referenceMatch);
                    var filename = match[1];
                    origFileReferences.push(filename);
                }
            }
        }

        // Put in the generated files
        generatedFiles = _.map(generatedFiles, function (file) {
            return referenceIntro + makeReferencePath(referencePath, file) + referenceEnd + generatedSignature;
        });
        var contents = insertArrayAt([ourSignatureStart], 1, generatedFiles);

        // Put in the new / observed missing files:
        files.forEach(function (filename) {
            // The file we are about to add
            var filepath = makeReferencePath(referencePath, filename);

            if (origFileReferences.length) {
                if (_.contains(origFileReferences, filepath)) {
                    return;
                }
            }

            // Finally add the filepath
            contents.push(referenceIntro + filepath + referenceEnd);
        });
        contents.push(ourSignatureEnd);

        // Modify the orig contents to put in our contents
        origFileLines = insertArrayAt(origFileLines, signatureSectionPosition, contents);
        fs.writeFileSync(referenceFile, origFileLines.join(eol));
    }

    /////////////////////////////////////////////////////////////////////
    // AMD Loader, creates a js file that loads a few files in order
    // and the rest un orderded, based on the reference.ts spec
    ////////////////////////////////////////////////////////////////////
    function getReferencesInOrder(referenceFile, referencePath) {
        var toreturn = {
            before: [],
            generated: [],
            unordered: [],
            after: []
        };

        // When reading
        var referenceMatch = /\/\/\/ <reference path=\"(.*?)\"/;

        // When writing
        var referenceIntro = '/// <reference path="';
        var referenceEnd = '" />';

        // The section of unordered files
        var ourSignatureStart = '//grunt-start';
        var ourSignatureEnd = '//grunt-end';

        // The generated files. These must go on top
        var generatedSignature = "// generated";

        var lines = fs.readFileSync(referenceFile).toString().split('\n');

        // Which of the three sections we are in
        var loopState = referenceFileLoopState.before;

        for (var i = 0; i < lines.length; i++) {
            var line = _str.trim(lines[i]);

            if (_str.include(line, ourSignatureStart)) {
                //Wait for the end signature:
                loopState = referenceFileLoopState.unordered;
            }
            if (_str.include(line, ourSignatureEnd)) {
                loopState = referenceFileLoopState.after;
            }

            if (_str.include(line, referenceIntro)) {
                var match = line.match(referenceMatch);
                var filename = match[1];
                switch (loopState) {
                    case referenceFileLoopState.before:
                        toreturn.before.push(filename);
                        break;
                    case referenceFileLoopState.unordered:
                        if (endsWith(line, generatedSignature)) {
                            toreturn.generated.push(filename);
                        } else {
                            toreturn.unordered.push(filename);
                        }
                        break;
                    case referenceFileLoopState.after:
                        toreturn.after.push(filename);
                        break;
                }
            }
        }

        // Fix the references to be absolute:
        toreturn.before = _.map(toreturn.before, function (relativepath) {
            return path.resolve(referencePath, relativepath);
        });
        toreturn.generated = _.map(toreturn.generated, function (relativepath) {
            return path.resolve(referencePath, relativepath);
        });
        toreturn.unordered = _.map(toreturn.unordered, function (relativepath) {
            return path.resolve(referencePath, relativepath);
        });
        toreturn.after = _.map(toreturn.after, function (relativepath) {
            return path.resolve(referencePath, relativepath);
        });

        return toreturn;
    }

    // Finds the longest common section of a collection of strings.
    // Simply sorting and comparing first and last http://stackoverflow.com/a/1917041/390330
    function sharedStart(array) {
        var A = array.slice(0).sort(), word1 = A[0], word2 = A[A.length - 1], i = 0;
        while (word1.charAt(i) == word2.charAt(i))
            ++i;
        return word1.substring(0, i);
    }

    // Explanation inline
    function findCommonPath(paths) {
        // Now for "C:\u\starter" "C:\u\started" => "C:\u\starte"
        var largetStartSegement = sharedStart(paths);

        // For "C:\u\starte" => C:\u\
        var ending = largetStartSegement.lastIndexOf(pathSeperator);
        return largetStartSegement.substr(0, ending);
    }

    // It updates based on the order of reference files
    function updateAmdLoader(referenceFile, referencePath, loaderFile, loaderPath, outDir) {
        if (fs.existsSync(referenceFile)) {
            var files = getReferencesInOrder(referenceFile, referencePath);

            // Filter.d.ts,
            files.before = _.filter(files.before, function (file) {
                return !endsWith(file, '.d.ts');
            });
            files.generated = _.filter(files.generated, function (file) {
                return !endsWith(file, '.d.ts');
            });
            files.unordered = _.filter(files.unordered, function (file) {
                return !endsWith(file, '.d.ts');
            });
            files.after = _.filter(files.after, function (file) {
                return !endsWith(file, '.d.ts');
            });

            if (outDir) {
                // Find common path
                var commonPath = findCommonPath(files.before.concat(files.generated.concat(files.unordered.concat(files.after))));

                // Make sure outDir is absolute:
                outDir = path.resolve(outDir);

                function makeRelativeToOutDir(files) {
                    files = _.map(files, function (file) {
                        // Remove common path and replace with absolute outDir
                        file = file.replace(commonPath, outDir);

                        //remove ts extension '.ts':
                        file = file.substr(0, file.length - 3);

                        // Make relative to amd loader
                        file = makeReferencePath(loaderPath, file);

                        // Prepend "./" to prevent "basePath" requirejs setting from interferring:
                        file = "./" + file;

                        return file;
                    });
                    return files;
                }
                files.before = makeRelativeToOutDir(files.before);
                files.generated = makeRelativeToOutDir(files.generated);
                files.unordered = makeRelativeToOutDir(files.unordered);
                files.after = makeRelativeToOutDir(files.after);

                var mainTemplate = _.template('define(function (require) { ' + eol + '<%= body %>' + eol + '});');

                // The order in the before and after files is important
                var singleRequireTemplate = _.template('\t require([<%= filename %>],function (){' + eol + '<%= subitem %>' + eol + '\t });');

                // The final body of the function
                var body = '';

                // initial sub item
                var subitem = '';

                // Write out a binary file:
                var binaryTemplate = _.template('define(["<%= filenames %>"],function () {});');
                var binaryFilesNames = files.before.concat(files.generated.concat(files.unordered.concat(files.after)));
                var binaryContent = binaryTemplate({ filenames: binaryFilesNames.join('","') });
                var binFileExtension = '.bin.js';
                var loaderFileWithoutExtension = path.dirname(loaderFile) + pathSeperator + path.basename(loaderFile, '.js');
                fs.writeFileSync(loaderFileWithoutExtension + binFileExtension, binaryContent);

                //
                // Notice that we build inside out in the below sections:
                //
                // Generate fileTemplate from inside out
                // Start with after
                // Build the subitem for ordered after items
                files.after = files.after.reverse();
                _.forEach(files.after, function (file) {
                    subitem = singleRequireTemplate({ filename: '"' + file + '"', subitem: subitem });
                });

                // Next up add the unordered items:
                // For these we will use just one require call
                var unorderFileNames = files.unordered.join('",' + eol + '\t\t  "');
                subitem = singleRequireTemplate({ filename: '"' + unorderFileNames + '"', subitem: subitem });

                // Next the generated files
                // For these we will use just one require call
                var generatedFileNames = files.generated.join('",' + eol + '\t\t  "');
                subitem = singleRequireTemplate({ filename: '"' + generatedFileNames + '"', subitem: subitem });

                // Build the subitem for ordered before items
                files.before = files.before.reverse();
                _.forEach(files.before, function (file) {
                    subitem = singleRequireTemplate({ filename: '"' + file + '"', subitem: subitem });
                });

                // The last subitem is now the body
                body = subitem;
                var output = mainTemplate({ body: body });

                // Finally write it out
                fs.writeFileSync(loaderFile, output);
            }
        } else {
            grunt.log.writeln('Cannot generate amd loader unless a reference file is present'.red);
        }
    }

    /////////////////////////////////////////////////////////////////////
    // HTML -> TS
    ////////////////////////////////////////////////////////////////////
    //html -> js processing functions:
    // Originally from karma-html2js-preprocessor
    // Refactored nicely in html2js grunt task
    // https://github.com/karlgoldstein/grunt-html2js/blob/master/tasks/html2js.js
    // Modified nlReplace to be an empty string
    var escapeContent = function (content, quoteChar) {
        if (typeof quoteChar === "undefined") { quoteChar = "'"; }
        var quoteRegexp = new RegExp('\\' + quoteChar, 'g');
        var nlReplace = '';
        return content.replace(quoteRegexp, '\\' + quoteChar).replace(/\r?\n/g, nlReplace);
    };

    // Remove bom when reading utf8 files
    function stripBOM(str) {
        return 0xFEFF == str.charCodeAt(0) ? str.substring(1) : str;
    }

    var htmlTemplate = _.template("module <%= modulename %> { export var <%= varname %> =  '<%= content %>' } ");

    // Compile an HTML file to a TS file
    // Return the filename. This filename will be required by reference.ts
    function compileHTML(filename) {
        var htmlContent = escapeContent(fs.readFileSync(filename).toString());
        htmlContent = stripBOM(htmlContent);

        // TODO: place a minification pipeline here if you want.
        var ext = path.extname(filename);
        var extFreename = path.basename(filename, ext);
        var fileContent = htmlTemplate({ modulename: extFreename, varname: ext.replace('.', ''), content: htmlContent });

        // Write the content to a file
        var outputfile = filename + ".ts";

        fs.writeFileSync(outputfile, fileContent);
        return outputfile;
    }

    /////////////////////////////////////////////////////////////////////
    // AngularJS templateCache
    ////////////////////////////////////////////////////////////////////
    // templateCache processing function
    function generateTemplateCache(src, dest, basePath) {
        if (!src.length)
            return;

        // Resolve the relative path from basePath to each src file
        var relativePaths = _.map(src, function (anHtmlFile) {
            return 'text!' + makeReferencePath(basePath, anHtmlFile);
        });
        var fileNames = _.map(src, function (anHtmlFile) {
            return path.basename(anHtmlFile);
        });
        var fileVarialbeName = function (anHtmlFile) {
            return anHtmlFile.split('.').join('_').split('-').join('_');
        };
        var fileVariableNames = _.map(fileNames, fileVarialbeName);

        var templateCacheTemplate = _.template('// You must have requirejs + text plugin loaded for this to work.' + eol + 'var define;' + eol + 'define([<%=relativePathSection%>],function(<%=fileNameVariableSection%>){' + eol + 'angular.module("ng").run(["$templateCache",function($templateCache) {' + eol + '<%=templateCachePut%>' + eol + '}]);' + eol + '});');

        var relativePathSection = '"' + relativePaths.join('",' + eol + '"') + '"';
        var fileNameVariableSection = fileVariableNames.join(',' + eol);

        var templateCachePutTemplate = _.template('$templateCache.put("<%= fileName %>", <%=fileVariableName%>);');
        var templateCachePut = _.map(fileNames, function (fileName) {
            return templateCachePutTemplate({ fileName: fileName, fileVariableName: fileVarialbeName(fileName) });
        }).join(eol);

        var fileContent = templateCacheTemplate({ relativePathSection: relativePathSection, fileNameVariableSection: fileNameVariableSection, templateCachePut: templateCachePut });
        fs.writeFileSync(dest, fileContent);
    }

    /////////////////////////////////////////////////////////////////////
    // The grunt task
    ////////////////////////////////////////////////////////////////////
    // Note: this funciton is called once for each target
    // so task + target options are a bit blurred inside this function
    grunt.registerMultiTask('ts', 'Compile TypeScript files', function () {
        var currenttask = this;

        // setup default options
        var options = currenttask.options({
            module: 'amd',
            target: 'es3',
            declaration: false,
            sourcemap: true,
            comments: false,
            verbose: false
        });

        // Was the whole process successful
        var success = true;
        var watch;

        // Some interesting logs:
        //http://gruntjs.com/api/inside-tasks#inside-multi-tasks
        //console.log(this)
        //console.log(this.files[0]); // An array of target files ( only one in our case )
        //console.log(this.files[0].src); // a getter for a resolved list of files
        //console.log(this.files[0].orig.src); // The original glob / array / !array / <% array %> for files. Can be very fancy :)
        // NOTE: to access the specified src files we use
        // currenttaks.data as that is the raw (non interpolated) string that we reinterpolate ourselves in case the file system as changed since this task was started
        // this.files[0] is actually a single in our case as we gave examples of  one source / out per target
        this.files.forEach(function (target) {
            // Create a reference file?
            var reference = target.reference;
            var referenceFile;
            var referencePath;
            if (!!reference) {
                referenceFile = path.resolve(reference);
                referencePath = path.dirname(referenceFile);
            }
            function isReferenceFile(filename) {
                return path.resolve(filename) == referenceFile;
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
                return path.resolve(filename) == outFile_d_ts;
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
            // Creates custom files
            // logs errors
            // Time the whole process
            var starttime;
            var endtime;
            function runCompilation(files, generatedHtmlFiles) {
                grunt.log.writeln('Compiling.'.yellow);

                // Time the task and go
                starttime = new Date().getTime();

                if (!!referencePath) {
                    updateReferenceFile(files, generatedHtmlFiles, referenceFile, referencePath);
                }

                // The files to compile
                var filesToCompile = files;

                if (!!referencePath && target.out) {
                    filesToCompile = [referenceFile];
                }
                ;

                // Quote the files to compile
                filesToCompile = _.map(filesToCompile, function (item) {
                    return '"' + item + '"';
                });

                // Compile the files
                var result = compileAllFiles(filesToCompile, target, options);

                if (!!amdloaderPath && result.code == 0) {
                    updateAmdLoader(referenceFile, referencePath, amdloaderFile, amdloaderPath, target.outDir);
                }

                // End the timer
                endtime = new Date().getTime();

                if (result.code != 0) {
                    var msg = "Compilation failed"/*+result.output*/ ;
                    grunt.log.error(msg.red);
                    success = false;
                } else {
                    var time = (endtime - starttime) / 1000;
                    grunt.log.writeln(('Success: ' + time.toFixed(2) + 's for ' + files.length + ' typescript files').green);
                }
            }

            // Find out which files to compile
            // Then calls the compile function on those files
            // Also this funciton is debounced
            function filterFilesAndCompile() {
                // Html files:
                // Note:
                //    compile html files before reference file creation. Which is done in runCompilation
                //    compile html files before globbing the file system again
                var generatedHtmlFiles = [];
                if (currenttask.data.html) {
                    var htmlFiles = grunt.file.expand(currenttask.data.html);
                    generatedHtmlFiles = _.map(htmlFiles, function (filename) {
                        return compileHTML(filename);
                    });
                }

                if (currenttask.data.templateCache) {
                    if (!currenttask.data.templateCache.src || !currenttask.data.templateCache.dest || !currenttask.data.templateCache.baseUrl) {
                        grunt.log.writeln('templateCache : src, dest, baseUrl must be specified if templateCache option is used'.red);
                    } else {
                        var templateCacheSrc = grunt.file.expand(currenttask.data.templateCache.src);
                        var templateCacheDest = path.resolve(target.templateCache.dest);
                        var templateCacheBasePath = path.resolve(target.templateCache.baseUrl);
                        generateTemplateCache(templateCacheSrc, templateCacheDest, templateCacheBasePath);
                    }
                }

                // Reexpand the original file glob:
                var files = grunt.file.expand(currenttask.data.src);

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

                if (files.length > 0)
                    runCompilation(files, generatedHtmlFiles);
else
                    grunt.log.writeln('No files to compile'.red);
            }

            // Initial compilation:
            filterFilesAndCompile();

            // Watch a folder?
            watch = target.watch;
            if (!!watch) {
                // make async
                var done = currenttask.async();

                // A debounced version of compile
                var debouncedCompile = _.debounce(filterFilesAndCompile, 150);

                // local event to handle file event
                function handleFileEvent(filepath, displaystr) {
                    if (!endsWith(filepath.toLowerCase(), '.ts') && !endsWith(filepath.toLowerCase(), '.html'))
                        return;

                    if ((new Date().getTime() - endtime) <= 100) {
                        //grunt.log.writeln((' ///'  + ' >>' + filepath).grey);
                        return;
                    }

                    // Log and run the debounced version.
                    grunt.log.writeln((displaystr + ' >>' + filepath).yellow);
                    debouncedCompile();
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
                    handleFileEvent(path, '+++ added   ');
                }).on('change', function (path) {
                    handleFileEvent(path, '### changed ');
                }).on('unlink', function (path) {
                    handleFileEvent(path, '--- removed ');
                }).on('error', function (error) {
                    console.error('Error happened in chokidar: ', error);
                });
            }
        });

        if (!watch) {
            return success;
        }
    });
}
;

module.exports = pluginFn;

//# sourceMappingURL=ts.js.map
