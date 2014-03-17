/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>

import fs = require('fs');
import path = require('path');
import grunt = require('grunt');
import _str = require('underscore.string');
import _ = require('underscore');
import os = require('os');
import utils = require('./utils');

var eol = os.EOL;

// Based on name
// if a filename matches we return a filepath
// If a foldername matches we return a folderpath
// TODO: index files logic 
// TODO: file inside the determined folder logic
function getImports(currentFilePath: string, name: string, targetFiles: string[], targetDirs: string[]): string[] {
    var files = [];

    // Test if any filename matches 
    var targetFile = _.find(targetFiles, (targetFile) => {
        return path.basename(targetFile) == name
            || path.basename(targetFile, '.d.ts') == name
            || path.basename(targetFile, '.ts') == name;

    });
    if (targetFile) {
        files.push(targetFile);
    }

    // Test if dirname matches
    var targetDir = _.find(targetDirs, (targetDir) => {
        return path.basename(targetDir) == name;
    });
    if (targetDir) {
        // TODO: It might be worthwhile to cache this lookup
        var filesInDir = utils.getFiles(targetDir, (filename) => {
            return path.extname(filename) // must have extension : do not exclude directories                
                && (!_str.endsWith(filename, '.ts') || _str.endsWith(filename, '.d.ts'))
                && !fs.lstatSync(filename).isDirectory(); // for people that name directories with dots
        });
        files = files.concat(filesInDir);
    }

    return files;
}

// Algo
// Notice that the file globs come as
// test/fail/ts/deep/work.ts
// So simply get dirname recursively till reach root
function getTargetFolders(targetFiles: string[]) {
    var folders = [];
    _.forEach(targetFiles, (targetFile) => {
        var dir = path.dirname(targetFile);
        while (dir != '.') {
            // grunt.log.writeln(dir);
            folders.push(dir);
            dir = path.dirname(dir)
        }
    });

    return folders;
}


// This code fixes the line encoding to be per os. 
// I think it is the best option available at the moment. 
// better than 
export function transformFiles(
    changedFiles: string[],
    targetFiles: string[],
    target: ITargetOptions,
    task: ITaskOptions) {

    var targetDirs = getTargetFolders(targetFiles);

    ///////////////////////////////////// module import transformation

    ///ts:import=filename
    ///ts:import=foldername

    // Becomes

    ///ts:import=filename    
    //import filename = require('../relative/path/to/filename'); ///ts:import:generated


    var importMatch = /\/\/\/ts:import=(.*)/;
    var importSignatureIntro = '///ts:import'
    var importSignatureGenerated = ' ' + importSignatureIntro + ':generated';
        var importError = '/// No glob matched name: ';



    _.forEach(changedFiles, (fileToProcess) => {
        var lines = fs.readFileSync(fileToProcess).toString().split(/\r\n|\r|\n/);
        var outputLines = [];
        var inSignatureSection = false;

        for (var i = 0; i < lines.length; i++) {

            var line = lines[i];

            grunt.log.writeln('line'.green);
            grunt.log.writeln(line);

            // Skip generated lines as these will get regenerated
            if (_str.contains(line, importSignatureGenerated)) {
                continue;
            }

            // Regeneration section
            // Directive line
            if (_str.contains(line, importSignatureIntro)) {
                // The code gen directive line automatically qualifies
                outputLines.push(line);

                // find the name: 
                var match = line.match(importMatch);
                if (!match || !match[1]) {
                    outputLines.push('/// Must match: ' + importMatch + importSignatureGenerated);
                }
                else {
                    var name = match[1];

                    grunt.log.writeln('import found', name);
                    var imports = getImports(fileToProcess, name, targetFiles, targetDirs);

                    if (imports.length) {
                        _.forEach(imports, (importLine) => {
                            outputLines.push(importLine + importSignatureGenerated);
                        });
                    }
                    else {
                        outputLines.push(importError + name + importSignatureGenerated);
                    }
                }

                continue;
            }

            // Lines not generated or not directives
            outputLines.push(line);
        }

        grunt.file.write(fileToProcess, outputLines.join(os.EOL));
    });

}