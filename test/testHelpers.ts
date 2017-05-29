var grunt: IGrunt = require('grunt');
import utils = require('../tasks/modules/utils');
import _ = require('lodash');

export function testFile(test, path: string, whitespaceDifferencesOK = false) {
    var actualFileName = 'test/' + path,
        expectedFileName = 'test/expected/' + path;

    var actual = grunt.file.read(actualFileName);
    var expected = grunt.file.read(expectedFileName);

    if (whitespaceDifferencesOK) {
      actual = actual.replace(/\s/g,'');
      expected = expected.replace(/\s/g,'');
    }

    test.equal(expected, actual, `Actual did not match expected.  Run this to compare:` +
      `${grunt.util.linefeed}kdiff3 "${actualFileName}" "${expectedFileName}"`);
}

export function assertFileDoesNotExist(test, path: string) {
    var exists = grunt.file.exists(path);
    test.equal(false, exists, 'Expected this file to not exist: ' + path);
}

export function testExpectedFile(test, path: string, whitespaceDifferencesOK = false) {
    let actualFileName = path.replace('\\expected', '').replace('/expected', '')
      .replace('.expected.', '.');
    let expectedFileName = path;

    var actual = grunt.file.read(actualFileName);
    var expected = grunt.file.read(expectedFileName);

    if (whitespaceDifferencesOK) {
      actual = actual.replace(/\s/g,'');
      expected = expected.replace(/\s/g,'');
    }

    test.equal(expected, actual, `Actual did not match expected.  Run this to compare:` +
      `${grunt.util.linefeed}kdiff3 "${actualFileName}" "${expectedFileName}"`);
}


export function testDirectory(test, folder, whitespaceDifferencesOK = false) {
    var files = utils.getFiles(('test/expected/' + folder));
    _.forEach(files, (expected: string) => {
        testExpectedFile(test, expected, whitespaceDifferencesOK);
    });
}
