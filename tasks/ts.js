// Typescript imports
var _ = require("underscore");

function pluginFn(grunt) {
    // plain vanilla imports
    var path = require('path'), fs = require('fs'), vm = require('vm'), shell = require('shelljs'), eol = require('os').EOL;

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

    function compileAllFiles(files, target, task) {
        var filepath = files.join(' ');
        var cmd = 'node ' + tsc + ' ' + filepath;

        if (task.sourcemap)
            cmd = cmd + ' --sourcemap';
        if (task.declaration)
            cmd = cmd + ' --declaration';
        if (task.nolib)
            cmd = cmd + ' --nolib';
        if (task.comments)
            cmd = cmd + ' --comments';

        // string options
        cmd = cmd + ' --target ' + task.target.toUpperCase();
        cmd = cmd + ' --module ' + task.module.toLowerCase();

        if (target.out) {
            cmd = cmd + ' --out ' + target.out;
        }
        var result = exec(cmd);
        return result;
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

    grunt.registerMultiTask('ts', 'Compile TypeScript files', function () {
        var currenttask = this;

        // setup default options
        var options = currenttask.options({
            module: 'commonjs',
            target: 'es3',
            declaration: false,
            sourcemap: true,
            nolib: false,
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
            // Create a reference file
            var reference = target.reference;
            if (!!reference) {
                reference = endWithSlash(reference);
                var contents = [];
                target.src.forEach(function (filename) {
                    if (filename.indexOf('reference.ts') == -1)
                        contents.push('/// <reference path="' + path.relative(reference, filename).split('\\').join('/') + '" />');
                });
                fs.writeFileSync(reference + '/reference.ts', contents.join(eol));
            }

            // Compiles all the files
            function runCompilation(files) {
                grunt.log.writeln('Compiling.'.yellow);
                var result = compileAllFiles(files, target, options);
                if (result.code != 0) {
                    var msg = "Compilation failed"/*+result.output*/ ;
                    grunt.log.error(msg.red);
                    success = false;
                } else {
                    grunt.log.writeln((files.length + ' typescript files successfully processed.').green);
                }
            }
            runCompilation(target.src);

            // Watches all the files
            watch = target.watch;
            if (!!watch) {
                // get path
                watch = path.resolve(watch);

                // make async
                var done = currenttask.async();

                var watchpath = watch;
                grunt.log.writeln(('Watching all Typescript files under : ' + watchpath).cyan);

                // create a gaze instance for path
                var chokidar = require('chokidar');
                var watcher = chokidar.watch(watchpath, { ignoreInitial: true, persistent: true });

                var debouncedCompile = _.debounce(function () {
                    // Reexpand the original file glob:
                    var files = grunt.file.expand(currenttask.data.src);

                    // compile
                    runCompilation(files);
                }, 150);

                // local event to handle file event
                function handleFileEvent(filepath, displaystr) {
                    if (target.out && endsWith(filepath, '.d.ts')) {
                        return;
                    }
                    if (!endsWith(filepath, '.ts')) {
                        return;
                    }

                    grunt.log.writeln((displaystr + ' >>' + filepath).yellow);
                    debouncedCompile();
                }

                // A file has been added/changed/deleted has occurred
                watcher.on('add', function (path) {
                    handleFileEvent(path, '+++ added  ');
                }).on('change', function (path) {
                    handleFileEvent(path, '### changed');
                }).on('unlink', function (path) {
                    handleFileEvent(path, '--- removed');
                }).on('error', function (error) {
                    console.error('Error happened', error);
                });
            }
        });

        if (!watch)
            return success;
    });
}
;

module.exports = pluginFn;

//@ sourceMappingURL=ts.js.map
