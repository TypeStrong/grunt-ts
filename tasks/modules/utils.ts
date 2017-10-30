/// <reference path="../../defs/tsd.d.ts"/>

import path = require('path');
import fs = require('fs');
import os = require('os');
import util = require('util');
import _ = require('lodash');
import {Promise} from 'es6-promise';

export var grunt: IGrunt = require('grunt');
export const eol: string = grunt.util.linefeed;

export function newLineIsRedundantForTsc(newLineParameter: string, operatingSystem: {EOL: string} = os) {
  return ((newLineParameter === 'CRLF' && operatingSystem.EOL === '\r\n') ||
          (newLineParameter === 'LF' && operatingSystem.EOL === '\n'));
}

export function newLineActualAsParameter(actualNewLineChars: string) {
  if (actualNewLineChars) {
    return actualNewLineChars.replace(/\n/g, 'LF').replace(/\r/g, 'CR');
  }
  return '';
}

export function newLineParameterAsActual(parameterNewLineChars: string) {
  if (parameterNewLineChars) {
  return parameterNewLineChars.replace(/LF/g, '\n').replace(/CR/g, '\r');
  }
  return '';
}

// Converts "C:\boo" , "C:\boo\foo.ts" => "./foo.ts"; Works on unix as well.
export function makeRelativePath(folderpath: string, filename: string, forceRelative = false) {
    var relativePath = path.relative(folderpath, filename).split('\\').join('/');
    if (forceRelative && relativePath[0] !== '.') {
        relativePath = './' + relativePath;
    }
    return relativePath;
}


