/// <reference path="../../defs/tsd.d.ts"/>

import fs = require('fs');
import path = require('path');

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

// Remove bom when reading utf8 files
function stripBOM(str) {
    return 0xFEFF === str.charCodeAt(0)
        ? str.substring(1)
        : str;
}

export interface IOptions {
    moduleFunction?: Function;
    varFunction?: Function;
    contentFunction?: Function;
}

// Compile an HTML file to a TS file
// Return the filename. This filename will be required by reference.ts
export function compileHTML(filename: string, options: IOptions): string {
    var htmlContent = escapeContent(fs.readFileSync(filename).toString());
    htmlContent = stripBOM(htmlContent);
    // TODO: place a minification pipeline here if you want.

    var ext = path.extname(filename).replace('.', '');
    var extFreename = path.basename(filename, '.' + ext);

    var moduleName = options.moduleFunction({ ext: ext, filename: extFreename });
    var varName = options.varFunction({ ext: ext, filename: extFreename }).replace(/\./g, '_');

    var fileContent = options.contentFunction({ modulename: moduleName, varname: varName, content: htmlContent });

    // Write the content to a file
    var outputfile = filename + '.ts';

    fs.writeFileSync(outputfile, fileContent);
    return outputfile;
}
