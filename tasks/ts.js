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

    function compileFile(filepath, options) {
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
            var dest = f.dest, options = that.options(), extension = that.data.extension, files = [];

            grunt.file.expand(f.src).forEach(function (filepath) {
                if (filepath.substr(-5) === ".d.ts") {
                    return;
                }
                files.push(filepath);
            });

            files.forEach(function (file) {
                var result = compileFile(file, options);
                if (result.code != 0) {
                    var msg = "Continuing, But failed to compile file: " + file;
                    console.log(msg.red);
                    success = false;
                }
            });
        });

        return true;
    });
};
