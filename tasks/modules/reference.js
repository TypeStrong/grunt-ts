/// <reference path="../../defs/tsd.d.ts"/>
var _ = require('underscore');
var _str = require('underscore.string');
var fs = require('fs');
var grunt = require('grunt');

var utils = require('./utils');

/////////////////////////////////////////////////////////////////////
// Reference file logic
////////////////////////////////////////////////////////////////////
// Updates the reference file
function updateReferenceFile(files, generatedFiles, referenceFile, referencePath) {
    var referenceIntro = '/// <reference path="';
    var referenceEnd = '" />';
    var referenceMatch = /\/\/\/ <reference path=\"(.*?)\"/;
    var ourSignatureStart = '//grunt-start';
    var ourSignatureEnd = '//grunt-end';

    // remove the generated files from files:
    files = _.difference(files, generatedFiles);

    var lines = [];
    var origFileLines = [];
    var origFileReferences = [];

    // Location of our generated references
    // By default at start of file
    var signatureSectionPosition = 0;
    var i;

    // Put in the generated files
    generatedFiles = _.map(generatedFiles, function (file) {
        return referenceIntro + utils.makeRelativePath(referencePath, file) + referenceEnd;
    });
    var contents = utils.insertArrayAt([ourSignatureStart], 1, generatedFiles);

    // Iterate through files for constant file referencing/build order.
    // In TFS, local files are readonly in so TFS can handle them, when working in TEAMS it is not possible to include a dynamic, automatically created file in TFS as it is read only.
    // grunt will fail becuase of a file access error. Also, note that file ordering is a team wide resource and so it should be stored in a regenerated file.
    // The solution is using external files, the idea is the same as //grunt-start - //grunt-end but using files as prefix/suffix.
    // The implementation co-exists with the original solution, the files are added inside the dynamic file area to make everyone happy.
    // No settings needed,  create 2 file with the same name as your master reference file and add ".prefix" / ".suffix" to thier name.
    // e.g: for master.ts create 2 files: master.prefix.ts & master.suffix.ts (You can also add one of them...)
    /* PRFIX FILE */
    if (fs.existsSync(i = referenceFile.replace(/\.ts$/, '.prefix.ts'))) {
        // Add it as reference.
        contents.push(referenceIntro + utils.makeRelativePath(referencePath, i) + referenceEnd);

        // get list of its childs to register existing nested references.
        origFileReferences = _.union(origFileReferences, fs.readFileSync(i).toString().split('\n').filter(function (f) {
            return _str.include(f, referenceIntro);
        }).map(function (f) {
            return f.match(referenceMatch)[1];
        }), [utils.makeRelativePath(referencePath, i)]);
    }

    /* SUFFIX FILE */
    var suffixRef;
    if (fs.existsSync(i = referenceFile.replace(/\.ts$/, '.suffix.ts'))) {
        // Save the reference, we will add it before closing. (should be right before //grunt-end)
        suffixRef = referenceIntro + utils.makeRelativePath(referencePath, i) + referenceEnd;

        // get list of its childs to register existing nested references.
        origFileReferences = _.union(origFileReferences, fs.readFileSync(i).toString().split('\n').filter(function (f) {
            return _str.include(f, referenceIntro);
        }).map(function (f) {
            return f.match(referenceMatch)[1];
        }), [utils.makeRelativePath(referencePath, i)]);
    }

    /* END OF FILE PREFIX/SUFFIX addon */
    // Read the original file if it exists
    if (fs.existsSync(referenceFile)) {
        lines = fs.readFileSync(referenceFile).toString().split('\n');

        var inSignatureSection = false;

        // By default our signature goes at end of file
        signatureSectionPosition = lines.length;

        for (i = 0; i < lines.length; i++) {
            var line = _str.trim(lines[i]);

            // Skip logic for our generated section
            if (_str.include(line, ourSignatureStart)) {
                // Wait for the end signature:
                signatureSectionPosition = i;
                inSignatureSection = true;
                continue;
            }
            if (_str.include(line, ourSignatureEnd)) {
                inSignatureSection = false;
                continue;
            }
            if (inSignatureSection) {
                continue;
            }

            // store the line
            origFileLines.push(line);

            // Fetch the existing reference's filename if any:
            if (_str.include(line, referenceIntro)) {
                var match = line.match(referenceMatch);
                var filename = match[1];
                origFileReferences.push(filename);
            }
        }
    }

    // Put in the new / observed missing files:
    files.forEach(function (filename) {
        // The file we are about to add
        var filepath = utils.makeRelativePath(referencePath, filename);

        // If there are orig references
        if (origFileReferences.length) {
            if (_.contains(origFileReferences, filepath)) {
                return;
            }
        }

        // Finally add the filepath
        contents.push(referenceIntro + filepath + referenceEnd);
    });

    if (suffixRef)
        contents.push(suffixRef);

    contents.push(ourSignatureEnd);

    // Modify the orig contents to put in our contents
    var updatedFileLines = utils.insertArrayAt(origFileLines, signatureSectionPosition, contents);
    grunt.file.write(referenceFile, updatedFileLines.join('\n'));

    // Return whether the file was changed
    if (lines.length === updatedFileLines.length) {
        var updated = false;
        for (i = 0; i < lines.length; i++) {
            if (lines[i] !== updatedFileLines[i]) {
                updated = true;
            }
        }
        return updated;
    } else {
        return true;
    }
}
exports.updateReferenceFile = updateReferenceFile;
//# sourceMappingURL=reference.js.map
