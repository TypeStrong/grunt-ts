/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>

'use strict';

import {GruntTSDefaults} from './defaults';
import path = require('path');
import * as utils from './utils';
import _ = require('lodash');
import csproj2ts = require('csproj2ts');
import {Promise} from 'es6-promise';

const propertiesFromTarget = ['amdloader', 'html', 'htmlOutDir', 'htmlOutDirFlatten', 'reference', 'testExecute', 'tsconfig',
        'templateCache', 'vs', 'watch'],
      propertiesFromTargetOptions = ['additionalFlags', 'comments', 'compile', 'compiler', 'declaration',
        'emitDecoratorMetadata', 'experimentalDecorators', 'failOnTypeErrors', 'fast', 'htmlModuleTemplate',
        'htmlVarTemplate', 'inlineSourceMap', 'inlineSources', 'isolatedModules', 'mapRoot', 'module', 'newLine', 'noEmit',
        'noEmitHelpers', 'noEmitOnError', 'noImplicitAny', 'noResolve', 'preserveConstEnums', 'removeComments', 'sourceRoot',
        'sourceMap', 'suppressImplicitAnyIndexErrors', 'target', 'verbose'];

export function resolveAsync(rawTaskOptions: grunt.task.IMultiTask<ITargetOptions>,
                        rawTargetOptions: grunt.task.IMultiTask<ITargetOptions>,
                        targetName = '',
                        files: IGruntTSCompilationInfo[] = []): Promise<IGruntTSOptions> {

  return new Promise<IGruntTSOptions>((resolve, reject) => {

    let {errors, warnings} = resolveAndWarnOnCapitalizationErrors(rawTaskOptions, rawTargetOptions, targetName);
    let result = emptyOptionsResolveResult();
    result.errors.push(...errors);
    result.warnings.push(...warnings);

    result = applyGruntOptions(result, rawTaskOptions);
    result = applyGruntOptions(result, rawTargetOptions);
    result = copyCompilationTasks(result, files);

    resolveVSOptionsAsync(result, rawTaskOptions, rawTargetOptions).then((result) => {

      // apply `tsconfig` configuration here

      result = applyAssociatedOptionsAndResolveConflicts(result);
      result = applyGruntTSDefaults(result);

      if (result.targetName === undefined ||
          (!result.targetName && targetName)) {
        result.targetName = targetName;
      }

      resolve(result);

    }).catch((error) => {
      reject(error);
    });
  });
}

function emptyOptionsResolveResult() {
  return <IGruntTSOptions><any>{
    warnings: [],
    errors: []
  };
}


