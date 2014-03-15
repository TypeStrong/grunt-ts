/// <reference path="../../defs/tsd.d.ts"/>

// Source based on : https://github.com/tschaub/grunt-newer/blob/master/lib/util.js

import fs = require('fs');
import _ = require('underscore');
import path = require('path');
var grunt: IGrunt = require('grunt');

//////////////////////
//  Basic algo: 
//        - We have a timestamp file per target. 
//        - We use the mtime of this file to filter out
//              new files for this target
//        - Finally we can update the timestamp file with new time
/////////////////////


function getStampPath(targetName: string): string {
    return path.join('.tscache', targetName, 'timestamp');
}

function getLastSuccessfullCompile(targetName: string): Date {
    var stampFile = getStampPath(targetName);
    try {
        return fs.statSync(stampFile).mtime;
    } catch (err) {
        // task has never succeeded before
        return new Date(0);
    }
}

function getFilesNewerThan(paths: string[], time: Date) {
    var filtered = _.filter(paths, (path) => {
        var stats = fs.statSync(path);
        return stats.mtime > time;
    });
    return filtered;
}

export function anyNewerThan(paths: string[], time: Date) {
    return getFilesNewerThan(paths, time).length > 0;
}

/**
 * Filter a list of files by target
 */
export function getNewFilesForTarget(paths: string[], targetName): string[] {

    var time = getLastSuccessfullCompile(targetName);
    return getFilesNewerThan(paths, time);
};

/**
 * Update the timestamp for a target to denote last successful compile
 */
export function compileSuccessfull(targetName) {
    grunt.file.write(getStampPath(targetName), '');
}
