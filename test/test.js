/// <reference path="../defs/tsd.d.ts" />
"use strict";
var grunt = require('grunt');
var testHelpers_1 = require('./testHelpers');
exports.tests = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },
    simple: function (test) {
        testHelpers_1.testFile(test, 'simple/js/zoo.js', true);
        testHelpers_1.testFile(test, 'simple/js/zoo.d.ts');
        test.done();
    },
    abtest: function (test) {
        testHelpers_1.testFile(test, 'abtest/reference.ts');
        testHelpers_1.testFile(test, 'abtest/out.js', true);
        test.done();
    },
    allowJs: function (test) {
        testHelpers_1.testDirectory(test, 'allowJs');
        test.done();
    },
    amdloader: function (test) {
        testHelpers_1.testDirectory(test, 'amdloader');
        test.done();
    },
    templateCache: function (test) {
        testHelpers_1.testDirectory(test, 'templateCache');
        test.done();
    },
    html2ts: function (test) {
        testHelpers_1.testDirectory(test, 'html');
        testHelpers_1.testDirectory(test, 'htmlTemplate');
        testHelpers_1.testDirectory(test, 'htmlSnakeModuleName');
        test.done();
    },
    index: function (test) {
        testHelpers_1.testDirectory(test, 'index');
        test.done();
    },
    transform: function (test) {
        testHelpers_1.testDirectory(test, 'transform', true);
        test.done();
    },
    referencesTransform: function (test) {
        testHelpers_1.testDirectory(test, 'references-transform');
        test.done();
    },
    customcompiler: function (test) {
        testHelpers_1.testDirectory(test, 'customcompiler');
        test.done();
    },
    fail: function (test) {
        testHelpers_1.testDirectory(test, 'fail'); // tested to make sure transformers still run for failing task
        test.done();
    },
    es6: function (test) {
        testHelpers_1.testDirectory(test, 'es6');
        test.done();
    },
    noEmitOnError: function (test) {
        testHelpers_1.testDirectory(test, 'noEmitOnError');
        testHelpers_1.assertFileDoesNotExist(test, 'test/noEmitOnError/testNoEmitOnError_true.js');
        test.done();
    },
    preserveConstEnums: function (test) {
        testHelpers_1.testDirectory(test, 'preserveConstEnums');
        test.done();
    },
    suppressImplicitAnyIndexErrors: function (test) {
        testHelpers_1.testDirectory(test, 'suppressImplicitAnyIndexErrors');
        testHelpers_1.assertFileDoesNotExist(test, 'test/suppressImplicitAnyIndexErrors/test_suppressImplicitAnyIndexError_false.js');
        test.done();
    },
    varReplacedTest: function (test) {
        testHelpers_1.testDirectory(test, 'varreplacedtest');
        test.done();
    },
    vsproj_test_ignoreSettings: function (test) {
        testHelpers_1.testDirectory(test, 'vsproj/ignoreSettings');
        test.done();
    },
    files_ObjectFormat: function (test) {
        testHelpers_1.testDirectory(test, 'files_ObjectFormat', true);
        test.done();
    },
    out_and_outdir_with_spaces: function (test) {
        testHelpers_1.testDirectory(test, 'out with spaces');
        test.done();
    },
    htmlExternal: function (test) {
        testHelpers_1.testDirectory(test, 'htmlExternal');
        test.done();
    },
    nestedSources: function (test) {
        testHelpers_1.testDirectory(test, 'nestedSources');
        test.done();
    }
};
//# sourceMappingURL=test.js.map