function resolveAndWarnOnCapitalizationErrors(task: grunt.task.IMultiTask<ITargetOptions>,
  target: grunt.task.IMultiTask<ITargetOptions>, targetName: string) {

    let errors : string[] = [], warnings: string[] = [];
    const lowercaseTargetProps = _.map(propertiesFromTarget, (prop) => prop.toLocaleLowerCase());
    const lowercaseTargetOptionsProps = _.map(propertiesFromTargetOptions, (prop) => prop.toLocaleLowerCase());

    checkFixableCaseIssues(task, 'ts task');
    checkFixableCaseIssues(target, `target "${targetName}"`);
    checkLocations(task, 'ts task');
    checkLocations(target, `target "${targetName}"`);

    return {errors, warnings};

    function checkLocations(task: grunt.task.IMultiTask<ITargetOptions>, configName: string) {
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
      }
    }

    function checkFixableCaseIssues(task: grunt.task.IMultiTask<ITargetOptions>, configName: string) {
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

function applyGruntOptions(applyTo: IGruntTSOptions, gruntOptions: grunt.task.IMultiTask<ITargetOptions>): IGruntTSOptions {

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

function resolveVSOptionsAsync(applyTo: IGruntTSOptions,
  taskOptions: grunt.task.IMultiTask<ITargetOptions>,
  targetOptions: grunt.task.IMultiTask<ITargetOptions>) {

  return new Promise<IGruntTSOptions>((resolve, reject) => {

    {
      const vsTask: IVisualStudioProjectSupport = getVSSettings(<ITargetOptions><any>taskOptions),
            vsTarget: IVisualStudioProjectSupport = getVSSettings(<ITargetOptions><any>targetOptions);
      let vs: IVisualStudioProjectSupport = null;

      if (vsTask) {
          vs = vsTask;
      }
      if (vsTarget) {
          if (!vs) {
              vs = vsTarget;
          }
          if (vsTarget.project) {
              vs.project = vsTarget.project;
          }
          if (vsTarget.config) {
              vs.config = vsTarget.config;
          }
          if (vsTarget.ignoreFiles) {
              vs.ignoreFiles = vsTarget.ignoreFiles;
          }
          if (vsTarget.ignoreSettings) {
              vs.ignoreSettings = vsTarget.ignoreSettings;
          }
      }
      if (vs) {
        applyTo.vs = vs;
      }
    }

    if (applyTo.vs) {
        csproj2ts.getTypeScriptSettings({
            ProjectFileName: (<IVisualStudioProjectSupport>applyTo.vs).project,
            ActiveConfiguration: (<IVisualStudioProjectSupport>applyTo.vs).config || undefined
        }).then((vsConfig) => {
          debugger;
          applyTo = applyVSOptions(applyTo, vsConfig);
          resolve(applyTo);
          return;
        }).catch((error) => {
            debugger;
            if (error.errno === 34) {
                applyTo.errors.push('In target "' + applyTo.targetName + '" - could not find VS project at "' + error.path + '".');
            } else {
                applyTo.errors.push('In target "' + applyTo.targetName + '".  Error #' + error.errno + '.  ' + error);
            }
            reject(error);
            return;
        });
        return;
    }
    resolve(applyTo);
  });
}

function applyVSOptions(options: IGruntTSOptions, vsSettings: csproj2ts.TypeScriptSettings) {
  let ignoreFiles = false, ignoreSettings = false;

  if (typeof options.vs !== 'string') {
    let vsOptions : IVisualStudioProjectSupport = <IVisualStudioProjectSupport>options.vs;
    ignoreFiles = !!vsOptions.ignoreFiles;
    ignoreSettings = !!vsOptions.ignoreSettings;
  }

  if (!ignoreFiles) {

      if (options.CompilationTasks.length === 0) {
        options.CompilationTasks.push({src: []});
      }

      let src = options.CompilationTasks[0].src;
      let absolutePathToVSProjectFolder = path.resolve(vsSettings.VSProjectDetails.ProjectFileName, '..');

      _.map(_.uniq(vsSettings.files), (file) => {
          var absolutePathToFile = path.normalize(path.join(absolutePathToVSProjectFolder, file));
          var relativePathToFile = path.relative(path.resolve('.'), absolutePathToFile).replace(new RegExp('\\' + path.sep, 'g'), '/');

          if (src.indexOf(absolutePathToFile) === -1 &&
              src.indexOf(relativePathToFile) === -1) {
              src.push(relativePathToFile);
          }
      });
  }

  if (!ignoreSettings) {
    options = applyVSSettings(options, vsSettings);
  }

  return options;
}

function applyVSSettings(options: IGruntTSOptions, vsSettings: csproj2ts.TypeScriptSettings) {

  // TODO: support TypeScript 1.5 VS options.
  const simpleVSSettingsToGruntTSMappings = {
    'GeneratesDeclarations': 'declaration',
    'NoEmitOnError': 'noEmitOnError',
    'MapRoot': 'mapRoot',
    'NoImplicitAny': 'noImplicitAny',
    'NoResolve': 'noResolve',
    'PreserveConstEnums': 'preserveConstEnums',
    'RemoveComments': 'removeComments',
    'SourceMap': 'sourceMap',
    'SourceRoot': 'sourceRoot',
    'SuppressImplicitAnyIndexErrors': 'suppressImplicitAnyIndexErrors',
    'Target': 'target'
  };

  for (let item in simpleVSSettingsToGruntTSMappings) {
    if (!(simpleVSSettingsToGruntTSMappings[item] in options) && utils.hasValue(vsSettings[item])) {
        options[simpleVSSettingsToGruntTSMappings[item]] = vsSettings[item];
    }
  }

  if (!('module' in options) && utils.hasValue(vsSettings.ModuleKind)) {
      options.module = vsSettings.ModuleKind;
      if (options.module === 'none') {
          options.module = undefined;
      }
  }

  if (utils.hasValue(vsSettings.OutDir)) {
      options.CompilationTasks.forEach((item) => {
        item.outDir = vsSettings.OutDir;
      });
  }

  if (utils.hasValue(vsSettings.OutFile)) {
    options.CompilationTasks.forEach((item) => {
      item.out = vsSettings.OutFile;
    });
  }

  return options;
}

function copyCompilationTasks(options: IGruntTSOptions, files: IGruntTSCompilationInfo[]) {

  if (options.CompilationTasks === null || options.CompilationTasks === undefined) {
    options.CompilationTasks = [];
  }
  for (let i = 0; i < files.length; i += 1) {
    let compilationSet = {
      src: _.map(files[i].src, (fileName) => escapePathIfRequired(fileName)),
      out: escapePathIfRequired(files[i].out),
      outDir: escapePathIfRequired(files[i].outDir)
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

function applyAssociatedOptionsAndResolveConflicts(options: IGruntTSOptions) {

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

export function escapePathIfRequired(path: string): string {
  if (!path || !path.indexOf) {
    return path;
  }
  if (path.indexOf(' ') === -1) {
      return path;
  } else {
    const newPath = path.trim();
    if (newPath.indexOf('"') === 0 && newPath.lastIndexOf('"') === newPath.length - 1) {
      return newPath;
    } else {
      return '"' + newPath + '"';
    }
  }
}


function getVSSettings(rawTargetOptions: ITargetOptions) {
    let vs: IVisualStudioProjectSupport = null;
    if (rawTargetOptions && rawTargetOptions.vs) {
        var targetvs = rawTargetOptions.vs;
        if (typeof targetvs === 'string') {
            vs = {
                project: targetvs,
                config: '',
                ignoreFiles: false,
                ignoreSettings: false
            };
        } else {
            vs = {
                project: targetvs.project || '',
                config: targetvs.config || '',
                ignoreFiles: targetvs.ignoreFiles || false,
                ignoreSettings: targetvs.ignoreSettings || false
            };
        }
    }
    return vs;
}
