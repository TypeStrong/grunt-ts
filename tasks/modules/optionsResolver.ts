/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>

'use strict';

import {GruntTSDefaults} from './defaults';
import * as utils from './utils';
import * as _ from 'lodash';
import {Promise} from 'es6-promise';
import {resolveVSOptionsAsync} from './visualStudioOptionsResolver';
import {resolveAsync as resolveTSConfigAsync} from './tsconfig';

// Compiler Options documentation:
// https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Compiler%20Options.md

const propertiesFromTarget = ['amdloader', 'baseDir', 'html', 'htmlOutDir', 'htmlOutDirFlatten', 'reference', 'testExecute', 'tsconfig',
        'templateCache', 'vs', 'watch'],
        // supported via other code: out, outDir, outFile, project
      propertiesFromTargetOptions = ['additionalFlags',
        'allowJs',
        'allowSyntheticDefaultImports',
        'allowUnreachableCode',
        'allowUnusedLabels',
        'alwaysStrict',
        'baseUrl',
        'charset',
        'checkJs',
        'comments',
        'compile',
        'compiler',
        'declaration',
        'declarationDir',
        'diagnostics',
        'disableSizeLimit',
        'downlevelIteration',
        'emitBOM',
        'emitDecoratorMetadata',
        'emitGruntEvents',
        'experimentalAsyncFunctions',
        'experimentalDecorators',
        'failOnTypeErrors',
        'fast',
        /* help purposefully not supported. */
        'forceConsistentCasingInFileNames',
        'htmlModuleTemplate',
        'htmlOutDir',
        'htmlOutDirFlatten',
        'htmlOutputTemplate',
        'htmlVarTemplate',
        'importHelpers',
        'inlineSourceMap',
        'inlineSources',
        /* init purposefully not supported. */
        'isolatedModules',
        'jsx',
        'jsxFactory',
        'lib',
        'listEmittedFiles',
        'listFiles',
        'locale',
        'mapRoot',
        'maxNodeModuleJsDepth',
        'module',
        'moduleResolution',
        'newLine',
        'noEmit',
        'noEmitHelpers',
        'noEmitOnError',
        'noFallthroughCasesInSwitch',
        'noImplicitAny',
        'noImplicitReturns',
        'noImplicitThis',
        'noImplicitUseStrict',
        'noLib',
        'noResolve',
        'noStrictGenericChecks',
        'noUnusedLocals',
        'noUnusedParameters',
        /* paths is purposefully not supported - requires use of tsconfig.json */
        'preserveConstEnums',
        'preserveSymlinks',
        'pretty',
        'reactNamespace',
        'removeComments',
        'rootDir',
        /* rootDirs is purposefully not supported - requires use of tsconfig.json */
        'skipDefaultLibCheck',
        'skipLibCheck',
        'sourceMap',
        'sourceRoot',
        'strict',
        'strictFunctionTypes',
        'strictNullChecks',
        'stripInternal',
        'suppressExcessPropertyErrors',
        'suppressImplicitAnyIndexErrors',
        'target',
        'traceResolution',
        'tsCacheDir',
        'types',
        'typeRoots',
        /* version is purposefully not supported. */
        /* watch is purposefully not supported. */
        'verbose'],
      delayTemplateExpansion = ['htmlModuleTemplate', 'htmlVarTemplate', 'htmlOutputTemplate'];

let templateProcessor: (templateString: string, options: any) => string = null;
let globExpander: (globs: string[]) => string[] = null;
let verboseLogger: (logText: string) => void = null;

function noopTemplateProcessor(templateString: string, options: any) {
  return templateString;
}

function emptyGlobExpander(globs: string[]): string[] {
    return [];
}
(<any>emptyGlobExpander).isStub = true;

function emptyVerboseLogger(logText: string) {
  // noop.
}

