module.exports = function (grunt) {
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
    var currentPath = path.resolve(".");
    var tsc = getTsc(resolveTypeScriptBinPath(currentPath, 0));

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

    // used to make sure string ends with a slash
    function endWithSlash(path) {
        var lastchar = path[path.length - 1];
        if (lastchar != '/' && lastchar != '\\') {
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
        //console.log(this.files[0]); // An array of target files ( only one in our case )
        //console.log(this.files[0].src); // a getter for a resolved list of files
        //console.log(this.files[0].orig.src); // The original glob / array / !array / <% array %> for files. Can be very fancy :)
        // this.files[0] is actually a single in our case as we support only one source / out per target
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
                var result = compileAllFiles(files, target, options);
                if (result.code != 0) {
                    var msg = "Compilation failed"/*+result.output*/ ;
                    grunt.log.error(msg.red);
                    success = false;
                } else {
                    grunt.log.writeln(files);
                    grunt.log.writeln((files.length + ' typescript files successfully processed.').green);
                }
            }
            runCompilation(target.src);

            // Watches all the files
            watch = target.watch;
            if (!!watch) {
                var watch = endWithSlash(watch);
                var done = currenttask.async();

                var watchpath = watch + '**/*.ts';
                grunt.log.writeln(('Watching all files: ' + watchpath).cyan);

                var Gaze = require('gaze').Gaze;

                var gaze = new Gaze(watchpath);

                // A file has been added/changed/deleted has occurred
                gaze.on('all', function (event, filepath) {
                    grunt.log.writeln(('    >>' + filepath + ' was ' + event).yellow);
                    grunt.log.writeln('Compiling.'.yellow);

                    //runCompilation([filepath]); // Potential optimization, But we want the whole project to be compilable
                    runCompilation(target.src);
                });
            }
        });

        if (!watch)
            return success;
    });
};
//@ sourceMappingURL=ts.js.map
