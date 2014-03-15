/// <reference path="../../defs/tsd.d.ts"/>
// Source based on : https://github.com/tschaub/grunt-newer/blob/master/lib/util.js
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var grunt = require('grunt');

//////////////////////
//  Basic algo:
//        - We have a timestamp file per target.
//        - We use the mtime of this file to filter out
//              new files for this target
//        - Finally we can update the timestamp file with new time
/////////////////////
function getStampPath(targetName) {
    return path.join('.tscache', targetName, 'timestamp');
}

function getLastSuccessfullCompile(targetName) {
    var stampFile = getStampPath(targetName);
    try  {
        return fs.statSync(stampFile).mtime;
    } catch (err) {
        // task has never succeeded before
        return new Date(0);
    }
}

function getFilesNewerThan(paths, time) {
    var filtered = _.filter(paths, function (path) {
        var stats = fs.statSync(path);
        return stats.mtime > time;
    });
    return filtered;
}

function anyNewerThan(paths, time) {
    return getFilesNewerThan(paths, time).length > 0;
}
exports.anyNewerThan = anyNewerThan;

/**
* Filter a list of files by target
*/
function getNewFilesForTarget(paths, targetName) {
    var time = getLastSuccessfullCompile(targetName);
    return getFilesNewerThan(paths, time);
}
exports.getNewFilesForTarget = getNewFilesForTarget;
;

/**
* Update the timestamp for a target to denote last successful compile
*/
function compileSuccessfull(targetName) {
    grunt.file.write(getStampPath(targetName), '');
}
exports.compileSuccessfull = compileSuccessfull;
//# sourceMappingURL=cacheUtils.js.map