export function resolveAsync(rawTaskOptions: ITargetOptions,
                        rawTargetOptions: ITargetOptions,
                        targetName = '',
                        resolvedFiles: IGruntTSCompilationInfo[] = [],
                        theTemplateProcessor: typeof templateProcessor = null,
                        theGlobExpander: typeof globExpander = null,
                        theVerboseLogger: typeof verboseLogger = null): Promise<IGruntTSOptions> {

  let result = emptyOptionsResolveResult();
  return new Promise<IGruntTSOptions>((resolve, reject) => {


    if (theTemplateProcessor && typeof theTemplateProcessor === 'function') {
        templateProcessor = theTemplateProcessor;
    } else {
        templateProcessor = noopTemplateProcessor;
    }

    if (theGlobExpander && typeof theGlobExpander === 'function') {
        globExpander = theGlobExpander;
    } else {
        globExpander = emptyGlobExpander;
    }

    if (theVerboseLogger && typeof theVerboseLogger === 'function') {
        verboseLogger = theVerboseLogger;
    } else {
        verboseLogger = emptyVerboseLogger;
    }

    fixMissingOptions(rawTaskOptions);
    fixMissingOptions(rawTargetOptions);

    {
      const {errors, warnings} = resolveAndWarnOnConfigurationIssues(rawTaskOptions, rawTargetOptions, targetName);
      result.errors.push(...errors);
      result.warnings.push(...warnings);
    }
    result = applyGruntOptions(result, rawTaskOptions);
    result = applyGruntOptions(result, rawTargetOptions);
    result = copyCompilationTasks(result, resolvedFiles, resolveOutputOptions(rawTaskOptions, rawTargetOptions));

    resolveVSOptionsAsync(result, rawTaskOptions, rawTargetOptions, templateProcessor).then((result) => {
      resolveTSConfigAsync(result, rawTaskOptions, rawTargetOptions, templateProcessor, globExpander, verboseLogger).then((result) => {

        result = addressAssociatedOptionsAndResolveConflicts(result);
        result = enclosePathsInQuotesIfRequired(result);
        result = logAdditionalConfigurationWarnings(result);
        result = applyGruntTSDefaults(result);

        if (result.targetName === undefined ||
            (!result.targetName && targetName)) {
          result.targetName = targetName;
        }

        return resolve(result);
      }).catch((tsConfigError) => {
        if (tsConfigError.message) {
          result.errors.push('tsconfig error: ' + tsConfigError.message);
        } else {
          result.errors.push('tsconfig error: ' + JSON.stringify(tsConfigError));
        }
        return resolve(result);
      });
    }).catch((vsConfigError) => {
      if (vsConfigError.message) {
        result.errors.push('Visual Studio config issue: ' + vsConfigError.message);
      } else {
        result.errors.push('Visual Studio config issue: ' + JSON.stringify(vsConfigError));
      }
      return resolve(result);
    });
  });
}

function resolveOutputOptions(rawTaskOptions:
  IGruntTargetOptions, rawTargetOptions: IGruntTargetOptions) {
    const result: {outDir?: string, out?: string} = {};

    const props = ['outDir', 'out'];
    const options = [rawTaskOptions, rawTargetOptions];

    options.forEach((opt) => {
      props.forEach((prop) => {
        if (opt && (prop in opt)) {
          result[prop] = opt[prop];
        }
      });
    });

    return result;
}

function fixMissingOptions(config: ITargetOptions) {
  if (config && !config.options) {
    config.options = <any>{};
  }
}

function emptyOptionsResolveResult() {
  return <IGruntTSOptions><any>{
    warnings: [],
    errors: []
  };
}

function logAdditionalConfigurationWarnings(options: IGruntTSOptions) {

  return options;
}

