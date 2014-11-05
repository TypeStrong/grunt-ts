/// <reference path="../defs/tsd.d.ts" />

var grunt: IGrunt = require('grunt');
import fs = require('fs');
import path = require('path');
import utils = require('../tasks/modules/utils');
import _ = require('lodash');

function testFile(test, path) {
    var actual = grunt.file.read('test/' + path);
    var expected = grunt.file.read('test/expected/' + path);
    test.equal(expected, actual, 'tested path: ' + path);
}

function testExpectedFile(test, path: string) {
    var actual = grunt.file.read(path.replace('\\expected', '').replace('/expected', ''));
    var expected = grunt.file.read(path);
    test.equal(expected, actual, 'tested path: ' + path);
}

function testDirectory(test, folder) {
    var files = utils.getFiles(('test/expected/' + folder));
    _.forEach(files, (expected: string) => {
        testExpectedFile(test, expected);
    });
}

export var typescript = {
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
    customcompiler: function (test) {
        testDirectory(test, 'customcompiler');
        test.done();
    },
    fail: function (test) {
        testDirectory(test, 'fail'); // tested to make sure transformers still run for failing task
        test.done();
    }
}
