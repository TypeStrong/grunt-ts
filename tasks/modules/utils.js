/// <reference path="../../defs/tsd.d.ts"/>
var path = require('path');
var fs = require('fs');
var util = require('util');

exports.grunt = require('grunt');

// Converts "C:\boo" , "C:\boo\foo.ts" => "./foo.ts"; Works on unix as well.
function makeRelativePath(folderpath, filename) {
    return path.relative(folderpath, filename).split('\\').join('/');
}
exports.makeRelativePath = makeRelativePath;

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

// From https://github.com/centi/node-dirutils/blob/master/index.js
// Slightly modified. See BAS
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
            } else {
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
        } else {
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
//# sourceMappingURL=utils.js.map
