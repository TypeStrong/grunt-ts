/// <reference path="../../defs/tsd.d.ts"/>
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
/////////////////////////////////////////////////////////////////////
// HTML -> TS
////////////////////////////////////////////////////////////////////
// html -> js processing functions:
// Originally from karma-html2js-preprocessor
// Refactored nicely in html2js grunt task
// https://github.com/karlgoldstein/grunt-html2js/blob/master/tasks/html2js.js
// Modified nlReplace to be an empty string
var escapeContent = function (content, quoteChar) {
    if (quoteChar === void 0) { quoteChar = '\''; }
    var quoteRegexp = new RegExp('\\' + quoteChar, 'g');
    var nlReplace = '';
    return content.replace(quoteRegexp, '\\' + quoteChar).replace(/\r?\n/g, nlReplace);
};
// Remove bom when reading utf8 files
function stripBOM(str) {
    return 0xFEFF === str.charCodeAt(0) ? str.substring(1) : str;
}
var htmlTemplate = _.template('module <%= modulename %> { export var <%= varname %> =  \'<%= content %>\' } ');
// Compile an HTML file to a TS file
// Return the filename. This filename will be required by reference.ts
function compileHTML(filename, options) {
    var htmlContent = escapeContent(fs.readFileSync(filename).toString());
    htmlContent = stripBOM(htmlContent);
    // TODO: place a minification pipeline here if you want.
    var ext = path.extname(filename).replace('.', '');
    var extFreename = path.basename(filename, '.' + ext);
    var moduleName = options.moduleFunction({ ext: ext, filename: extFreename });
    var varName = options.varFunction({ ext: ext, filename: extFreename }).replace('.', '_');
    var fileContent = htmlTemplate({ modulename: moduleName, varname: varName, content: htmlContent });
    // Write the content to a file
    var outputfile = getOutputFile(filename, options.htmlOutDir, options.flatten);
    mkdirParent(path.dirname(outputfile));
    fs.writeFileSync(outputfile, fileContent);
    return outputfile;
}
exports.compileHTML = compileHTML;
function getOutputFile(filename, htmlOutDir, flatten) {
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
function getPath(dir) {
    // NOTE If we don't have a valid absolute path
    if (!fs.existsSync(dir)) {
        // NOTE Try relative from the current working directory
        dir = path.join(process.cwd(), dir);
    }
    return dir;
}
function mkdirParent(dirPath, mode) {
    try {
        fs.mkdirSync(dirPath, mode);
    }
    catch (error) {
        // NOTE When it fail in this way, do the custom steps
        if (error && error.errno === 34) {
            // NOTE Create all the parents recursively
            mkdirParent(path.dirname(dirPath), mode);
            // NOTE And then the directory
            mkdirParent(dirPath, mode);
        }
    }
}
//# sourceMappingURL=html2ts.js.map