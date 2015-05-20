/// <reference path="../defs/tsd.d.ts" />
var grunt = require('grunt');
var utils = require('../tasks/modules/utils');
var _ = require('lodash');
function testFile(test, path) {
    var actualFileName = 'test/' + path, expectedFileName = 'test/expected/' + path;
    var actual = grunt.file.read(actualFileName);
    var expected = grunt.file.read(expectedFileName);
    test.equal(expected, actual, 'Actual did not match expected:' + grunt.util.linefeed +
        actualFileName + grunt.util.linefeed +
        expectedFileName);
}
function assertFileDoesNotExist(test, path) {
    var exists = grunt.file.exists(path);
    test.equal(false, exists, 'Expected this file to not exist: ' + path);
}
function testExpectedFile(test, path) {
    var actualFileName = path.replace('\\expected', '').replace('/expected', ''), expectedFileName = path;
    var actual = grunt.file.read(actualFileName);
    var expected = grunt.file.read(expectedFileName);
    test.equal(expected, actual, 'Actual did not match expected:' + grunt.util.linefeed +
        actualFileName + grunt.util.linefeed +
        expectedFileName);
}
function testDirectory(test, folder) {
    var files = utils.getFiles(('test/expected/' + folder));
    _.forEach(files, function (expected) {
        testExpectedFile(test, expected);
    });
}
exports.typescript = {
    simple: function (test) {
        testFile(test, 'simple/js/zoo.js');
        testFile(test, 'simple/js/zoo.d.ts');
        test.done();
    },
    abtest: function (test) {
        testFile(test, 'abtest/reference.ts');
        testFile(test, 'abtest/out.js');
        test.done();
    },
    amdloader: function (test) {
        testDirectory(test, 'amdloader');
        test.done();
    },
    templateCache: function (test) {
        testDirectory(test, 'templateCache');
        test.done();
    },
    html2ts: function (test) {
        testDirectory(test, 'html');
        testDirectory(test, 'htmlTemplate');
        test.done();
    },
    index: function (test) {
        testDirectory(test, 'index');
        test.done();
    },
    transform: function (test) {
        testDirectory(test, 'transform');
        test.done();
    },
    referencesTransform: function (test) {
        testDirectory(test, 'references-transform');
        test.done();
    },
    customcompiler: function (test) {
        testDirectory(test, 'customcompiler');
        test.done();
    },
    fail: function (test) {
        testDirectory(test, 'fail'); // tested to make sure transformers still run for failing task
        test.done();
    },
    es6: function (test) {
        testDirectory(test, 'es6');
        test.done();
    },
    noEmitOnError: function (test) {
        testDirectory(test, 'noEmitOnError');
        assertFileDoesNotExist(test, 'test/noEmitOnError/testNoEmitOnError_true.js');
        test.done();
    },
    preserveConstEnums: function (test) {
        testDirectory(test, 'preserveConstEnums');
        test.done();
    },
    suppressImplicitAnyIndexErrors: function (test) {
        testDirectory(test, 'suppressImplicitAnyIndexErrors');
        assertFileDoesNotExist(test, 'test/suppressImplicitAnyIndexErrors/test_suppressImplicitAnyIndexError_false.js');
        test.done();
    },
    varReplacedTest: function (test) {
        testDirectory(test, 'varreplacedtest');
        test.done();
    },
    vsproj_test: function (test) {
        testDirectory(test, 'vsproj/vsproj_test');
        test.done();
    },
    vsproj_test_config: function (test) {
        testDirectory(test, 'vsproj/vsproj_test_config');
        test.done();
    },
    vsproj_test_ignoreSettings: function (test) {
        testDirectory(test, 'vsproj/ignoreSettings');
        test.done();
    files_ObjectFormat: function (test) {
        testDirectory(test, 'files_ObjectFormat');
        test.done();
    },
        test.done();
    },
    files_ArrayFormatJS: function (test) {
        testDirectory(test, 'multifile/files_testFilesUsedWithDestAsAJSFile');
        test.done();
    },
    files_ArrayFormatFolder: function (test) {
        testDirectory(test, 'multifile/files_testFilesUsedWithDestAsAJSFolder');
        test.done();
    },
    out_and_outdir_with_spaces: function (test) {
        testDirectory(test, 'out with spaces');
        test.done();
    },
    htmlExternal: function (test) {
        testDirectory(test, 'htmlExternal');
    }
};
//# sourceMappingURL=test.js.map