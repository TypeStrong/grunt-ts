/// <reference path="../../defs/tsd.d.ts"/>

import _ = require('lodash');
import fs = require('fs');
import path = require('path');
import utils = require('./utils');

var grunt = utils.grunt;

/////////////////////////////////////////////////////////////////////
// HTML -> TS
////////////////////////////////////////////////////////////////////

// html -> js processing functions:
// Originally from karma-html2js-preprocessor
// Refactored nicely in html2js grunt task
// https://github.com/karlgoldstein/grunt-html2js/blob/master/tasks/html2js.js
// Modified nlReplace to be an empty string
var escapeContent = function (content: string, quoteChar= '\''): string {
    var quoteRegexp = new RegExp('\\' + quoteChar, 'g');
    var nlReplace = '';
    return content.replace(quoteRegexp, '\\' + quoteChar).replace(/\r?\n/g, nlReplace);
};

// Convert a string to camelCase
// Inspired by http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
// Solves the issue of serving a module name that includes dashes
var toCamel = function(str){
    return str.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-', ''); });
};

// Remove bom when reading utf8 files
function stripBOM(str) {
    return 0xFEFF === str.charCodeAt(0)
        ? str.substring(1)
        : str;
}


function htmlInternalTemplate(lineEnding: string) {
  return '/* tslint:disable:max-line-length */' + lineEnding +
    'module <%= modulename %> {' + lineEnding +
    '  export var <%= varname %> = \'<%= content %>\';' + lineEnding +
    '}' + lineEnding;
  };


export interface IHtml2TSOptions {
    moduleFunction: Function;
    varFunction: Function;
    htmlOutputTemplate: string;
    htmlOutDir: string;
    flatten: boolean;
    eol: string;
}

// Compile an HTML file to a TS file
// Return the filename. This filename will be required by reference.ts
export function compileHTML(filename: string, options: IHtml2TSOptions): string {

    grunt.log.verbose.writeln('Compiling HTML: ' + filename);

    var htmlContent = escapeContent(fs.readFileSync(filename).toString());
    htmlContent = stripBOM(htmlContent);
    // TODO: place a minification pipeline here if you want.

    var ext = path.extname(filename).replace('.', '');
    var extFreename = path.basename(filename, '.' + ext);

    var moduleName = toCamel(options.moduleFunction({ ext: ext, filename: extFreename }));
    var varName = toCamel(options.varFunction({ ext: ext, filename: extFreename }).replace(/\./g, '_'));

    var fileContent;
    if (!options.htmlOutputTemplate) {
        fileContent = _.template(
          htmlInternalTemplate(options.eol)
          )({ modulename: moduleName, varname: varName, content: htmlContent });
    } else {
        fileContent = _.template(
          replaceNewLines(options.htmlOutputTemplate, options.eol)
          )({ modulename: moduleName, varname: varName, content: htmlContent });
    }

    // Write the content to a file
    var outputfile = getOutputFile(filename, options.htmlOutDir, options.flatten);

    mkdirParent(path.dirname(outputfile));

    fs.writeFileSync(outputfile, fileContent);
    return outputfile;
}

// Replace user-supplied templates newlines with newlines appropriate for the current OS
function replaceNewLines(input: string, newLines: string) {
   return input.replace(/\r/g, '').replace(/\n/g, newLines);
}


function getOutputFile(filename: string, htmlOutDir: string, flatten: boolean): string {
    var outputfile = filename;

    // NOTE If an htmlOutDir was specified
    if (htmlOutDir !== null) {
        var dir = getPath(htmlOutDir);

        if (fs.existsSync(dir)) {
            var relativeFilename = filename;
            if (flatten) {
                relativeFilename = path.basename(filename);
            }
            outputfile = path.join(dir, relativeFilename);
        }
    }
    return outputfile + '.ts';
}

function getPath(dir: string): string {
    // NOTE If we don't have a valid absolute path
    if (!fs.existsSync(dir)) {
        // NOTE Try relative from the current working directory
        dir = path.join(process.cwd(), dir);
    }
    return dir;
}

function mkdirParent(dirPath: string, mode?: number) {
    // NOTE Call the standard fs.mkdirSync
    try {
        fs.mkdirSync(dirPath, mode);
    } catch (error) {
        // NOTE When it fail in this way, do the custom steps
        if (error && error.errno === 34) {
            // NOTE Create all the parents recursively
            mkdirParent(path.dirname(dirPath), mode);
            // NOTE And then the directory
            mkdirParent(dirPath, mode);
        }
    }
}
