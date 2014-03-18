/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>
var fs = require('fs');
var path = require('path');
var grunt = require('grunt');
var _str = require('underscore.string');
var _ = require('underscore');
var os = require('os');
var utils = require('./utils');

// Based on name
// if a filename matches we return a filepath
// If a foldername matches we return a folderpath
function getImports(currentFilePath, name, targetFiles, targetDirs) {
    var files = [];

    // Test if any filename matches
    var targetFile = _.find(targetFiles, function (targetFile) {
        return path.basename(targetFile) === name || path.basename(targetFile, '.d.ts') === name || path.basename(targetFile, '.ts') === name;
    });
    if (targetFile) {
        files.push(targetFile);
    }

    // It might be worthwhile to cache this lookup
    // i.e. have a 'foldername':folderpath map passed in
    // Test if dirname matches
    var targetDir = _.find(targetDirs, function (targetDir) {
        return path.basename(targetDir) === name;
    });
    if (targetDir) {
        // If targetDir has an index file, we use that
        if (fs.existsSync(path.join(targetDir, 'index.ts'))) {
            files.push(path.join(targetDir, 'index.ts'));
        } else {
            var filesInDir = utils.getFiles(targetDir, function (filename) {
                return path.extname(filename) && (!_str.endsWith(filename, '.ts') || _str.endsWith(filename, '.d.ts')) && !fs.lstatSync(filename).isDirectory();
            });
            files = files.concat(filesInDir);
        }
    }

    return files;
}

// Algo
// Notice that the file globs come as
// test/fail/ts/deep/work.ts
// So simply get dirname recursively till reach root '.'
function getTargetFolders(targetFiles) {
    var folders = [];
    _.forEach(targetFiles, function (targetFile) {
        var dir = path.dirname(targetFile);
        while (dir !== '.') {
            // grunt.log.writeln(dir);
            folders.push(dir);
            dir = path.dirname(dir);
        }
    });

    return folders;
}

// This code fixes the line encoding to be per os.
// I think it is the best option available at the moment.
// I am open for suggestions
function transformFiles(changedFiles, targetFiles, target, task) {
    var targetDirs = getTargetFolders(targetFiles);

    ///////////////////////////////////// module import transformation
    ///ts:import=filename
    ///ts:import=foldername
    // Becomes
    ///ts:import=filename
    // import filename = require('../relative/path/to/filename'); ///ts:import:generated
    var tsSignature = '///ts:';

    var importMatch = /\/\/\/ts:import=(.*)/;
    var importSignatureIntro = '///ts:import';
    var importSignatureGenerated = ' ' + importSignatureIntro + ':generated';
    var importError = '/// No glob matched name: ';

    var completeFileExportTemplate = _.template('import <%=filename%> = require(\'<%= pathToFile %>\');' + importSignatureGenerated);

    _.forEach(changedFiles, function (fileToProcess) {
        var contents = fs.readFileSync(fileToProcess).toString();

        // If no signature don't bother with this file
        if (!_str.contains(contents, tsSignature)) {
            return;
        }

        var lines = contents.split(/\r\n|\r|\n/);
        var fileToProcessDirectory = path.dirname(fileToProcess);

        var outputLines = [];

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            // grunt.log.writeln('line'.green);
            // grunt.log.writeln(line);
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
                } else {
                    var name = match[1];
                    name = name.trim();
                    var imports = getImports(fileToProcess, name, targetFiles, targetDirs);

                    if (imports.length) {
                        _.forEach(imports, function (completePathToFile) {
                            var filename = path.basename(completePathToFile, '.ts');

                            // If filename is index, we replace it with dirname:
                            if (filename.toLowerCase() === 'index') {
                                filename = path.basename(path.dirname(completePathToFile));
                            }
                            var pathToFile = utils.makeRelativePath(fileToProcessDirectory, completePathToFile.replace('.ts', ''));
                            outputLines.push(completeFileExportTemplate({ filename: filename, pathToFile: pathToFile }));
                        });
                    } else {
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
exports.transformFiles = transformFiles;
//# sourceMappingURL=transformers.js.map
