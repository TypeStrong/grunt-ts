/*
 * grunt-ts
 * Licensed under the MIT license.
 */

declare var module;
declare var require;
declare var __dirname;
declare var mapObj;
declare var key;

declare var TypeScript;

// What grunt adds to stirng 
interface String {
    yellow: any;
    cyan: any;
    green: any;
    red: any;
}

interface ICompileResult {
    code: number;
    output: string;
}

interface IOptions{
    target: string; // es3 , es5 
    module: string; // amd, commonjs 
    sourcemap: boolean;
    declaration: boolean;     
}

module.exports = function (grunt) {

    var path = require('path'),
        fs = require('fs'),
        vm = require('vm'),
        shell = require('shelljs');

    function resolveTypeScriptBinPath(currentPath, depth): string {
        var targetPath = path.resolve(__dirname,
            (new Array(depth + 1)).join("../../"),
            "../node_modules/typescript/bin");
        if (path.resolve(currentPath, "node_modules/typescript/bin").length > targetPath.length) {
            return;
        }
        if (fs.existsSync(path.resolve(targetPath, "typescript.js"))) {
            return targetPath;
        }

        return resolveTypeScriptBinPath(currentPath, ++depth);
    }

    function getTsc(binPath: string): string {
        return '"' + binPath + '\\' + 'tsc" ';
    }


    function compileFile(filepath: string,options:IOptions):ICompileResult{
        var cmd = 'node ' + tsc + ' ' + filepath;
        var result = exec(cmd);
        return result;
    }    
    
    var exec = shell.exec;
    var currentPath = path.resolve(".");
    var tsc = getTsc(resolveTypeScriptBinPath(currentPath, 0));
    
    grunt.registerMultiTask('ts', 'Compile TypeScript files', function () {
        // Was the whole process successful
        var success = true; 

        var that = this;

        this.files.forEach(function (f) {
            var dest = f.dest,
                options = that.options(),
                extension = that.data.extension,
                files = [];

            grunt.file.expand(f.src).forEach(function (filepath) {
                if (filepath.substr(-5) === ".d.ts") {
                    return;
                }
                files.push(filepath);
            });

            files.forEach(function (file) {
                // TODO: use options 
                var result = compileFile(file, options);
                if (result.code != 0) {
                    grunt.fail.warn("Failed to compile file: " + file);
                    console.log("output: ".cyan); 
                    console.log(result.output.yellow);                    
                    success = false;
                }
            });
        
        });

        return success;
    });
};