function resolveAndWarnOnConfigurationIssues(task: ITargetOptions,
  target: ITargetOptions, targetName: string) {

    let errors : string[] = [], warnings: string[] = [];
    const lowercaseTargetProps = _.map(propertiesFromTarget, (prop) => prop.toLocaleLowerCase());
    const lowercaseTargetOptionsProps = _.map(propertiesFromTargetOptions, (prop) => prop.toLocaleLowerCase());

    checkFixableCaseIssues(task, 'ts task');
    checkFixableCaseIssues(target, `target "${targetName}"`);
    checkLocations(task, 'ts task');
    checkLocations(target, `target "${targetName}"`);
    warnOnFilesUsedWithFast(task, 'ts task');
    warnOnFilesUsedWithFast(target, `target "${targetName}"`);

    warnings.push(...getAdditionalWarnings(task, target, targetName));

    return {errors, warnings};

    function getAdditionalWarnings(task: any, target: any, targetName: string) {
      const additionalWarnings = [];

      if (propertiesFromTarget.indexOf(targetName) >= 0) {
        additionalWarnings.push(`Warning: Using the grunt-ts keyword "${targetName}" as a target name may cause ` +
        `incorrect behavior or errors.`);
      }

      if (((task && task.src && targetName !== 'src') || (target && target.src)) &&
          ((task && task.files) || (target && target.files))) {
        additionalWarnings.push(`Warning: In task "${targetName}", either "files" or "src" should be used - not both.`);
      }

      if (((task && task.vs) || (target && target.vs)) &&
          ((task && task.files) || (target && target.files))) {
        additionalWarnings.push(`Warning: In task "${targetName}", either "files" or "vs" should be used - not both.`);
      }

      if (usingDestArray(task) || usingDestArray(target)) {
        additionalWarnings.push(`Warning: target "${targetName}" has an array specified for the files.dest property.` +
            `  This is not supported.  Taking first element and ignoring the rest.`);
      }

      if ((task && task.outFile) || (target && target.outFile)) {
        additionalWarnings.push(`Warning: target "${targetName}" is using "outFile".  This is not supported by` +
          ` grunt-ts via the Gruntfile - it's only relevant when present in tsconfig.json file.  Use "out" instead.`);
      }

      return additionalWarnings;

      function usingDestArray(task) {
        let result = false;
        if (task && task.files && _.isArray(task.files)) {
          task.files.forEach(item => {
            if (_.isArray(item.dest)) {
              result = true;
            };
          });
        }
        return result;
      }
    }



    function warnOnFilesUsedWithFast(task: any, configName: string) {
      if (task && task.files && task.options && task.options.fast) {
        warnings.push(`Warning: ${configName} is attempting to use fast compilation with "files".  ` +
          `This is not currently supported.  Setting "fast" to "never".`);
        task.options.fast = 'never';
      }
    }

    function checkLocations(task: ITargetOptions, configName: string) {

      // todo: clean this up.  The top and bottom sections are largely the same.
      if (task) {
        for (let propertyName in task) {
          if (propertiesFromTarget.indexOf(propertyName) === -1 && propertyName !== 'options') {
            if (propertiesFromTargetOptions.indexOf(propertyName) > -1 &&
                !_.isPlainObject(task[propertyName])) {
                let warningText = `Property "${propertyName}" in ${configName} is possibly in the wrong place and will be ignored.  ` +
                  `It is expected on the options object.`;
                warnings.push(warningText);
            } else if (lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase()) === -1 &&
               lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase()) > -1 &&
               !_.isPlainObject(task[propertyName])) {

                let index = lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase());
                let correctPropertyName = propertiesFromTargetOptions[index];

                let warningText = `Property "${propertyName}" in ${configName} is possibly in the wrong place and will be ignored.  ` +
                  `It is expected on the options object.  It is also the wrong case and should be ${correctPropertyName}.`;
                warnings.push(warningText);
            }
          }
        }
        if (task.options) {
          for (let propertyName in task.options) {
            if (propertiesFromTargetOptions.indexOf(propertyName) === -1) {
              if (propertiesFromTarget.indexOf(propertyName) > -1) {
                let warningText = `Property "${propertyName}" in ${configName} is possibly in the wrong place and will be ignored.  ` +
                  `It is expected on the task or target, not under options.`;
                warnings.push(warningText);
              } else if (lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase()) === -1
                && lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase()) > -1) {
                let index = lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase());
                let correctPropertyName = propertiesFromTarget[index];

                let warningText = `Property "${propertyName}" in ${configName} is possibly in the wrong place and will be ignored.  ` +
                  `It is expected on the task or target, not under options.  It is also the wrong case and should be ${correctPropertyName}.`;
                warnings.push(warningText);
              }
            }
          }
        }
      }
    }

    function checkFixableCaseIssues(task: ITargetOptions, configName: string) {
      if (task) {
        for (let propertyName in task) {
          if ((propertiesFromTarget.indexOf(propertyName) === -1)
            && (lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase()) > -1)
            && (propertiesFromTargetOptions.indexOf(propertyName) === -1)) {
            let index = lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase());
            let correctPropertyName = propertiesFromTarget[index];

            let warningText = `Property "${propertyName}" in ${configName} is incorrectly cased; it should ` +
              `be "${correctPropertyName}".  Fixing it for you and proceeding.`;

            warnings.push(warningText);
            task[correctPropertyName] = task[propertyName];
            delete task[propertyName];
          }
        }

        for (let propertyName in task.options) {
          if ((propertiesFromTargetOptions.indexOf(propertyName) === -1)
            && (lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase()) > -1)
            && (propertiesFromTarget.indexOf(propertyName) === -1)) {
            let index = lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase());
            let correctPropertyName = propertiesFromTargetOptions[index];

            let warningText = `Property "${propertyName}" in ${configName} options is incorrectly cased; it should ` +
              `be "${correctPropertyName}".  Fixing it for you and proceeding.`;

            warnings.push(warningText);
            task.options[correctPropertyName] = task.options[propertyName];
            delete task.options[propertyName];
          }
        }

      }
    }
}

