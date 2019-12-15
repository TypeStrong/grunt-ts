/// <reference path="../../defs/tsd.d.ts"/>
"use strict";
var path = require("path");
var fs = require("fs");
var os = require("os");
var util = require("util");
var _ = require("lodash");
var es6_promise_1 = require("es6-promise");
exports.grunt = require('grunt');
exports.eol = exports.grunt.util.linefeed;
function newLineIsRedundantForTsc(newLineParameter, operatingSystem) {
    if (operatingSystem === void 0) { operatingSystem = os; }
    return ((newLineParameter === 'CRLF' && operatingSystem.EOL === '\r\n') ||
        (newLineParameter === 'LF' && operatingSystem.EOL === '\n'));
}
exports.newLineIsRedundantForTsc = newLineIsRedundantForTsc;
function newLineActualAsParameter(actualNewLineChars) {
    if (actualNewLineChars) {
        return actualNewLineChars.replace(/\n/g, 'LF').replace(/\r/g, 'CR');
    }
    return '';
}
exports.newLineActualAsParameter = newLineActualAsParameter;
function newLineParameterAsActual(parameterNewLineChars) {
    if (parameterNewLineChars) {
        return parameterNewLineChars.replace(/LF/g, '\n').replace(/CR/g, '\r');
    }
    return '';
}
exports.newLineParameterAsActual = newLineParameterAsActual;
// Converts "C:\boo" , "C:\boo\foo.ts" => "./foo.ts"; Works on unix as well.
function makeRelativePath(folderpath, filename, forceRelative) {
    if (forceRelative === void 0) { forceRelative = false; }
    var relativePath = path.relative(folderpath, filename).split('\\').join('/');
    if (forceRelative && relativePath[0] !== '.') {
        relativePath = './' + relativePath;
    }
    return relativePath;
}
exports.makeRelativePath = makeRelativePath;
// Finds the longest common section of a collection of strings.
// Simply sorting and comparing first and last http://stackoverflow.com/a/1917041/390330
function sharedStart(array) {
    if (array.length === 0) {
        throw 'Cannot find common root of empty array.';
    }
    var A = array.slice(0).sort(), firstWord = A[0], lastWord = A[A.length - 1];
    if (firstWord === lastWord) {
        return firstWord;
    }
    else {
        var i = -1;
        do {
            i += 1;
            var firstWordChar = firstWord.charAt(i);
            var lastWordChar = lastWord.charAt(i);
        } while (firstWordChar === lastWordChar);
        return firstWord.substring(0, i);
    }
}
// Finds the common system path between paths
// Explanation of how is inline
function findCommonPath(paths, pathSeperator) {
    // Now for "C:\u\starter" "C:\u\started" => "C:\u\starte"
    var largetStartSegement = sharedStart(paths);
    // For "C:\u\starte" => C:\u\
    var ending = largetStartSegement.lastIndexOf(pathSeperator);
    return largetStartSegement.substr(0, ending);
}
exports.findCommonPath = findCommonPath;
/**
 * Returns the result of an array inserted into another, starting at the given index.
 */
function insertArrayAt(array, index, arrayToInsert) {
    var updated = array.slice(0);
    var spliceAt = [index, 0];
    Array.prototype.splice.apply(updated, spliceAt.concat(arrayToInsert));
    return updated;
}
exports.insertArrayAt = insertArrayAt;
/**
 * Compares the end of the string with the given suffix for literal equality.
 *
 * @returns {boolean} whether the string ends with the suffix literally.
 */
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
exports.endsWith = endsWith;
function possiblyQuotedRelativePath(thePath, relativeTo) {
    if (relativeTo === void 0) { relativeTo = '.'; }
    return enclosePathInQuotesIfRequired(path.relative(relativeTo, path.resolve(thePath)));
}
exports.possiblyQuotedRelativePath = possiblyQuotedRelativePath;
function quotedRelativePath(thePath, relativeTo) {
    if (relativeTo === void 0) { relativeTo = '.'; }
    return "\"" + stripQuotesIfQuoted(path.relative(relativeTo, path.resolve(thePath))) + "\"";
}
exports.quotedRelativePath = quotedRelativePath;
function stripQuotesIfQuoted(possiblyQuotedString) {
    if (!possiblyQuotedString.length || possiblyQuotedString.length < 2) {
        return possiblyQuotedString;
    }
    if (possiblyQuotedString.charAt(0) === '"' &&
        possiblyQuotedString.charAt(possiblyQuotedString.length - 1) === '"') {
        return possiblyQuotedString.substr(1, possiblyQuotedString.length - 2);
    }
    return possiblyQuotedString;
}
exports.stripQuotesIfQuoted = stripQuotesIfQuoted;
function isJavaScriptFile(filePath) {
    if (filePath.toLowerCase) {
        var normalizedFile = path.resolve(stripQuotesIfQuoted(filePath)).toLowerCase();
        return endsWith(normalizedFile, '.js');
    }
    return false;
}
exports.isJavaScriptFile = isJavaScriptFile;
/** function for formatting strings
 * ('{0} says {1}','la','ba' ) => 'la says ba'
 */
