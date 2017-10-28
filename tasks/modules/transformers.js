"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var grunt = require("grunt");
var _ = require("lodash");
var utils = require("./utils");
var currentTargetFiles;
var currentTargetDirs;
function getImports(currentFilePath, name, targetFiles, targetDirs, getIndexIfDir) {
    if (getIndexIfDir === void 0) { getIndexIfDir = true; }
    var files = [];
    var targetFile = _.find(targetFiles, function (targetFile) {
        return path.basename(targetFile) === name
            || path.basename(targetFile, '.d.ts') === name
            || path.basename(targetFile, '.ts') === name;
    });
    if (targetFile) {
        files.push(targetFile);
    }
    var targetDir = _.find(targetDirs, function (targetDir) {
        return path.basename(targetDir) === name;
    });
    if (targetDir) {
        var possibleIndexFilePath = path.join(targetDir, 'index.ts');
        if (getIndexIfDir
            && fs.existsSync(possibleIndexFilePath)
            && path.relative(currentFilePath, possibleIndexFilePath) !== '') {
            files.push(path.join(targetDir, 'index.ts'));
        }
        else {
            var filesInDir = utils.getFiles(targetDir, function (filename) {
                if (path.relative(currentFilePath, filename) === '') {
                    return true;
                }
                return path.extname(filename)
                    && (!_.endsWith(filename, '.ts') || _.endsWith(filename, '.d.ts'))
                    && !fs.lstatSync(filename).isDirectory();
            });
            filesInDir.sort();
            files = files.concat(filesInDir);
        }
    }
    return files;
}
function getTargetFolders(targetFiles) {
    var folders = {};
    _.forEach(targetFiles, function (targetFile) {
        var dir = path.dirname(targetFile);
        while (dir !== '.' && !(dir in folders)) {
            folders[dir] = true;
            dir = path.dirname(dir);
        }
    });
    return Object.keys(folders);
}
var BaseTransformer = (function () {
    function BaseTransformer(key, variableSyntax) {
        this.key = key;
        this.match = new RegExp(utils.format(BaseTransformer.tsTransformerMatch, key));
        this.signature = this.tripleSlashTS() + key;
        this.signatureGenerated = this.signature + ':generated';
        this.syntaxError = '/// Invalid syntax for ts:' + this.key + '=' + variableSyntax + ' ' + this.signatureGenerated;
    }
    BaseTransformer.prototype.tripleSlashTS = function () {
        return '//' + '/ts:';
    };
    BaseTransformer.prototype.isGenerated = function (line) {
        return _.includes(line, this.signatureGenerated);
    };
    BaseTransformer.prototype.matches = function (line) {
        return line.match(this.match);
    };
    BaseTransformer.containsTransformSignature = function (line) {
        return BaseTransformer.tsSignatureMatch.test(line);
    };
    BaseTransformer.tsSignatureMatch = /\/\/\/\s*ts\:/;
    BaseTransformer.tsTransformerMatch = '^///\\s*ts:{0}(=?)(.*)';
    return BaseTransformer;
}());
var BaseImportExportTransformer = (function (_super) {
    __extends(BaseImportExportTransformer, _super);
    function BaseImportExportTransformer(key, variableSyntax, template, getIndexIfDir, removeExtensionFromFilePath) {
        var _this = _super.call(this, key, variableSyntax) || this;
        _this.key = key;
        _this.template = template;
        _this.getIndexIfDir = getIndexIfDir;
        _this.removeExtensionFromFilePath = removeExtensionFromFilePath;
        return _this;
    }
    BaseImportExportTransformer.prototype.transform = function (sourceFile, templateVars) {
        var _this = this;
        var result = [];
        if (templateVars) {
            var vars = templateVars.split(',');
            var requestedFileName = vars[0].trim();
            var requestedVariableName = (vars.length > 1 ? vars[1].trim() : null);
            var sourceFileDirectory = path.dirname(sourceFile);
            var imports = getImports(sourceFile, requestedFileName, currentTargetFiles, currentTargetDirs, this.getIndexIfDir);
            if (imports.length) {
                _.forEach(imports, function (completePathToFile) {
                    var filename = requestedVariableName || path.basename(path.basename(completePathToFile, '.ts'), '.d');
                    if (filename.toLowerCase() === 'index') {
                        filename = path.basename(path.dirname(completePathToFile));
                    }
                    var pathToFile = utils.makeRelativePath(sourceFileDirectory, _this.removeExtensionFromFilePath ? completePathToFile.replace(/(?:\.d)?\.ts$/, '') : completePathToFile, true);
                    result.push(_this.template({ filename: filename, pathToFile: pathToFile, signatureGenerated: _this.signatureGenerated })
                        + ' '
                        + _this.signatureGenerated);
                });
            }
            else {
                result.push('/// No file or directory matched name "' + requestedFileName + '" ' + this.signatureGenerated);
            }
        }
        else {
            result.push(this.syntaxError);
        }
        return result;
    };
    return BaseImportExportTransformer;
}(BaseTransformer));
var ImportTransformer = (function (_super) {
    __extends(ImportTransformer, _super);
    function ImportTransformer() {
        return _super.call(this, 'import', '<fileOrDirectoryName>[,<variableName>]', _.template('import <%=filename%> = require(\'<%= pathToFile %>\');'), true, true) || this;
    }
    return ImportTransformer;
}(BaseImportExportTransformer));
var ExportTransformer = (function (_super) {
    __extends(ExportTransformer, _super);
    function ExportTransformer(eol) {
        var _this = _super.call(this, 'export', '<fileOrDirectoryName>[,<variableName>]', _.template('import <%=filename%>_file = require(\'<%= pathToFile %>\'); <%= signatureGenerated %>' + eol +
            'export var <%=filename%> = <%=filename%>_file;'), false, true) || this;
        _this.eol = eol;
        return _this;
    }
    return ExportTransformer;
}(BaseImportExportTransformer));
var ReferenceTransformer = (function (_super) {
    __extends(ReferenceTransformer, _super);
    function ReferenceTransformer() {
        return _super.call(this, 'ref', '<fileOrDirectoryName>', _.template('/// <reference path="<%= pathToFile %>"/>'), false, false) || this;
    }
    return ReferenceTransformer;
}(BaseImportExportTransformer));
var UnknownTransformer = (function (_super) {
    __extends(UnknownTransformer, _super);
    function UnknownTransformer() {
        var _this = _super.call(this, '(.*)', '') || this;
        _this.key = 'unknown';
        _this.signatureGenerated = _this.tripleSlashTS() + 'unknown:generated';
        _this.syntaxError = '/// Unknown transform ' + _this.signatureGenerated;
        return _this;
    }
    UnknownTransformer.prototype.transform = function (sourceFile, templateVars) {
        return [this.syntaxError];
    };
    return UnknownTransformer;
}(BaseTransformer));
function transformFiles(changedFiles, targetFiles, options) {
    currentTargetDirs = getTargetFolders(targetFiles);
    currentTargetFiles = targetFiles;
    var transformers = [
        new ImportTransformer(),
        new ExportTransformer((options.newLine || utils.eol)),
        new ReferenceTransformer(),
        new UnknownTransformer()
    ];
    _.forEach(changedFiles, function (fileToProcess) {
        var contents = fs.readFileSync(fileToProcess).toString().replace(/^\uFEFF/, '');
        if (!BaseTransformer.containsTransformSignature(contents)) {
            return;
        }
        var lines = contents.split(/\r\n|\r|\n/);
        var outputLines = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (_.some(transformers, function (transformer) { return transformer.isGenerated(line); })) {
                continue;
            }
            if (_.some(transformers, function (transformer) {
                var match = transformer.matches(line);
                if (match) {
                    outputLines.push(line);
                    outputLines.push.apply(outputLines, transformer.transform(fileToProcess, match[1] && match[2] && match[2].trim()));
                    return true;
                }
                return false;
            })) {
                continue;
            }
            outputLines.push(line);
        }
        var transformedContent = outputLines.join(utils.eol);
        if (transformedContent !== contents) {
            grunt.file.write(fileToProcess, transformedContent);
        }
    });
}
exports.transformFiles = transformFiles;
//# sourceMappingURL=transformers.js.map