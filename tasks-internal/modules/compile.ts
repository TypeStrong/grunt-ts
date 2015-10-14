/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>

'use strict';

import path = require('path');
import fs = require('fs');
import _ = require('lodash');
import utils = require('./utils');
import cache = require('./cacheUtils');

import {Promise} from 'es6-promise';
export var grunt: IGrunt = require('grunt');

///////////////////////////
// Helper
///////////////////////////

var executeNode: ICompilePromise;
var executeNodeDefault : ICompilePromise = function(args, optionalInfo) {
    return new Promise((resolve, reject) => {
        grunt.util.spawn({
            cmd: process.execPath,
            args: args
        }, (error, result, code) => {
                var ret: ICompileResult = {
                    code: code,
                    // New TypeScript compiler uses stdout for user code errors. Old one used stderr.
                    output: result.stdout || result.stderr
                };
                resolve(ret);
            });
    });
};

/////////////////////////////////////////////////////////////////
// Fast Compilation
/////////////////////////////////////////////////////////////////

// Map to store if the cache was cleared after the gruntfile was parsed
var cacheClearedOnce: { [targetName: string]: boolean } = {};

function getChangedFiles(files, targetName: string) {

    files = cache.getNewFilesForTarget(files, targetName);

    _.forEach(files, (file) => {
        grunt.log.writeln(('### Fast Compile >>' + file).cyan);
    });

    return files;
}

function resetChangedFiles(files, targetName: string) {
    cache.compileSuccessfull(files, targetName);
}

function clearCache(targetName: string) {
    cache.clearCache(targetName);
    cacheClearedOnce[targetName] = true;
}

/////////////////////////////////////////////////////////////////////
// tsc handling
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