function format(str) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return str.replace(/{(\d+)}/g, function (m, i) {
        return args[i] !== undefined ? args[i] : m;
    });
}
exports.format = format;
/**
 * Get a random hex value
 *
 * @returns {string} hex string
 */
function getRandomHex(length) {
    if (length === void 0) { length = 16; }
    var name = '';
    do {
        name += Math.round(Math.random() * Math.pow(16, 8)).toString(16);
    } while (name.length < length);
    return name.substr(0, length);
}
exports.getRandomHex = getRandomHex;
/**
 * Get a unique temp file
 *
 * @returns {string} unique-ish path to file in given directory.
 * @throws when it cannot create a temp file in the specified directory
 */
function getTempFile(prefix, dir, extension) {
    if (dir === void 0) { dir = ''; }
    if (extension === void 0) { extension = '.tmp.txt'; }
    prefix = (prefix ? prefix + '-' : '');
    if(dir !== '' && !fs.existsSync(dir)) {
        fs.mkdirSync(dir);   
    }
    var attempts = 100;
    do {
        var name = prefix + getRandomHex(8) + extension;
        var dest = path.join(dir, name);
        if (!fs.existsSync(dest)) {
            return dest;
        }
        attempts--;
    } while (attempts > 0);
    throw 'Cannot create temp file in ' + dir;
}
exports.getTempFile = getTempFile;
/////////////////////////////////////////////////////////////////////////
// From https://github.com/centi/node-dirutils/blob/master/index.js
// Slightly modified. See BAS
////////////////////////////////////////////////////////////////////////
/**
 * Get all files from a directory and all its subdirectories.
 * @param {String} dirPath A path to a directory
 * @param {RegExp|Function} exclude Defines which files should be excluded.
     Can be a RegExp (whole filepath is tested) or a Function which will get the filepath
     as an argument and should return true (exclude file) or false (do not exclude).
 * @returns {Array} An array of files
 */
function getFiles(dirPath, exclude) {
    return _getAll(dirPath, exclude, true);
}
exports.getFiles = getFiles;
;
/**
 * Get all directories from a directory and all its subdirectories.
 * @param {String} dirPath A path to a directory
 * @param {RegExp|Function} exclude Defines which directories should be excluded.
    Can be a RegExp (whole dirpath is tested) or a Function which will get the dirpath
    as an argument and should return true (exclude dir) or false (do not exclude).
 * @returns {Array} An array of directories
 */
function getDirs(dirPath, exclude) {
    return _getAll(dirPath, exclude, false);
}
exports.getDirs = getDirs;
;
/**
 * Get all files or directories from a directory and all its subdirectories.
 * @param {String} dirPath A path to a directory
 * @param {RegExp|Function} exclude Defines which files or directories should be excluded.
    Can be a RegExp (whole path is tested) or a Function which will get the path
    as an argument and should return true (exclude) or false (do not exclude).
 * @param {Boolean} getFiles Whether to get files (true) or directories (false).
 * @returns {Array} An array of files or directories
 */
function _getAll(dirPath, exclude, getFiles) {
    var _checkDirResult = _checkDirPathArgument(dirPath);
    var _checkExcludeResult;
    var items = [];
    if (util.isError(_checkDirResult)) {
        return _checkDirResult;
    }
    if (exclude) {
        _checkExcludeResult = _checkExcludeArgument(exclude);
        if (util.isError(_checkExcludeResult)) {
            return _checkExcludeResult;
        }
    }
    fs.readdirSync(dirPath).forEach(function (_item) {
        var _itempath = path.normalize(dirPath + '/' + _item);
        if (exclude) {
            if (util.isRegExp(exclude)) {
                if (exclude.test(_itempath)) {
                    return;
                }
            }
            else {
                if (exclude(_itempath)) {
                    return;
                }
            }
        }
        if (fs.statSync(_itempath).isDirectory()) {
            if (!getFiles) {
                items.push(_itempath);
            }
            items = items.concat(_getAll(_itempath, exclude, getFiles));
        }
        else {
            if (getFiles === true) {
                items.push(_itempath);
            }
        }
    });
    return items;
}
/**
 * Check if the dirPath is provided and if it does exist on the filesystem.
 * @param {String} dirPath A path to the directory
 * @returns {String|Error} Returns the dirPath if everything is allright or an Error otherwise.
 */
function _checkDirPathArgument(dirPath) {
    if (!dirPath || dirPath === '') {
        return new Error('Dir path is missing!');
    }
    if (!fs.existsSync(dirPath)) {
        return new Error('Dir path does not exist: ' + dirPath);
    }
    return dirPath;
}
/**
 * Check if the exclude argument is a RegExp or a Function.
 * @param {RegExp|Function} exclude A RegExp or a Function which returns true/false.
 * @returns {String|Error} Returns the exclude argument if everything is allright or an Error otherwise.
 */
