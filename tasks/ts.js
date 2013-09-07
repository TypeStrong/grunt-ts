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
        var cmd = 'node ' + tsc + ' ' + filepath;

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

        // To debug the tsc command
        //console.log(cmd);
        var result = exec(cmd);
        return result;
    }

    /////////////////////////////////////////////////////////////////////
    // Reference file logic
    ////////////////////////////////////////////////////////////////////
    // Updates the reference file
    function updateReferenceFile(files, generatedFiles, referenceFile, referencePath) {
        var referenceIntro = '/// <reference path="';
        var referenceEnd = '" />';
        var referenceMatch = /\/\/\/ <reference path=\"(.*?)\"/;
        var ourSignatureStart = '//grunt-start';
        var ourSignatureEnd = '//grunt-end';

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

        // The path string within a single reference
        function makeReferencePath(filename) {
            return path.relative(referencePath, filename).split('\\').join('/');
        }

        // the generated files:
        generatedFiles = _.map(generatedFiles, function (file) {
            return referenceIntro + makeReferencePath(file) + referenceEnd;
        });

        // the new / observed missing files:
        var contents = insertArrayAt([ourSignatureStart], 1, generatedFiles);
        files.forEach(function (filename) {
            // The file we are about to add
            var filepath = makeReferencePath(filename);

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
            comments: false
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
