module.exports = function (grunt) {
    var path = require('path'), fs = require('fs'), vm = require('vm'), shell = require('shelljs');

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
        return '"' + binPath + '\\' + 'tsc" ';
    }

    function compileAllFiles(filepaths, options) {
        var filepath = filepaths.join(' ');
        var cmd = 'node ' + tsc + ' ' + filepath;
        var result = exec(cmd);
        return result;
    }

    var exec = shell.exec;
    var currentPath = path.resolve(".");
    var tsc = getTsc(resolveTypeScriptBinPath(currentPath, 0));

    grunt.registerMultiTask('ts', 'Compile TypeScript files', function () {
        var success = true;

        var that = this;

        this.files.forEach(function (f) {
            var dest = f.dest, files = [];

            grunt.file.expand(f.src).forEach(function (filepath) {
                if (filepath.substr(-5) === ".d.ts") {
                    return;
                }
                files.push(filepath);
            });

            var result = compileAllFiles(files, f);

            var reference = f.reference;
            if (!!reference) {
                var contents = [];
                files.forEach(function (filename) {
                    contents.push('/// <reference path="' + path.relative(reference, filename).split('\\').join('/') + '" />');
                });
                fs.writeFileSync(reference + '/reference.ts', contents.join('\n'));
            }

            if (result.code != 0) {
                var msg = "Compilation failed:";
                console.log(msg.red);
                success = false;
            } else {
                console.log((files.length + ' typescript files successfully processed.').cyan);
            }
        });

        return success;
    });
};
