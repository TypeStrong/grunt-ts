"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var _ = require("lodash");
var path = require("path");
var crypto = require("crypto");
var grunt = require('grunt');
var rimraf = require('rimraf');
exports.cacheDir = '.tscache';
function getStampPath(targetName) {
    return path.join(exports.cacheDir, targetName, 'timestamp');
}
function getLastSuccessfullCompile(targetName) {
    var stampFile = getStampPath(targetName);
    try {
        return fs.statSync(stampFile).mtime;
    }
    catch (err) {
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
function filterPathsByTime(paths, targetName) {
    var time = getLastSuccessfullCompile(targetName);
    return getFilesNewerThan(paths, time);
}
exports.filterPathsByTime = filterPathsByTime;
function getHashPath(filePath, targetName) {
    var hashedName = path.basename(filePath) + '-' + crypto.createHash('md5').update(filePath).digest('hex');
    return path.join(exports.cacheDir, targetName, 'hashes', hashedName);
}
function getExistingHash(filePath, targetName) {
    var hashPath = getHashPath(filePath, targetName);
    var exists = fs.existsSync(hashPath);
    if (!exists) {
        return null;
    }
    return fs.readFileSync(hashPath).toString();
}
function generateFileHash(filePath) {
    var md5sum = crypto.createHash('md5');
    var data = fs.readFileSync(filePath);
    md5sum.update(data);
    return md5sum.digest('hex');
}
function filterPathsByHash(filePaths, targetName) {
    var filtered = _.filter(filePaths, function (filePath) {
        var previous = getExistingHash(filePath, targetName);
        var current = generateFileHash(filePath);
        return previous !== current;
    });
    return filtered;
}
function updateHashes(filePaths, targetName) {
    _.forEach(filePaths, function (filePath) {
        var hashPath = getHashPath(filePath, targetName);
        var hash = generateFileHash(filePath);
        grunt.file.write(hashPath, hash);
    });
}
function getNewFilesForTarget(paths, targetName) {
    var step1 = filterPathsByTime(paths, targetName);
    var step2 = filterPathsByHash(step1, targetName);
    return step2;
}
exports.getNewFilesForTarget = getNewFilesForTarget;
function compileSuccessfull(paths, targetName) {
    grunt.file.write(getStampPath(targetName), '');
    updateHashes(paths, targetName);
}
exports.compileSuccessfull = compileSuccessfull;
function clearCache(targetName) {
    var cacheDirForTarget = path.join(exports.cacheDir, targetName);
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
exports.clearCache = clearCache;
//# sourceMappingURL=cacheUtils.js.map