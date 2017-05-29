"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var utils = require("./utils");
var grunt = utils.grunt;
var escapeContent = function (content, quoteChar) {
    if (quoteChar === void 0) { quoteChar = '\''; }
    var quoteRegexp = new RegExp('\\' + quoteChar, 'g');
    var nlReplace = '';
    return content.replace(quoteRegexp, '\\' + quoteChar).replace(/\r?\n/g, nlReplace);
};
var toCamel = function (str) {
    return str.replace(/(\-[a-z])/g, function ($1) { return $1.toUpperCase().replace('-', ''); });
};
function stripBOM(str) {
    return 0xFEFF === str.charCodeAt(0)
        ? str.substring(1)
        : str;
}
function htmlInternalTemplate(lineEnding) {
    return '/* tslint:disable:max-line-length */' + lineEnding +
        'module <%= modulename %> {' + lineEnding +
        '  export var <%= varname %> = \'<%= content %>\';' + lineEnding +
        '}' + lineEnding;
}
;
function compileHTML(filename, options) {
    grunt.log.verbose.writeln('Compiling HTML: ' + filename);
    var htmlContent = escapeContent(fs.readFileSync(filename).toString());
    htmlContent = stripBOM(htmlContent);
    var ext = path.extname(filename).replace('.', '');
    var extFreename = path.basename(filename, '.' + ext);
    var moduleName = toCamel(options.moduleFunction({ ext: ext, filename: extFreename }));
    var varName = toCamel(options.varFunction({ ext: ext, filename: extFreename }).replace(/\./g, '_'));
    var fileContent;
    if (!options.htmlOutputTemplate) {
        fileContent = _.template(htmlInternalTemplate(options.eol))({ modulename: moduleName, varname: varName, content: htmlContent });
    }
    else {
        fileContent = _.template(replaceNewLines(options.htmlOutputTemplate, options.eol))({ modulename: moduleName, varname: varName, content: htmlContent });
    }
    var outputfile = getOutputFile(filename, options.htmlOutDir, options.flatten);
    mkdirParent(path.dirname(outputfile));
    fs.writeFileSync(outputfile, fileContent);
    return outputfile;
}
exports.compileHTML = compileHTML;
function replaceNewLines(input, newLines) {
    return input.replace(/\r/g, '').replace(/\n/g, newLines);
}
function getOutputFile(filename, htmlOutDir, flatten) {
    var outputfile = filename;
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
    if (!fs.existsSync(dir)) {
        dir = path.join(process.cwd(), dir);
    }
    return dir;
}
function mkdirParent(dirPath, mode) {
    try {
        fs.mkdirSync(dirPath, mode);
    }
    catch (error) {
        if (error && error.errno === 34) {
            mkdirParent(path.dirname(dirPath), mode);
            mkdirParent(dirPath, mode);
        }
    }
}
//# sourceMappingURL=html2ts.js.map