var path = require('path'), fs = require('fs'), vm = require('vm');

var exec = require('child_process').exec;

var currentPath = path.resolve(".");

function resolveTypeScriptBinPath(currentPath, depth) {
    var targetPath = path.resolve(__dirname, (new Array(depth + 1)).join("../../"), "../node_modules/typescript/bin");
    if (path.resolve(currentPath, "node_modules/typescript/bin").length > targetPath.length) {
        return;
    }
    if (fs.existsSync(path.resolve(targetPath, "typescript.js"))) {
        return targetPath;
    }

    return resolveTypeScriptBinPath(currentPath, ++depth);
}

function getTsc(binPath) {
    return '"' + binPath + '\\' + 'tsc" ';
}

var tsc = getTsc(resolveTypeScriptBinPath(currentPath, 0));

function compileFile(filepath) {
    var cmd = 'node ' + tsc + ' ' + filepath;
    console.log(cmd);

    exec(cmd);
}

var cmd = 'node "C:\\REPOS\\grunt-ts\\node_modules\\typescript\\bin\\tsc" "C:\\REPOS\\grunt-ts\\test\\fixtures\\simple.ts"';
console.log(cmd);
compileFile('"C:\\REPOS\\grunt-ts\\test\\simple\\simple.ts"');

module.exports = function (grunt) {
};