function _checkExcludeArgument(exclude) {
    if (!util.isRegExp(exclude) && typeof (exclude) !== 'function') {
        return new Error('Argument exclude should be a RegExp or a Function');
    }
    return exclude;
}
function firstElementWithValue(elements, defaultResult) {
    if (defaultResult === void 0) { defaultResult = null; }
    var result = defaultResult;
    _.each(elements, function (item) {
        if (hasValue(item)) {
            result = item;
            return false; // break out of lodash loop
        }
        return undefined;
    });
    return result;
}
exports.firstElementWithValue = firstElementWithValue;
function hasValue(thing) {
    return !_.isNull(thing) && !_.isUndefined(thing);
}
exports.hasValue = hasValue;
function getOrGetFirst(getFrom) {
    if (_.isArray(getFrom)) {
        if (getFrom.length > 0) {
            return getFrom[0];
        }
        return '';
    }
    return getFrom;
}
exports.getOrGetFirst = getOrGetFirst;
function enclosePathInQuotesIfRequired(path) {
    if (!path || !path.indexOf) {
        return path;
    }
    if (path.indexOf(' ') === -1) {
        return path;
    }
    else {
        var newPath = path.trim();
        if (newPath.indexOf('"') === 0 && newPath.lastIndexOf('"') === newPath.length - 1) {
            return newPath;
        }
        else {
            return '"' + newPath + '"';
        }
    }
}
exports.enclosePathInQuotesIfRequired = enclosePathInQuotesIfRequired;
/**
 * Time a function and print the result.
 *
 * @param makeIt the code to time
 * @returns the result of the block of code
 */
function timeIt(makeIt) {
    var starttime = new Date().getTime();
    var it = makeIt();
    var endtime = new Date().getTime();
    return {
        it: it,
        time: endtime - starttime
    };
}
exports.timeIt = timeIt;
/**
 * Run a map operation async in series (simplified)
 */
function asyncSeries(items, callPerItem) {
    items = items.slice(0);
    var memo = [];
    // Run one at a time
    return new es6_promise_1.Promise(function (resolve, reject) {
        var next = function () {
            if (items.length === 0) {
                resolve(memo);
                return;
            }
            es6_promise_1.Promise
                .cast(callPerItem(items.shift()))
                .then(function (result) {
                memo.push(result);
                next();
            }, reject);
        };
        next();
    });
}
exports.asyncSeries = asyncSeries;
function copyFile(srcFile, destFile, callback, encoding) {
    if (encoding === void 0) { encoding = 'utf8'; }
    fs.readFile(srcFile, encoding, function (err, data) {
        fs.writeFile(destFile, data, encoding, function (err) {
            if (err) {
                return callback(err);
            }
            return callback();
        });
    });
}
exports.copyFile = copyFile;
function readAndParseJSONFromFileSync(fileName, encoding) {
    if (encoding === void 0) { encoding = 'utf8'; }
    var textContent, result;
    try {
        textContent = fs.readFileSync(fileName, encoding);
    }
    catch (ex) {
        throw new Error("Error reading file " + fileName + ": " + ex);
    }
    try {
        result = JSON.parse(textContent);
    }
    catch (ex) {
        throw new Error("Error parsing JSON in file " + fileName + ": " + ex);
    }
    return result;
}
exports.readAndParseJSONFromFileSync = readAndParseJSONFromFileSync;
function shouldCompile(options) {
    return !!options.compile;
}
exports.shouldCompile = shouldCompile;
function shouldPassThrough(options) {
    return (options.tsconfig && options.tsconfig.passThrough);
}
exports.shouldPassThrough = shouldPassThrough;
function prependIfNotStartsWith(baseString, prependThisMaybe) {
    if (!baseString) {
        return prependThisMaybe;
    }
    if (baseString.length < prependThisMaybe.length) {
        return prependThisMaybe + baseString;
    }
    if (baseString.substr(0, prependThisMaybe.length) === prependThisMaybe) {
        return baseString;
    }
    return prependThisMaybe + baseString;
}
exports.prependIfNotStartsWith = prependIfNotStartsWith;
// "polyfill" for path.isAbsolute() which is not supported on Node.js 0.10
// (really this is just the code from Node.js 7)
function isAbsolutePath(thePath) {
    if (path.isAbsolute && typeof path.isAbsolute === 'function') {
        return path.isAbsolute(thePath);
    }
    var len = thePath.length;
    if (len === 0) {
        return false;
    }
    var code = thePath.charCodeAt(0);
    if (code === 47 /*/*/ || code === 92 /*\\*/) {
        return true;
    }
    else if ((code >= 65 /*A*/ && code <= 90 /*Z*/) || (code >= 97 /*a*/ && code <= 122 /*z*/)) {
        // Possible device root
        if (len > 2 && thePath.charCodeAt(1) === 58 /*:*/) {
            code = thePath.charCodeAt(2);
            if (code === 47 /*/*/ || code === 92 /*\\*/) {
                return true;
            }
        }
    }
    return false;
}
exports.isAbsolutePath = isAbsolutePath;
//# sourceMappingURL=utils.js.map