export function compileAllFiles(options: IGruntTSOptions, compilationInfo: IGruntTSCompilationInfo): Promise<ICompileResult> {

    let targetFiles: string[] = compilationInfo.src;

    // Make a local copy so we can modify files without having external side effects
    let files = _.map(targetFiles, (file) => file);

    var newFiles: string[] = files;
    if (options.fast === 'watch') { // if we only do fast compile if target is watched

        // if this is the first time its running after this file was loaded
        if (cacheClearedOnce[grunt.task.current.target] === undefined) {

            // Then clear the cache for this target
            clearCache(options.targetName);
        }
    }
    if (options.fast !== 'never') {
        if (compilationInfo.out) {
            grunt.log.writeln('Fast compile will not work when --out is specified. Ignoring fast compilation'.cyan);
        }
        else {
            newFiles = getChangedFiles(files, options.targetName);

            if (newFiles.length !== 0 || options.testExecute || utils.shouldPassThrough(options)) {
                files = newFiles;

                // If outDir is specified but no baseDir is specified we need to determine one
                if (compilationInfo.outDir && !options.baseDir) {
                    options.baseDir = utils.findCommonPath(files, '/');
                }
            }
            else {
                grunt.log.writeln('No file changes were detected. Skipping Compile'.green);
                return new Promise((resolve) => {
                    var ret: ICompileResult = {
                        code: 0,
                        fileCount: 0,
                        output: 'No files compiled as no change detected'
                    };
                    resolve(ret);
                });
            }
        }
    }

    // Transform files as needed. Currently all of this logic in is one module
    // transformers.transformFiles(newFiles, targetFiles, target, task);

    // If baseDir is specified create a temp tsc file to make sure that `--outDir` works fine
    // see https://github.com/grunt-ts/grunt-ts/issues/77
    var baseDirFile: string = '.baseDir.ts';
    var baseDirFilePath: string;
    if (compilationInfo.outDir && options.baseDir && files.length > 0) {
        baseDirFilePath = path.join(options.baseDir, baseDirFile);
        if (!fs.existsSync(baseDirFilePath)) {
            grunt.file.write(baseDirFilePath, '// Ignore this file. See https://github.com/grunt-ts/grunt-ts/issues/77');
        }
        files.push(baseDirFilePath);
    }

    // If reference and out are both specified.
    // Then only compile the updated reference file as that contains the correct order
    if (options.reference && compilationInfo.out) {
        var referenceFile = path.resolve(options.reference);
        files = [referenceFile];
    }

    // Quote the files to compile. Needed for command line parsing by tsc
    files = _.map(files, (item) => `"${path.resolve(item)}"`);

    // if (outFile) {
    //   outFile = `"${path.resolve(outFile)}"`;
    // }

    var args: string[] = files.slice(0);
    const tsconfig: ITSConfigSupport = options.tsconfig;

    if (tsconfig && tsconfig.passThrough) {
      args.push('--project', tsconfig.tsconfig);
    } else {
      if (options.sourceMap) {
          args.push('--sourcemap');
      }
      if (options.emitDecoratorMetadata) {
          args.push('--emitDecoratorMetadata');
      }
      if (options.declaration) {
          args.push('--declaration');
      }
      if (options.removeComments) {
          args.push('--removeComments');
      }
      if (options.noImplicitAny) {
          args.push('--noImplicitAny');
      }
      if (options.noResolve) {
          args.push('--noResolve');
      }
      if (options.noEmitOnError) {
          args.push('--noEmitOnError');
      }
      if (options.preserveConstEnums) {
          args.push('--preserveConstEnums');
      }
      if (options.suppressImplicitAnyIndexErrors) {
          args.push('--suppressImplicitAnyIndexErrors');
      }
      if (options.noEmit) {
          args.push('--noEmit');
      }
      if (options.inlineSources) {
          args.push('--inlineSources');
      }
      if (options.inlineSourceMap) {
          args.push('--inlineSourceMap');
      }
      if (options.newLine && !utils.newLineIsRedundant(options.newLine)) {
          args.push('--newLine', options.newLine);
      }
      if (options.isolatedModules) {
          args.push('--isolatedModules');
      }
      if (options.noEmitHelpers) {
          args.push('--noEmitHelpers');
      }
      if (options.experimentalDecorators) {
          args.push('--experimentalDecorators');
      }
      if (options.experimentalAsyncFunctions) {
          args.push('--experimentalAsyncFunctions');
      }
      if (options.jsx) {
          args.push('--jsx', options.jsx.toLocaleLowerCase());
      }
      if (options.moduleResolution) {
          args.push('--moduleResolution', options.moduleResolution.toLocaleLowerCase());
      }
      if (options.rootDir) {
          args.push('--rootDir', options.rootDir);
      }

      args.push('--target', options.target.toUpperCase());

      if (options.module) {
     	  let moduleOptionString: string = ('' + options.module).toLowerCase();
      	if ('amd|commonjs|system|umd'.indexOf(moduleOptionString) > -1) {
              args.push('--module', moduleOptionString);
      	} else {
  	        console.warn('WARNING: Option "module" only supports "amd" | "commonjs" | "system" | "umd" '.magenta);
      	}
      }

      if (compilationInfo.outDir) {
          if (compilationInfo.out) {
              console.warn('WARNING: Option "out" and "outDir" should not be used together'.magenta);
          }
          args.push('--outDir', compilationInfo.outDir);
      }

      if (compilationInfo.out) {
          args.push('--out', compilationInfo.out);
      }

      if (compilationInfo.dest && (!compilationInfo.out) && (!compilationInfo.outDir)) {
          if (utils.isJavaScriptFile(compilationInfo.dest)) {
              args.push('--out', compilationInfo.dest);
          } else {
              if (compilationInfo.dest === 'src') {
                  console.warn(('WARNING: Destination for target "' + options.targetName + '" is "src", which is the default.  If you have' +
                      ' forgotten to specify a "dest" parameter, please add it.  If this is correct, you may wish' +
                      ' to change the "dest" parameter to "src/" or just ignore this warning.').magenta);
              }
              if (Array.isArray(compilationInfo.dest)) {
                  if ((<string[]><any>compilationInfo.dest).length === 0) {
                      // ignore it and do nothing.
                  } else if ((<string[]><any>compilationInfo.dest).length > 0) {
                      console.warn((('WARNING: "dest" for target "' + options.targetName + '" is an array.  This is not supported by the' +
                          ' TypeScript compiler or grunt-ts.' +
                          (((<string[]><any>compilationInfo.dest).length > 1) ? '  Only the first "dest" will be used.  The' +
                          ' remaining items will be truncated.' : ''))).magenta);
                      args.push('--outDir', (<string[]><any>compilationInfo.dest)[0]);
                  }
              } else {
                  args.push('--outDir', compilationInfo.dest);
              }
          }
      }

      if (args.indexOf('--out') > -1 && args.indexOf('--module') > -1) {
          console.warn(('WARNING: TypeScript does not allow external modules to be concatenated with' +
          ' --out. Any exported code may be truncated.  See TypeScript issue #1544 for' +
          ' more details.').magenta);
      }

      if (options.sourceRoot) {
          args.push('--sourceRoot', options.sourceRoot);
      }
      if (options.mapRoot) {
          args.push('--mapRoot', options.mapRoot);
      }
    }

    if (options.additionalFlags) {
        args.push(options.additionalFlags);
    }

    // Locate a compiler
    let tsc: string;
    if (options.compiler) { // Custom compiler (task.compiler)
        grunt.log.writeln('Using the custom compiler : ' + options.compiler);
        tsc = options.compiler;
    } else { // the bundled OR npm module based compiler
        tsc = getTsc(resolveTypeScriptBinPath());
    }

    // To debug the tsc command
    if (options.verbose) {
        console.log(args.join(' ').yellow);
    }
    else {
        grunt.log.verbose.writeln(args.join(' ').yellow);
    }

    // Create a temp last command file and use that to guide tsc.
    // Reason: passing all the files on the command line causes TSC to go in an infinite loop.
    let tempfilename = utils.getTempFile('tscommand');
    if (!tempfilename) {
        throw (new Error('cannot create temp file'));
    }

    fs.writeFileSync(tempfilename, args.join(' '));

    let command: string[];

    // Switch implementation if a test version of executeNode exists.
    if ('testExecute' in options) {
        if (_.isFunction(options.testExecute)) {
            command = [tsc, args.join(' ')];
            executeNode = options.testExecute;
        } else {
            const invalidTestExecuteError = 'Invalid testExecute node present on target "' +
                options.targetName + '".  Value of testExecute must be a function.';
            throw (new Error(invalidTestExecuteError));
        }
    } else {
      // this is the normal path.
      command = [tsc, '@' + tempfilename];
      executeNode = executeNodeDefault;
    }

    // Execute command
    return executeNode(command, options).then((result: ICompileResult) => {

        if (options.fast !== 'never' && result.code === 0) {
            resetChangedFiles(newFiles, options.targetName);
        }

        result.fileCount = files.length;

        fs.unlinkSync(tempfilename);

        grunt.log.writeln(result.output);

        return (<any>Promise).cast(result);
    }, (err) => {
        fs.unlinkSync(tempfilename);
        throw err;
    });

}
