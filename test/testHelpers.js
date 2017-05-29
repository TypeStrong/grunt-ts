"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grunt = require('grunt');
var utils = require("../tasks/modules/utils");
var _ = require("lodash");
function testFile(test, path, whitespaceDifferencesOK) {
    if (whitespaceDifferencesOK === void 0) { whitespaceDifferencesOK = false; }
    var actualFileName = 'test/' + path, expectedFileName = 'test/expected/' + path;
    var actual = grunt.file.read(actualFileName);
    var expected = grunt.file.read(expectedFileName);
    if (whitespaceDifferencesOK) {
        actual = actual.replace(/\s/g, '');
        expected = expected.replace(/\s/g, '');
    }
    test.equal(expected, actual, "Actual did not match expected.  Run this to compare:" +
        (grunt.util.linefeed + "kdiff3 \"" + actualFileName + "\" \"" + expectedFileName + "\""));
}
exports.testFile = testFile;
function assertFileDoesNotExist(test, path) {
    var exists = grunt.file.exists(path);
    test.equal(false, exists, 'Expected this file to not exist: ' + path);
}
exports.assertFileDoesNotExist = assertFileDoesNotExist;
function testExpectedFile(test, path, whitespaceDifferencesOK) {
    if (whitespaceDifferencesOK === void 0) { whitespaceDifferencesOK = false; }
    var actualFileName = path.replace('\\expected', '').replace('/expected', '')
        .replace('.expected.', '.');
    var expectedFileName = path;
    var actual = grunt.file.read(actualFileName);
    var expected = grunt.file.read(expectedFileName);
    if (whitespaceDifferencesOK) {
        actual = actual.replace(/\s/g, '');
        expected = expected.replace(/\s/g, '');
    }
    test.equal(expected, actual, "Actual did not match expected.  Run this to compare:" +
        (grunt.util.linefeed + "kdiff3 \"" + actualFileName + "\" \"" + expectedFileName + "\""));
}
exports.testExpectedFile = testExpectedFile;
function testDirectory(test, folder, whitespaceDifferencesOK) {
    if (whitespaceDifferencesOK === void 0) { whitespaceDifferencesOK = false; }
    var files = utils.getFiles(('test/expected/' + folder));
    _.forEach(files, function (expected) {
        testExpectedFile(test, expected, whitespaceDifferencesOK);
    });
}
exports.testDirectory = testDirectory;
//# sourceMappingURL=testHelpers.js.map