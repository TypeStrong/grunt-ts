/// <reference path="../defs/tsd.d.ts" />
var grunt = require('grunt');

var utils = require('../tasks/modules/utils');
var _ = require('underscore');

function testFile(test, path) {
    var actual = grunt.file.read('test/' + path);
    var expected = grunt.file.read('test/expected/' + path);
    test.equal(expected, actual, 'tested path: ' + path);
}

function testExpectedFile(test, path) {
    var actual = grunt.file.read(path.replace('\\expected', '').replace('/expected', ''));
    var expected = grunt.file.read(path);
    test.equal(expected, actual, 'tested path: ' + path);
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
    index: function (test) {
        testDirectory(test, 'index');
        test.done();
    }
};
//# sourceMappingURL=test.js.map
