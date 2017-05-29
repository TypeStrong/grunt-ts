"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var fs = require("fs");
var grunt = require("grunt");
var utils = require("./utils");
function updateReferenceFile(files, generatedFiles, referenceFile, referencePath, eol) {
    var referenceIntro = '/// <reference path="';
    var referenceEnd = '" />';
    var referenceMatch = /\/\/\/ <reference path=\"(.*?)\"/;
    var ourSignatureStart = '//grunt-start';
    var ourSignatureEnd = '//grunt-end';
    files = _.difference(files, generatedFiles);
    var lines = [];
    var origFileLines = [];
    var origFileReferences = [];
    var signatureSectionPosition = 0;
    var i;
    var referenceContents = '';
    if (fs.existsSync(referenceFile)) {
        referenceContents = fs.readFileSync(referenceFile).toString();
        lines = referenceContents.split(/\r\n|\r|\n/);
        var inSignatureSection = false;
        signatureSectionPosition = lines.length;
        for (i = 0; i < lines.length; i++) {
            var line = _.trim(lines[i]);
            if (_.includes(line, ourSignatureStart)) {
                signatureSectionPosition = i;
                inSignatureSection = true;
                continue;
            }
            if (_.includes(line, ourSignatureEnd)) {
                inSignatureSection = false;
                continue;
            }
            if (inSignatureSection) {
                continue;
            }
            origFileLines.push(line);
            if (_.includes(line, referenceIntro)) {
                var match = line.match(referenceMatch);
                var filename = match[1];
                origFileReferences.push(filename);
            }
        }
    }
    generatedFiles = _.map(generatedFiles, function (file) { return referenceIntro + utils.makeRelativePath(referencePath, file) + referenceEnd; });
    var contents = utils.insertArrayAt([ourSignatureStart], 1, generatedFiles);
    files.forEach(function (filename) {
        var filepath = utils.makeRelativePath(referencePath, filename);
        if (origFileReferences.length) {
            if (_.includes(origFileReferences, filepath)) {
                return;
            }
        }
        contents.push(referenceIntro + filepath + referenceEnd);
    });
    contents.push(ourSignatureEnd);
    var updatedFileLines = utils.insertArrayAt(origFileLines, signatureSectionPosition, contents);
    var updatedFileContents = updatedFileLines.join(eol);
    if (updatedFileContents !== referenceContents) {
        grunt.file.write(referenceFile, updatedFileContents);
        return true;
    }
    else {
        return false;
    }
}
exports.updateReferenceFile = updateReferenceFile;
//# sourceMappingURL=reference.js.map