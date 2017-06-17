"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("./utils");
var chokidar = require("chokidar");
var Watcher = (function () {
    function Watcher(watchPath, projectRootPath, logWriteLn, errorWriteLn, addFileToCompilationContext, removeFileFromCompilationContext, compile) {
        this.watchPath = watchPath;
        this.projectRootPath = projectRootPath;
        this.logWriteLn = logWriteLn;
        this.errorWriteLn = errorWriteLn;
        this.addFileToCompilationContext = addFileToCompilationContext;
        this.removeFileFromCompilationContext = removeFileFromCompilationContext;
        this.compile = compile;
        this.lastCompileTimestampInMs = new Date().getTime();
        this.watchDelayInMs = 100;
        this.acceptedExtentions = ['.ts', '.tsx', '.js', '.jsx', '.html'];
        this.isHandlingWatchEvent = false;
        this.logWriteLn(('Watching all TypeScript / Html files under : ' + this.watchPath.join(', ')).cyan);
        this.watcher = chokidar.watch(watchPath, { ignoreInitial: true, persistent: true });
        this.configureWatcher();
    }
    Watcher.prototype.configureWatcher = function () {
        var _this = this;
        this.watcher.on('add', function (path) { return _this.handleAdd(path); })
            .on('change', function (path) { return _this.handleChange(path); })
            .on('unlink', function (path) { return _this.handleRemove(path); })
            .on('error', function (error) { return _this.errorWriteLn('Error happened in chokidar: ' + error); });
    };
    Watcher.prototype.handleAdd = function (filePath) {
        if (!utils.endsWithAny(filePath.toLowerCase(), this.acceptedExtentions) || this.isTooSoonToCompileAgain() || this.isHandlingWatchEvent) {
            return;
        }
        this.isHandlingWatchEvent = true;
        this.logWriteLn(('+++ added    >>' + filePath).yellow);
        this.addFileToCompilationContext(filePath);
        this.compile();
        this.lastCompileTimestampInMs = new Date().getTime();
        this.isHandlingWatchEvent = false;
    };
    Watcher.prototype.handleChange = function (filePath) {
        if (!utils.endsWithAny(filePath.toLowerCase(), this.acceptedExtentions) || this.isTooSoonToCompileAgain() || this.isHandlingWatchEvent) {
            return;
        }
        this.isHandlingWatchEvent = true;
        this.logWriteLn(('### changed  >>' + filePath).yellow);
        this.compile();
        this.lastCompileTimestampInMs = new Date().getTime();
        this.isHandlingWatchEvent = false;
    };
    Watcher.prototype.handleRemove = function (filePath) {
        if (!utils.endsWithAny(filePath.toLowerCase(), this.acceptedExtentions) || this.isTooSoonToCompileAgain() || this.isHandlingWatchEvent) {
            return;
        }
        this.isHandlingWatchEvent = true;
        this.logWriteLn(('--- removed  >>' + filePath).yellow);
        this.removeFileFromCompilationContext(filePath);
        this.compile();
        this.lastCompileTimestampInMs = new Date().getTime();
        this.isHandlingWatchEvent = false;
    };
    Watcher.prototype.isTooSoonToCompileAgain = function () {
        return (new Date().getTime() - this.lastCompileTimestampInMs) <= this.watchDelayInMs;
    };
    return Watcher;
}());
exports.default = Watcher;
//# sourceMappingURL=watchHelper.js.map