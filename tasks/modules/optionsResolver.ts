/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>

'use strict';

import {GruntTSDefaults} from './defaults';
import * as utils from './utils';
import * as _ from 'lodash';
import {Promise} from 'es6-promise';
import {resolveVSOptionsAsync} from './visualStudioOptionsResolver';
import {resolveAsync as resolveTSConfigAsync} from './tsconfig';

const propertiesFromTarget = ['amdloader', 'html', 'htmlOutDir', 'htmlOutDirFlatten', 'reference', 'testExecute', 'tsconfig',
        'templateCache', 'vs', 'watch'],
      propertiesFromTargetOptions = ['additionalFlags', 'comments', 'compile', 'compiler', 'declaration',
        'emitDecoratorMetadata', 'experimentalDecorators', 'failOnTypeErrors', 'fast', 'htmlModuleTemplate',
        'htmlVarTemplate', 'inlineSourceMap', 'inlineSources', 'isolatedModules', 'mapRoot', 'module', 'newLine', 'noEmit',
        'noEmitHelpers', 'noEmitOnError', 'noImplicitAny', 'noResolve', 'preserveConstEnums', 'removeComments', 'sourceRoot',
        'sourceMap', 'suppressImplicitAnyIndexErrors', 'target', 'verbose'];

export function resolveAsync(rawTaskOptions: ITargetOptions,
                        rawTargetOptions: ITargetOptions,
                        targetName = '',
                        files: IGruntTSCompilationInfo[] = []): Promise<IGruntTSOptions> {

  return new Promise<IGruntTSOptions>((resolve, reject) => {

    fixMissingOptions(rawTaskOptions);
    fixMissingOptions(rawTargetOptions);

    let {errors, warnings} = resolveAndWarnOnConfigurationIssues(rawTaskOptions, rawTargetOptions, targetName);
    let result = emptyOptionsResolveResult();
    result.errors.push(...errors);
    result.warnings.push(...warnings);

    result = applyGruntOptions(result, rawTaskOptions);
    result = applyGruntOptions(result, rawTargetOptions);
    result = copyCompilationTasks(result, files);

    resolveVSOptionsAsync(result, rawTaskOptions, rawTargetOptions).then((result) => {
    resolveTSConfigAsync(result, rawTaskOptions, rawTargetOptions).then((result) => {

      result = addressAssociatedOptionsAndResolveConflicts(result);
      result = applyGruntTSDefaults(result);

      if (result.targetName === undefined ||
          (!result.targetName && targetName)) {
        result.targetName = targetName;
      }

      resolve(result);
      return;
    }).catch((error) => {
      reject(error);
      return;
    });
    }).catch((error) => {
      reject(error);
      return;
    });
  });
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

function resolveAndWarnOnConfigurationIssues(task: ITargetOptions,
  target: ITargetOptions, targetName: string) {

    let errors : string[] = [], warnings: string[] = [];
    const lowercaseTargetProps = _.map(propertiesFromTarget, (prop) => prop.toLocaleLowerCase());
    const lowercaseTargetOptionsProps = _.map(propertiesFromTargetOptions, (prop) => prop.toLocaleLowerCase());

    checkFixableCaseIssues(task, 'ts task');
    checkFixableCaseIssues(target, `target "${targetName}"`);
    checkLocations(task, 'ts task');
    checkLocations(target, `target "${targetName}"`);

    return {errors, warnings};

    function checkLocations(task: ITargetOptions, configName: string) {
      // todo: clean this up.  The top and bottom sections are largely the same.
      if (task) {
        for (let propertyName in task) {
          if (propertiesFromTarget.indexOf(propertyName) === -1 && propertyName !== 'options') {
            if (propertiesFromTargetOptions.indexOf(propertyName) > -1) {
              let warningText = `Property "${propertyName}" in ${configName} is possibly in the wrong place and will be ignored.  ` +
                `It is expected on the options object.`;
              warnings.push(warningText);
            } else if (lowercaseTargetProps.indexOf(propertyName.toLocaleLowerCase()) === -1
              && lowercaseTargetOptionsProps.indexOf(propertyName.toLocaleLowerCase()) > -1) {
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
          applyTo[propertyName] = gruntOptions[propertyName];
        }
      }

      if (gruntOptions.options) {
        for (const propertyName of propertiesFromTargetOptions) {
          if (propertyName in gruntOptions.options) {
            applyTo[propertyName] = gruntOptions.options[propertyName];
          }
        }
      }

    }
    return applyTo;
}

function copyCompilationTasks(options: IGruntTSOptions, files: IGruntTSCompilationInfo[]) {

  if (options.CompilationTasks === null || options.CompilationTasks === undefined) {
    options.CompilationTasks = [];
  }
  for (let i = 0; i < files.length; i += 1) {
    let compilationSet = {
      src: _.map(files[i].src, (fileName) => utils.escapePathIfRequired(fileName)),
      out: utils.escapePathIfRequired(files[i].out),
      outDir: utils.escapePathIfRequired(files[i].outDir)
    };
    if ('dest' in files[i]) {
      if (utils.isJavaScriptFile(files[i].dest)) {
        compilationSet.out = files[i].dest;
      } else {
        compilationSet.outDir = files[i].dest;
      }
    }
    options.CompilationTasks.push(compilationSet);
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

  if (options.inlineSources && options.sourceMap) {
    options.errors.push('It is not permitted to use inlineSources and sourceMap together.  Use one or the other.');
  }

  if (options.inlineSources && !options.sourceMap) {
    options.inlineSources = true;
    options.inlineSourceMap = true;
    options.sourceMap = false;
  }

  if ('comments' in options && !('removeComments' in options)) {
    options.comments = !!options.comments;
    options.removeComments = !options.comments;
  } else if (!('comments' in options) && ('removeComments' in options)) {
    options.removeComments = !!options.removeComments;
    options.comments = !options.removeComments;
  }

  options.CompilationTasks.forEach(compileTask => {
    if (compileTask.out && compileTask.outDir) {
      console.log(JSON.stringify(compileTask));
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

  return options;
}
