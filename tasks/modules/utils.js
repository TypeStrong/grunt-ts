"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function makeRelativePath(folderpath, filename, forceRelative) {
    if (forceRelative === void 0) { forceRelative = false; }
    var relativePath = path.relative(folderpath, filename).split('\\').join('/');
    if (forceRelative && relativePath[0] !== '.') {
        relativePath = './' + relativePath;
    }
    return relativePath;
}
exports.makeRelativePath = makeRelativePath;
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
function findCommonPath(paths, pathSeperator) {
    var largetStartSegement = sharedStart(paths);
    var ending = largetStartSegement.lastIndexOf(pathSeperator);
    return largetStartSegement.substr(0, ending);
}
exports.findCommonPath = findCommonPath;
function insertArrayAt(array, index, arrayToInsert) {
    var updated = array.slice(0);
    var spliceAt = [index, 0];
    Array.prototype.splice.apply(updated, spliceAt.concat(arrayToInsert));
    return updated;
}
exports.insertArrayAt = insertArrayAt;
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
function getRandomHex(length) {
    if (length === void 0) { length = 16; }
    var name = '';
    do {
        name += Math.round(Math.random() * Math.pow(16, 8)).toString(16);
    } while (name.length < length);
    return name.substr(0, length);
}
exports.getRandomHex = getRandomHex;
function getTempFile(prefix, dir, extension) {
    if (dir === void 0) { dir = ''; }
    if (extension === void 0) { extension = '.tmp.txt'; }
    prefix = (prefix ? prefix + '-' : '');
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
function getFiles(dirPath, exclude) {
    return _getAll(dirPath, exclude, true);
}
exports.getFiles = getFiles;
;
function getDirs(dirPath, exclude) {
    return _getAll(dirPath, exclude, false);
}
exports.getDirs = getDirs;
;
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
function _checkDirPathArgument(dirPath) {
    if (!dirPath || dirPath === '') {
        return new Error('Dir path is missing!');
    }
    if (!fs.existsSync(dirPath)) {
        return new Error('Dir path does not exist: ' + dirPath);
    }
    return dirPath;
}
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
            return false;
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
function asyncSeries(items, callPerItem) {
    items = items.slice(0);
    var memo = [];
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
        fs.writeFile(destFile, data, { encoding: encoding }, function (err) {
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
function isAbsolutePath(thePath) {
    if (path.isAbsolute && typeof path.isAbsolute === 'function') {
        return path.isAbsolute(thePath);
    }
    var len = thePath.length;
    if (len === 0) {
        return false;
    }
    var code = thePath.charCodeAt(0);
    if (code === 47 || code === 92) {
        return true;
    }
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        if (len > 2 && thePath.charCodeAt(1) === 58) {
            code = thePath.charCodeAt(2);
            if (code === 47 || code === 92) {
                return true;
            }
        }
    }
    return false;
}
exports.isAbsolutePath = isAbsolutePath;
//# sourceMappingURL=utils.js.map