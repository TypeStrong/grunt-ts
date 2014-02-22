var grunt = require('grunt');
var fs = require('fs');
var path = require('path');

function testFile(test, path){
    var actual = grunt.file.read('test/' + path);
    var expected = grunt.file.read('test/expected/' + path);
    test.equal(expected, actual);
}

module.exports.typescript = {
    simple: function(test) {
        testFile(test,'simple/js/zoo.js');
        testFile(test,'simple/js/zoo.d.ts');
        test.done();
    },
    abtest: function(test){
        testFile(test,'abtest/reference.ts');
        testFile(test,'abtest/out.js');        
        test.done();
    }
}