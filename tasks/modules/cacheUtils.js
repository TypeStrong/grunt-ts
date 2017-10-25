"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var _ = require("lodash");
var path = require("path");
var crypto = require("crypto");
var grunt = require('grunt');
var rimraf = require('rimraf');
function getStampPath(targetName, cacheDir) {
    return path.join(cacheDir, targetName, 'timestamp');
}
function getLastSuccessfullCompile(targetName, cacheDir) {
    var stampFile = getStampPath(targetName, cacheDir);
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
function filterPathsByTime(paths, targetName, cacheDir) {
    var time = getLastSuccessfullCompile(targetName, cacheDir);
    return getFilesNewerThan(paths, time);
}
exports.filterPathsByTime = filterPathsByTime;
function getHashPath(filePath, targetName, cacheDir) {
    var hashedName = path.basename(filePath) + '-' + crypto.createHash('md5').update(filePath).digest('hex');
    return path.join(cacheDir, targetName, 'hashes', hashedName);
}
function getExistingHash(filePath, targetName, cacheDir) {
    var hashPath = getHashPath(filePath, targetName, cacheDir);
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
function filterPathsByHash(filePaths, targetName, cacheDir) {
    var filtered = _.filter(filePaths, function (filePath) {
        var previous = getExistingHash(filePath, targetName, cacheDir);
        var current = generateFileHash(filePath);
        return previous !== current;
    });
    return filtered;
}
function updateHashes(filePaths, targetName, cacheDir) {
    _.forEach(filePaths, function (filePath) {
        var hashPath = getHashPath(filePath, targetName, cacheDir);
        var hash = generateFileHash(filePath);
        grunt.file.write(hashPath, hash);
    });
}
function getNewFilesForTarget(paths, targetName, cacheDir) {
    var step1 = filterPathsByTime(paths, targetName, cacheDir);
    var step2 = filterPathsByHash(step1, targetName, cacheDir);
    return step2;
}
exports.getNewFilesForTarget = getNewFilesForTarget;
function compileSuccessfull(paths, targetName, cacheDir) {
    grunt.file.write(getStampPath(targetName, cacheDir), '');
    updateHashes(paths, targetName, cacheDir);
}
exports.compileSuccessfull = compileSuccessfull;
function clearCache(targetName, cacheDir) {
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
exports.clearCache = clearCache;
//# sourceMappingURL=cacheUtils.js.map