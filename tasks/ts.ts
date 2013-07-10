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

interface IOptions {
    target: string; // es3 , es5 
    module: string; // amd, commonjs 
    sourcemap: boolean;
    declaration: boolean;
    verbose: boolean;
    src: string[];
    dest: string;
    single: boolean; // use a single command for compilation 
    reference: string;
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
        return '"' + binPath + '/' + 'tsc" ';
    }

    function compileAllFiles(filepaths: string[], options: IOptions): ICompileResult {
        // TODO: use options 
        var filepath: string = filepaths.join(' ');
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

        this.files.forEach(function (f: IOptions) {
            var dest = f.dest,
                files:string[] = f.src;


            // If you want to ignore .d.ts
            //files = []
            //grunt.file.expand(f.src).forEach(function (filepath) {
            //    if (filepath.substr(-5) === ".d.ts") {
            //        return;
            //    }
            //    files.push(filepath);
            //});

            var reference = f.reference;
            if (!!reference) {
                var contents = [];
                files.forEach((filename: string) => {
                    // do not add a reference to reference: 
                    if (filename.indexOf('reference.ts') == -1)
                        contents.push('/// <reference path="' + path.relative(reference, filename).split('\\').join('/') + '" />')
                });
                fs.writeFileSync(reference + '/reference.ts', contents.join('\n'));
            }

            var result = compileAllFiles(files, f);
            if (result.code != 0) {
                var msg = "Compilation failed:";
                console.log(msg.red);
                success = false;
            }
            else {
                console.log((files.length +' typescript files successfully processed.').cyan);
            }
        });
                
        return success;
    });
};
