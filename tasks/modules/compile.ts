/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>

import path = require('path');
import fs = require('fs');
import _ = require('underscore');
import utils = require('./utils');


var Promise: typeof Promise = require('es6-promise').Promise;
export var grunt: IGrunt = require('grunt');

export interface ICompileResult {
    code: number;
    output: string;
}

///////////////////////////
// Helper
///////////////////////////
function executeNode(args: string[]): Promise<ICompileResult> {
    return new Promise((resolve, reject) => {
        grunt.util.spawn({
            cmd: 'node',
            args: args
        }, (error, result, code) => {
                var ret: ICompileResult = {
                    code: code,
                    output: String(result)
                };
                resolve(ret);
            });
    });
}

/////////////////////////////////////////////////////////////////////
// tsc handling.
////////////////////////////////////////////////////////////////////

function resolveTypeScriptBinPath(): string {
    var ownRoot = path.resolve(path.dirname((module).filename), '../..');
    var userRoot = path.resolve(ownRoot, '..', '..');
    var binSub = path.join('node_modules', 'typescript', 'bin');

    if (fs.existsSync(path.join(userRoot, binSub))) {
        // Using project override
        return path.join(userRoot, binSub);
    }
    return path.join(ownRoot, binSub);
}

function getTsc(binPath: string): string {
    var pkg = JSON.parse(fs.readFileSync(path.resolve(binPath, '..', 'package.json')).toString());
    grunt.log.writeln('Using tsc v' + pkg.version);

    return path.join(binPath, 'tsc');
}

export function compileAllFiles(targetFiles: string[], target: ITargetOptions, task: ITaskOptions): Promise<ICompileResult> {

    // Make a local copy to mutate freely
    var files = _.map(targetFiles, (file) => file);

    // If baseDir is specified create a temp tsc file to make sure that `--outDir` works fine
    // see https://github.com/grunt-ts/grunt-ts/issues/77
    var baseDirFile: string = 'ignoreBaseDirFile.ts';
    var baseDirFilePath: string;
    if (target.outDir && target.baseDir && files.length > 0) {
        baseDirFilePath = path.join(target.baseDir, baseDirFile);
        if (!fs.existsSync(baseDirFilePath)) {
            fs.writeFileSync(baseDirFilePath, '// Ignore this file. See https://github.com/grunt-ts/grunt-ts/issues/77');
        }
        files.push(baseDirFilePath);
    }

    var args: string[] = files.slice(0);

    // boolean options
    if (task.sourceMap) {
        args.push('--sourcemap');
    }
    if (task.declaration) {
        args.push('--declaration');
    }
    if (task.removeComments) {
        args.push('--removeComments');
    }
    if (task.noImplicitAny) {
        args.push('--noImplicitAny');
    }
    if (task.noResolve) {
        args.push('--noResolve');
    }

    // string options
    args.push('--target', task.target.toUpperCase());
    args.push('--module', task.module.toLowerCase());

    // Target options:
    if (target.out) {
        args.push('--out', target.out);
    }
    if (target.outDir) {
        if (target.out) {
            console.warn('WARNING: Option "out" and "outDir" should not be used together'.magenta);
        }
        args.push('--outDir', target.outDir);
    }
    if (task.sourceRoot) {
        args.push('--sourceRoot', task.sourceRoot);
    }
    if (task.mapRoot) {
        args.push('--mapRoot', task.mapRoot);
    }

    // Locate a compiler
    var tsc = getTsc(resolveTypeScriptBinPath());

    // To debug the tsc command
    if (task.verbose) {
        console.log(args.join(' ').yellow);
    }
    else {
        grunt.log.verbose.writeln(args.join(' ').yellow);
    }

    // Create a temp last command file and use that to guide tsc.
    // Reason: passing all the files on the command line causes TSC to go in an infinite loop.
    var tempfilename = utils.getTempFile('tscommand');
    if (!tempfilename) {
        throw (new Error('cannot create temp file'));
    }

    fs.writeFileSync(tempfilename, args.join(' '));

    // Execute command
    return executeNode([tsc, '@' + tempfilename]).then((result: ICompileResult) => {
        fs.unlinkSync(tempfilename);

        grunt.log.writeln(result.output);

        return Promise.cast(result);
    }, (err) => {
            fs.unlinkSync(tempfilename);
            throw err;
        });
}
