"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var path = require("path");
var fs = require("fs");
var utils = require("./utils");
var grunt = utils.grunt;
var pathSeperator = path.sep;
function getReferencesInOrder(referenceFile, referencePath, generatedFiles) {
    var toreturn = {
        all: [],
        before: [],
        generated: [],
        unordered: [],
        after: []
    };
    var sortedGeneratedFiles = _.sortBy(generatedFiles);
    function isGeneratedFile(filename) {
        return _.indexOf(sortedGeneratedFiles, filename, true) !== -1;
    }
    var referenceMatch = /\/\/\/ <reference path=\"(.*?)\"/;
    var referenceIntro = '/// <reference path="';
    var ourSignatureStart = '//grunt-start';
    var ourSignatureEnd = '//grunt-end';
    var lines = fs.readFileSync(referenceFile).toString().split('\n');
    var loopState = 0;
    for (var i = 0; i < lines.length; i++) {
        var line = _.trim(lines[i]);
        if (_.includes(line, ourSignatureStart)) {
            loopState = 1;
        }
        if (_.includes(line, ourSignatureEnd)) {
            loopState = 2;
        }
        if (_.includes(line, referenceIntro)) {
            var match = line.match(referenceMatch);
            var filename = match[1];
            switch (loopState) {
                case 0:
                    toreturn.before.push(filename);
                    break;
                case 1:
                    if (isGeneratedFile(filename)) {
                        toreturn.generated.push(filename);
                    }
                    else {
                        toreturn.unordered.push(filename);
                    }
                    break;
                case 2:
                    toreturn.after.push(filename);
                    break;
            }
        }
    }
    toreturn.before = _.map(toreturn.before, function (relativePath) { return path.resolve(referencePath, relativePath); });
    toreturn.generated = _.map(toreturn.generated, function (relativePath) { return path.resolve(referencePath, relativePath); });
    toreturn.unordered = _.map(toreturn.unordered, function (relativePath) { return path.resolve(referencePath, relativePath); });
    toreturn.after = _.map(toreturn.after, function (relativePath) { return path.resolve(referencePath, relativePath); });
    toreturn.all = Array.prototype.concat.call([], toreturn.before, toreturn.generated, toreturn.unordered, toreturn.after);
    return toreturn;
}
exports.getReferencesInOrder = getReferencesInOrder;
function updateAmdLoader(referenceFile, files, loaderFile, loaderPath, outDir, newLine) {
    if (newLine === void 0) { newLine = utils.eol; }
    var commonPath;
    var makeRelativeToOutDir = function (files) {
        files = _.map(files, function (file) {
            file = file.replace(commonPath, outDir);
            file = file.substr(0, file.lastIndexOf('.'));
            file = utils.makeRelativePath(loaderPath, file);
            file = './' + file;
            return file;
        });
        return files;
    };
    if (fs.existsSync(referenceFile)) {
        grunt.log.verbose.writeln('Generating amdloader from reference file ' + referenceFile);
        if (files.all.length > 0) {
            grunt.log.verbose.writeln('Files: ' + files.all.map(function (f) { return f.cyan; }).join(', '));
        }
        else {
            grunt.warn('No files in reference file: ' + referenceFile);
        }
        if (files.before.length > 0) {
            files.before = _.filter(files.before, function (file) { return !utils.endsWith(file, '.d.ts'); });
            grunt.log.verbose.writeln('Before: ' + files.before.map(function (f) { return f.cyan; }).join(', '));
        }
        if (files.generated.length > 0) {
            files.generated = _.filter(files.generated, function (file) { return !utils.endsWith(file, '.d.ts'); });
            grunt.log.verbose.writeln('Generated: ' + files.generated.map(function (f) { return f.cyan; }).join(', '));
        }
        if (files.unordered.length > 0) {
            files.unordered = _.filter(files.unordered, function (file) { return !utils.endsWith(file, '.d.ts'); });
            grunt.log.verbose.writeln('Unordered: ' + files.unordered.map(function (f) { return f.cyan; }).join(', '));
        }
        if (files.after.length > 0) {
            files.after = _.filter(files.after, function (file) { return !utils.endsWith(file, '.d.ts'); });
            grunt.log.verbose.writeln('After: ' + files.after.map(function (f) { return f.cyan; }).join(', '));
        }
        if (outDir) {
            commonPath = utils.findCommonPath(files.before.concat(files.generated.concat(files.unordered.concat(files.after))), pathSeperator);
            grunt.log.verbose.writeln('Found common path: ' + commonPath);
            outDir = path.resolve(outDir);
            grunt.log.verbose.writeln('Using outDir: ' + outDir);
            grunt.log.verbose.writeln('Making files relative to outDir...');
            files.before = makeRelativeToOutDir(files.before);
            files.generated = makeRelativeToOutDir(files.generated);
            files.unordered = makeRelativeToOutDir(files.unordered);
            files.after = makeRelativeToOutDir(files.after);
            var mainTemplate = _.template('define(function (require) { '
                + newLine + '<%= body %>'
                + newLine + '});');
            var singleRequireTemplate = _.template('\t require([<%= filename %>],function (){'
                + newLine + '<%= subitem %>'
                + newLine + '\t });');
            var subitem = '';
            var binaryTemplate = _.template('define(["<%= filenames %>"],function () {});');
            var binaryFilesNames = files.before.concat(files.generated.concat(files.unordered.concat(files.after)));
            var binaryContent = binaryTemplate({ filenames: binaryFilesNames.join('","') });
            var binFileExtension = '.bin.js';
            var loaderFileWithoutExtension = path.dirname(loaderFile) + pathSeperator + path.basename(loaderFile, '.js');
            var binFilename = loaderFileWithoutExtension + binFileExtension;
            grunt.file.write(binFilename, binaryContent);
            grunt.log.verbose.writeln('Binary AMD loader written ' + binFilename.cyan);
            files.after = files.after.reverse();
            _.forEach(files.after, function (file) {
                subitem = singleRequireTemplate({ filename: '"' + file + '"', subitem: subitem });
            });
            if (files.unordered.length > 0) {
                var unorderFileNames = files.unordered.join('",' + newLine + '\t\t  "');
                subitem = singleRequireTemplate({ filename: '"' + unorderFileNames + '"', subitem: subitem });
            }
            var generatedFileNames = files.generated.join('",' + newLine + '\t\t  "');
            subitem = singleRequireTemplate({ filename: '"' + generatedFileNames + '"', subitem: subitem });
            files.before = files.before.reverse();
            _.forEach(files.before, function (file) {
                subitem = singleRequireTemplate({ filename: '"' + file + '"', subitem: subitem });
            });
            var output = mainTemplate({ body: subitem });
            grunt.file.write(loaderFile, output);
            grunt.log.verbose.writeln('AMD loader written ' + loaderFile.cyan);
        }
    }
    else {
        grunt.log.writeln('Cannot generate amd loader unless a reference file is present'.red);
    }
}
exports.updateAmdLoader = updateAmdLoader;
//# sourceMappingURL=amdLoader.js.map