var grunt = require("grunt");
var fs = require("fs");
var path = require("path");

module.exports.typescript = {
    simple:function (test) {
        "use strict";

        test.expect(1);

        var actual = grunt.file.read("test/fixtures/simple.js");
        var expected = grunt.file.read("test/expected/simple.js");
        test.equal(expected, actual);

        test.done();
    },
    declaration:function (test) {
        "use strict";

        test.expect(2);

        var actual = grunt.file.read("test/fixtures/declaration.js");
        var expected = grunt.file.read("test/expected/declaration.js");
        test.equal(expected, actual);

        actual = grunt.file.read("test/fixtures/declaration.d.ts");
        expected = grunt.file.read("test/expected/declaration.d.ts");
        test.equal(expected, actual);

        test.done();
    },
    sourcemap:function(test){
        "use strict";

        test.expect(2);

        var actual = grunt.file.read("test/fixtures/sourcemap/sourcemap.js");
        var expected = grunt.file.read("test/expected/sourcemap/sourcemap.js");
        //save for debugging
        grunt.file.write("test/fixtures/sourcemap/sourcemap-expected.js", expected);

        test.equal(expected, actual, 'incorrect output javascript');


        actual = grunt.file.read("test/fixtures/sourcemap/sourcemap.js.map");
        expected = grunt.file.read("test/expected/sourcemap/sourcemap.js.map");

        //save for debugging
        grunt.file.write("test/fixtures/sourcemap/sourcemap-expected.js.map", expected);

        test.equal(expected, actual, 'incorrect sourcemap');

        test.done();
    },
    "sourcemap-fullpath":function(test) {
        "use strict";

        test.expect(2);

        var full = path.dirname(path.resolve("test/fixtures/sourcemap/sourcemap-fullpath.ts"));
        //make file url with forward slashes
        full = 'file:///' + full.replace(/\\/g, '/');

        var actual = grunt.file.read("test/fixtures/sourcemap/sourcemap-fullpath.js");
        var expected = grunt.file.read("test/expected/sourcemap/sourcemap-fullpath.js");
        expected = expected.replace('####MAP####', full + '/sourcemap-fullpath.js.map');

        //save for debugging
        grunt.file.write("test/fixtures/sourcemap/sourcemap-fullpath-expected.js", expected);

        test.equal(expected, actual, 'incorrect output javascript');

        actual = grunt.file.read("test/fixtures/sourcemap/sourcemap-fullpath.js.map");
        expected = grunt.file.read("test/expected/sourcemap/sourcemap-fullpath.js.map");
        expected = expected.replace('####JS####', full + '/sourcemap-fullpath.js');
        expected = expected.replace('####TS####', '../sourcemap-fullpath.ts');

        //save for debugging
        grunt.file.write("test/fixtures/sourcemap/sourcemap-fullpath-expected.js.map", expected);

        test.equal(expected, actual, 'incorrect sourcemap');

        test.done();
    },
    es5:function(test){
        "use strict";

        test.expect(1);

        var actual = grunt.file.read("test/fixtures/es5.js");
        var expected = grunt.file.read("test/expected/es5.js");
        test.equal(expected, actual);

        test.done();
    },
    "no-module":function(test){
        "use strict";

        test.expect(1);

        var actual = grunt.file.read("test/fixtures/no-module.js");
        var expected = grunt.file.read("test/expected/no-module.js");
        test.equal(expected, actual);

        test.done();
    },
    amd:function(test){
        "use strict";

        test.expect(1);

        var actual = grunt.file.read("test/fixtures/amd.js");
        var expected = grunt.file.read("test/expected/amd.js");
        test.equal(expected, actual);

        test.done();
    },
    commonjs:function(test){
        "use strict";

        test.expect(1);

        var actual = grunt.file.read("test/fixtures/commonjs.js");
        var expected = grunt.file.read("test/expected/commonjs.js");
        test.equal(expected, actual);

        test.done();
    },
    single:function(test){
        "use strict";

        test.expect(1);
        var actual = grunt.file.read("test/temp/single.js");
        var expected = grunt.file.read("test/expected/single/single.js");

        test.equal(expected, actual);

        test.done();
    },
    multi:function(test){
        "use strict";

        test.expect(2);
        var actual = grunt.file.read("test/temp/multi/test/fixtures/multi/multi1.js");
        var expected = grunt.file.read("test/expected/multi/multi1.js");

        test.equal(expected, actual);

        actual = grunt.file.read("test/temp/multi/test/fixtures/multi/dir/multi2.js");
        expected = grunt.file.read("test/expected/multi/dir/multi2.js");

        test.equal(expected, actual);

        test.done();
    },
    basePath: function(test){
        test.expect(2);
        var actual = grunt.file.read("test/temp/basePath/multi1.js");
        var expected = grunt.file.read("test/expected/multi/multi1.js");

        test.equal(expected, actual);

        actual = grunt.file.read("test/temp/basePath/dir/multi2.js");
        expected = grunt.file.read("test/expected/multi/dir/multi2.js");

        test.equal(expected, actual);

        test.done();
    },
    "utf8-with-bom":function(test){
        "use strict";

        test.expect(1);
        var actual = grunt.file.read("test/fixtures/utf8-with-bom.js");
        var expected = grunt.file.read("test/expected/utf8-with-bom.js");

        test.equal(expected, actual);

        test.done();
    },
    comments:function(test){
        "use strict";

        test.expect(1);
        var actual = grunt.file.read("test/fixtures/comments.js");
        var expected = grunt.file.read("test/expected/comments.js");

        test.equal(expected, actual);

        test.done();
    }
};