function applyGruntOptions(applyTo: IGruntTSOptions, gruntOptions: ITargetOptions): IGruntTSOptions {

    if (gruntOptions) {

      for (const propertyName of propertiesFromTarget) {
        if (propertyName in gruntOptions && propertyName !== 'vs') {
          if (typeof gruntOptions[propertyName] === 'string' && utils.hasValue(gruntOptions[propertyName]) &&
              delayTemplateExpansion.indexOf(propertyName) === -1) {
            applyTo[propertyName] = templateProcessor(gruntOptions[propertyName], {});
          } else {
            applyTo[propertyName] = gruntOptions[propertyName];
          }
        }
      }

      if (gruntOptions.options) {
        for (const propertyName of propertiesFromTargetOptions) {
          if (propertyName in gruntOptions.options) {
            if (typeof gruntOptions.options[propertyName] === 'string' && utils.hasValue(gruntOptions.options[propertyName]) &&
                delayTemplateExpansion.indexOf(propertyName) === -1) {
              applyTo[propertyName] = templateProcessor(gruntOptions.options[propertyName], {});
            } else {
              applyTo[propertyName] = gruntOptions.options[propertyName];
            }
          }
        }
      }

    }
    return applyTo;
}

function copyCompilationTasks(options: IGruntTSOptions, resolvedFiles: IGruntTSCompilationInfo[], outputInfo: {outDir?: string, out?: string}) {

  if (!utils.hasValue(options.CompilationTasks)) {
    options.CompilationTasks = [];
  }
  if (!utils.hasValue(resolvedFiles) || resolvedFiles.length === 0) {
    if (options.CompilationTasks.length === 0 && (('outDir' in outputInfo) || ('out' in outputInfo))) {
      const newCompilationTask : IGruntTSCompilationInfo = {
        src: []
      };
      if ('outDir' in outputInfo) {
        newCompilationTask.outDir = outputInfo.outDir;
      }
      if ('out' in outputInfo) {
        newCompilationTask.outDir = outputInfo.outDir;
      }
      options.CompilationTasks.push(newCompilationTask);
    }
    return options;
  }
  for (let i = 0; i < resolvedFiles.length; i += 1) {
    let glob: string[];
    const orig = (<{orig?: {src?: string[] | string}}>resolvedFiles[i]).orig;
    if (orig && ('src' in orig)) {
      glob = [].concat(orig.src);
    }

    let compilationSet = {
      src: _.map(resolvedFiles[i].src, (fileName) => utils.enclosePathInQuotesIfRequired(fileName)),
      out: utils.enclosePathInQuotesIfRequired(resolvedFiles[i].out),
      outDir: utils.enclosePathInQuotesIfRequired(resolvedFiles[i].outDir),
      glob
    };
    if ('dest' in resolvedFiles[i] && resolvedFiles[i].dest) {
      let dest: string;
      if (_.isArray(resolvedFiles[i].dest)) {
        // using an array for dest is not supported.  Only take first element.
        dest = resolvedFiles[i].dest[0];
      } else {
        dest = resolvedFiles[i].dest;
      }
      if (utils.isJavaScriptFile(dest)) {
        compilationSet.out = dest;
      } else {
        compilationSet.outDir = dest;
      }
    }
    options.CompilationTasks.push(compilationSet);
  }
  return options;
}

