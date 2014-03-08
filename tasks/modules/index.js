/// <reference path="../../defs/tsd.d.ts"/>
var _ = require('underscore');

var path = require('path');
var fs = require('fs');

// setup from grunt-ts
exports.grunt;

/////////////////////////////////////////////////////////////////////
// index : used to make external modules access easier
////////////////////////////////////////////////////////////////////
function indexDirectory(destFolder) {
    // create an index directory if not already there:
    if (!fs.existsSync(path.join(destFolder, 'index'))) {
        // Create this directory
    } else {
        // empty this directory
    }
}
exports.indexDirectory = indexDirectory;
//# sourceMappingURL=index.js.map
