/// <reference path="../../defs/tsd.d.ts"/>

// Source based on : https://github.com/tschaub/grunt-newer/blob/master/lib/util.js

import fs = require('fs');
import _ = require('lodash');
import path = require('path');
import crypto = require('crypto');
var grunt: IGrunt = require('grunt');
var rimraf = require('rimraf');

//////////////////////
//  Basic algo:
//        - We have a timestamp file per target.
//        - We use the mtime of this file to filter out
//              new files for this target
//        - Finally we can update the timestamp file with new time
/////////////////////


//////////////////////////////
// File stamp based filtering
//////////////////////////////

function getStampPath(targetName: string, cacheDir: string): string {
    return path.join(cacheDir, targetName, 'timestamp');
}

function getLastSuccessfullCompile(targetName: string, cacheDir: string): Date {
    var stampFile = getStampPath(targetName, cacheDir);
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

export function filterPathsByTime(paths: string[], targetName, cacheDir: string): string[] {
    var time = getLastSuccessfullCompile(targetName, cacheDir);
    return getFilesNewerThan(paths, time);
}

//////////////////////////////
// File hash based filtering
//////////////////////////////

/**
 * Get path to cached file hash for a target.
 * @return {string} Path to hash.
 */
function getHashPath(filePath: string, targetName: string, cacheDir: string) {
    var hashedName = path.basename(filePath) + '-' + crypto.createHash('md5').update(filePath).digest('hex');
    return path.join(cacheDir, targetName, 'hashes', hashedName);
}

/**
 * Get an existing hash for a file (if it exists).
 */
function getExistingHash(filePath: string, targetName: string, cacheDir: string) {
    var hashPath = getHashPath(filePath, targetName, cacheDir);
    var exists = fs.existsSync(hashPath);
    if (!exists) {
        return null;
    }
    return fs.readFileSync(hashPath).toString();
}

/**
 * Generate a hash (md5sum) of a file contents.
 * @param {string} filePath Path to file.
 */
function generateFileHash(filePath: string) {
    var md5sum = crypto.createHash('md5');
    var data = fs.readFileSync(filePath);
    md5sum.update(data);
    return md5sum.digest('hex');
}

/**
 * Filter files based on hashed contents.
 * @param {Array.<string>} paths List of paths to files.
 * @param {string} targetName Target name.
 * @param {string} cacheDir Cache directory.
 */
function filterPathsByHash(filePaths: string[], targetName: string, cacheDir: string) {

    var filtered = _.filter(filePaths, (filePath) => {
        var previous = getExistingHash(filePath, targetName, cacheDir);
        var current = generateFileHash(filePath);
        return previous !== current;
    });

    return filtered;
}

function updateHashes(filePaths: string[], targetName: string, cacheDir: string) {
    _.forEach(filePaths, (filePath) => {
        var hashPath = getHashPath(filePath, targetName, cacheDir);
        var hash = generateFileHash(filePath);
        grunt.file.write(hashPath, hash);
    });
}

//////////////////////////////
// External functions
//////////////////////////////


/**
 * Filter a list of files by target
 */
export function getNewFilesForTarget(paths: string[], targetName: string, cacheDir: string): string[] {
    var step1 = filterPathsByTime(paths, targetName, cacheDir);
    var step2 = filterPathsByHash(step1, targetName, cacheDir);

    return step2;
}

/**
 * Update the timestamp for a target to denote last successful compile
 */
export function compileSuccessfull(paths: string[], targetName: string, cacheDir: string) {
    // update timestamp
    grunt.file.write(getStampPath(targetName, cacheDir), '');
    // update filehash
    updateHashes(paths, targetName, cacheDir);
}

export function clearCache(targetName: string, cacheDir: string) {
    var cacheDirForTarget = path.join(cacheDir, targetName);
    try {
        if (fs.existsSync(cacheDirForTarget)) {
            rimraf.sync(cacheDirForTarget);
            grunt.log.writeln(('Cleared fast compile cache for target: ' + targetName).cyan);
        }
    }
    catch (ex) {
        grunt.log.writeln(('Failed to clear compile cache for target: ' + targetName).red);
    }
}