function enclosePathsInQuotesIfRequired(options: IGruntTSOptions) {
  if (options.rootDir) {
    options.rootDir = utils.enclosePathInQuotesIfRequired(options.rootDir);
  }
  if (options.mapRoot) {
    options.mapRoot = utils.enclosePathInQuotesIfRequired(options.mapRoot);
  }
  if (options.sourceRoot) {
    options.sourceRoot = utils.enclosePathInQuotesIfRequired(options.sourceRoot);
  }
  return options;
}

function addressAssociatedOptionsAndResolveConflicts(options: IGruntTSOptions) {

  if (options.emitDecoratorMetadata) {
    options.experimentalDecorators = true;
  }

  if (options.inlineSourceMap && options.sourceMap) {
    options.warnings.push('TypeScript cannot use inlineSourceMap and sourceMap together.  Ignoring sourceMap.');
    options.sourceMap = false;
  }

  if (options.inlineSources && !options.sourceMap) {
    options.inlineSources = true;
    options.inlineSourceMap = true;
    options.sourceMap = false;
  }

  if ('comments' in options && 'removeComments' in options) {
    options.warnings.push(`WARNING: Option "comments" and "removeComments" should not be used together.  ` +
    `The --removeComments value of ${!!options.removeComments} supercedes the --comments value of ${!!options.comments}`);
  }

  if ('comments' in options && !('removeComments' in options)) {
    options.comments = !!options.comments;
    options.removeComments = !options.comments;
  } else if (!('comments' in options) && ('removeComments' in options)) {
    options.removeComments = !!options.removeComments;
    options.comments = !options.removeComments;
  }

  if ('html' in options &&
      (options.CompilationTasks.length === 0 ||
      !_.some(options.CompilationTasks, item => ((item.src || []).length > 0 || (item.glob || []).length > 0)))) {

        options.errors.push(`ERROR: option "html" provided without corresponding TypeScript source files or glob to ` +
        `compile.  The transform will not occur unless grunt-ts also expects to compile some files.`);
  }

  options.CompilationTasks.forEach(compileTask => {
    if (compileTask.out && compileTask.outDir) {
      options.warnings.push(
        'The parameter `out` is incompatible with `outDir`; pass one or the other - not both.  Ignoring `out` and using `outDir`.'
      );
      compileTask.out = '';
    }
  });

  return options;
}

function applyGruntTSDefaults(options: IGruntTSOptions) {

  if (!('sourceMap' in options) && !('inlineSourceMap' in options)) {
    options.sourceMap = GruntTSDefaults.sourceMap;
  }

  if (!('target' in options)) {
    options.target = GruntTSDefaults.target;
  }

  if (!('fast' in options)) {
    options.fast = GruntTSDefaults.fast;
  }

  if (!('compile' in options)) {
    options.compile = GruntTSDefaults.compile;
  }

  if (!('htmlOutDir' in options)) {
    options.htmlOutDir = null;
  }

  if (!('htmlOutDirFlatten' in options)) {
    options.htmlOutDirFlatten = GruntTSDefaults.htmlOutDirFlatten;
  }

  if (!('htmlModuleTemplate' in options)) {
    options.htmlModuleTemplate = GruntTSDefaults.htmlModuleTemplate;
  }

  if (!('htmlVarTemplate' in options)) {
    options.htmlVarTemplate = GruntTSDefaults.htmlVarTemplate;
  }

  if (!('removeComments' in options) && !('comments' in options)) {
    options.removeComments = GruntTSDefaults.removeComments;
  }

  if (!('failOnTypeErrors' in options)) {
    options.failOnTypeErrors = GruntTSDefaults.failOnTypeErrors;
  }

  if (!('emitGruntEvents' in options)) {
    options.emitGruntEvents = GruntTSDefaults.emitGruntEvents;
  }

  if (!('tsCacheDir' in options)) {
    options.tsCacheDir = GruntTSDefaults.tsCacheDir;
  }

  return options;
}