// Finds the longest common section of a collection of strings.
// Simply sorting and comparing first and last http://stackoverflow.com/a/1917041/390330
function sharedStart(array: string[]): string {
    if (array.length === 0) {
        throw 'Cannot find common root of empty array.';
    }
    var A = array.slice(0).sort(),
        firstWord = A[0],
        lastWord = A[A.length - 1];

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
export function findCommonPath(paths: string[], pathSeperator: string) {
    // Now for "C:\u\starter" "C:\u\started" => "C:\u\starte"
    var largetStartSegement = sharedStart(paths);

    // For "C:\u\starte" => C:\u\
    var ending = largetStartSegement.lastIndexOf(pathSeperator);
    return largetStartSegement.substr(0, ending);
}

/**
 * Returns the result of an array inserted into another, starting at the given index.
 */
export function insertArrayAt<T>(array: T[], index: number, arrayToInsert: T[]): T[] {
    var updated = array.slice(0);
    var spliceAt: any[] = [index, 0];
    Array.prototype.splice.apply(updated, spliceAt.concat(arrayToInsert));
    return updated;
}

/**
 * Compares the end of the string with the given suffix for literal equality.
 *
 * @returns {boolean} whether the string ends with the suffix literally.
 */
export function endsWith(str: string, suffix: string): boolean {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

export function possiblyQuotedRelativePath(thePath: string, relativeTo = '.') {
    return enclosePathInQuotesIfRequired(path.relative(relativeTo, path.resolve(thePath)));
}

export function quotedRelativePath(thePath: string, relativeTo = '.') {
    return `"${stripQuotesIfQuoted(path.relative(relativeTo, path.resolve(thePath)))}"`;
}

export function stripQuotesIfQuoted(possiblyQuotedString: string) {
    if (!possiblyQuotedString.length || possiblyQuotedString.length < 2) {
      return possiblyQuotedString;
    }
    if (possiblyQuotedString.charAt(0) === '"' &&
       possiblyQuotedString.charAt(possiblyQuotedString.length - 1) === '"') {
         return possiblyQuotedString.substr(1, possiblyQuotedString.length - 2);
    }
    return possiblyQuotedString;
}

export function isJavaScriptFile(filePath: string): boolean {
    if (filePath.toLowerCase) {
        var normalizedFile = path.resolve(stripQuotesIfQuoted(filePath)).toLowerCase();
        return endsWith(normalizedFile, '.js');
    }
    return false;
}

/** function for formatting strings
 * ('{0} says {1}','la','ba' ) => 'la says ba'
 */
export function format(str: string, ...args: any[]) {
    return str.replace(/{(\d+)}/g, function (m, i?) {
        return args[i] !== undefined ? args[i] : m;
    });
}

/**
 * Get a random hex value
 *
 * @returns {string} hex string
 */
export function getRandomHex(length: number = 16): string {
    var name: string = '';
    do {
        name += Math.round(Math.random() * Math.pow(16, 8)).toString(16);
    }
    while (name.length < length);

    return name.substr(0, length);
}

/**
 * Get a unique temp file
 *
 * @returns {string} unique-ish path to file in given directory.
 * @throws when it cannot create a temp file in the specified directory
 */
export function getTempFile(prefix?: string, dir: string = '', extension = '.tmp.txt'): string {
    prefix = (prefix ? prefix + '-' : '');
    var attempts = 100;
    do {
        var name: string = prefix + getRandomHex(8) + extension;
        var dest: string = path.join(dir, name);

        if (!fs.existsSync(dest)) {
            return dest;
        }
        attempts--;
    }
    while (attempts > 0);

    throw 'Cannot create temp file in ' + dir;
}

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
export function getFiles(dirPath, exclude?: (filename: string) => boolean): string[] {
    return _getAll(dirPath, exclude, true);
};

/**
 * Get all directories from a directory and all its subdirectories.
 * @param {String} dirPath A path to a directory
 * @param {RegExp|Function} exclude Defines which directories should be excluded.
    Can be a RegExp (whole dirpath is tested) or a Function which will get the dirpath
    as an argument and should return true (exclude dir) or false (do not exclude).
 * @returns {Array} An array of directories
 */
export function getDirs(dirPath, exclude?: (filename: string) => boolean): string[] {
    return _getAll(dirPath, exclude, false);
};

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
                if (exclude(_itempath)) { // BAS, match full item path
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

export function firstElementWithValue<T>(elements: T[], defaultResult: T = null): T {
    var result: T = defaultResult;
    _.each(elements, (item) => {
        if (hasValue(item)) {
            result = item;
            return false; // break out of lodash loop
        }
        return undefined;
    });
    return result;
}

export function hasValue(thing: any) {
    return !_.isNull(thing) && !_.isUndefined(thing);
}

export function getOrGetFirst(getFrom: string | string[]) : string {
  if (_.isArray(getFrom)) {
    if (getFrom.length > 0) {
        return getFrom[0];
    }
    return '';
  }
  return <string>getFrom;
}

export function enclosePathInQuotesIfRequired(path: string): string {
  if (!path || !path.indexOf) {
    return path;
  }
  if (path.indexOf(' ') === -1) {
      return path;
  } else {
    const newPath = path.trim();
    if (newPath.indexOf('"') === 0 && newPath.lastIndexOf('"') === newPath.length - 1) {
      return newPath;
    } else {
      return '"' + newPath + '"';
    }
  }
}

/**
 * Time a function and print the result.
 *
 * @param makeIt the code to time
 * @returns the result of the block of code
 */
export function timeIt<R>(makeIt: () => R): {
    /**
     * The result of the computation
     */
    it: R;
    /**
     * Time in milliseconds.
     */
    time: number;
} {
    var starttime = new Date().getTime();
    var it = makeIt();
    var endtime = new Date().getTime();
    return {
        it: it,
        time: endtime - starttime
    };
}

/**
 * Run a map operation async in series (simplified)
 */
export function asyncSeries<U, W>(items: U[], callPerItem: (item: U) => Promise<W>): Promise<W[]> {
    items = items.slice(0);

    const memo: W[] = [];

    // Run one at a time
    return new Promise((resolve, reject) => {
        const next = () => {
            if (items.length === 0) {
                resolve(memo);
                return;
            }
            (<any>Promise)
              .cast(callPerItem(items.shift()))
              .then((result: W) => {
                memo.push(result);
                next();
            }, reject);
        };
        next();
    });
}

export function copyFile(srcFile: string, destFile: string, callback: (err?: Error) => any, encoding = 'utf8') {
  fs.readFile(srcFile, encoding, (err, data) => {
    fs.writeFile(destFile, data, { encoding }, (err) => {
      if (err) {
        return callback(err);
      }
      return callback();
    });
  });
}

export function readAndParseJSONFromFileSync(fileName: string, encoding = 'utf8') : any {

  let textContent: string, result: any;
  try {
    textContent = fs.readFileSync(fileName, encoding);
  } catch (ex) {
    throw new Error(`Error reading file ${fileName}: ${ex}`);
  }

  try {
     result = JSON.parse(textContent);
  } catch (ex) {
    throw new Error(`Error parsing JSON in file ${fileName}: ${ex}`);
  }

  return result;
}


export function shouldCompile(options: IGruntTSOptions) {
  return !!options.compile;
}

export function shouldPassThrough(options: IGruntTSOptions) {
  return (options.tsconfig && (<ITSConfigSupport>options.tsconfig).passThrough);
}

export function prependIfNotStartsWith(baseString: string, prependThisMaybe: string) {
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

// "polyfill" for path.isAbsolute() which is not supported on Node.js 0.10
// (really this is just the code from Node.js 7)
export function isAbsolutePath(thePath: string): boolean {
    if (path.isAbsolute && typeof path.isAbsolute === 'function') {
        return path.isAbsolute(thePath);
    }
    const len = thePath.length;
    if (len === 0) {
        return false;
    }
    let code = thePath.charCodeAt(0);
    if (code === 47 /*/*/ || code === 92 /*\\*/) {
        return true;
    }
    else if ((code >= 65 /*A*/ && code <= 90 /*Z*/) || (code >= 97 /*a*/ && code <= 122 /*z*/)) {
        // Possible device root
        if (len > 2 && thePath.charCodeAt(1) === 58/*:*/) {
            code = thePath.charCodeAt(2);
            if (code === 47 /*/*/ || code === 92 /*\\*/) {
                return true;
            }
        }
    }
    return false;
}
