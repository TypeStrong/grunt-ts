'use strict';

import * as csproj2ts from 'csproj2ts';
import * as path from 'path';
import * as utils from './utils';
import {Promise} from 'es6-promise';
import * as _ from 'lodash';

let templateProcessor: (templateString: string, options: any) => string = null;

export function resolveVSOptionsAsync(applyTo: IGruntTSOptions,
  taskOptions: ITargetOptions,
  targetOptions: ITargetOptions,
  theTemplateProcessor: (templateString: string, options: any) => string) {

  templateProcessor = theTemplateProcessor;

  return new Promise<IGruntTSOptions>((resolve, reject) => {

    {
      const vsTask: IVisualStudioProjectSupport = getVSSettings(taskOptions),
            vsTarget: IVisualStudioProjectSupport = getVSSettings(targetOptions);
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
        if (typeof (<IVisualStudioProjectSupport>applyTo.vs).project === 'string') {
          (<IVisualStudioProjectSupport>applyTo.vs).project = templateProcessor((<IVisualStudioProjectSupport>applyTo.vs).project, {});
        }
        if (typeof (<IVisualStudioProjectSupport>applyTo.vs).config === 'string') {
          (<IVisualStudioProjectSupport>applyTo.vs).config = templateProcessor((<IVisualStudioProjectSupport>applyTo.vs).config, {});
        }
      }
    }

    if (applyTo.vs) {
        return csproj2ts.getTypeScriptSettings({
            ProjectFileName: (<IVisualStudioProjectSupport>applyTo.vs).project,
            ActiveConfiguration: (<IVisualStudioProjectSupport>applyTo.vs).config || undefined
        }).then((vsConfig) => {
          try {
            applyTo = applyVSOptions(applyTo, vsConfig);
            applyTo = resolve_out_and_outDir(applyTo, taskOptions, targetOptions);
            return resolve(applyTo);
          } catch (ex) {
            return reject(ex);
          }
        }).catch((error) => {
            if (error.errno === 34) {
                applyTo.errors.push('In target "' + applyTo.targetName + '" - could not find VS project at "' + error.path + '".');
            } else {
                applyTo.errors.push('In target "' + applyTo.targetName + '".  Error #' + error.errno + '.  ' + error);
            }
            return reject(error);
        });
    }
    return resolve(applyTo);
  });
}

function resolve_out_and_outDir(options: IGruntTSOptions, taskOptions: IGruntTargetOptions,
    targetOptions: IGruntTargetOptions) {
  if (options.CompilationTasks && options.CompilationTasks.length > 0) {
    options.CompilationTasks.forEach((compilationTask) => {
      [taskOptions, targetOptions].forEach(optionSet => {
          if (optionSet && optionSet.out) {
            compilationTask.out = optionSet.out;
          }
          if (optionSet && optionSet.outDir) {
            compilationTask.outDir = optionSet.outDir;
          }
      });
    });
  }
  return options;
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

      const gruntfileFolder = path.resolve('.');
      _.map(_.uniq(vsSettings.files), (file) => {
          const absolutePathToFile = path.normalize(path.join(absolutePathToVSProjectFolder, file));
          const relativePathToFileFromGruntfile = path.relative(gruntfileFolder, absolutePathToFile).replace(new RegExp('\\' + path.sep, 'g'), '/');

          if (src.indexOf(absolutePathToFile) === -1 &&
              src.indexOf(relativePathToFileFromGruntfile) === -1) {
              src.push(relativePathToFileFromGruntfile);
          }
      });
  }

  if (!ignoreSettings) {
    options = applyVSSettings(options, vsSettings);
  }

  return options;
}

function relativePathToVSProjectFolderFromGruntfile(settings: csproj2ts.TypeScriptSettings) {
  return path.resolve(settings.VSProjectDetails.ProjectFileName, '..');
}

function applyVSSettings(options: IGruntTSOptions, vsSettings: csproj2ts.TypeScriptSettings) {

  // TODO: support TypeScript 1.5 VS options.
  const simpleVSSettingsToGruntTSMappings = {
    'EmitBOM': 'emitBom',
    'EmitDecoratorMetadata': 'emitDecoratorMetadata',
    'ExperimentalAsyncFunctions': 'experimentalAsyncFunctions',
    'ExperimentalDecorators': 'experimentalDecorators',
    'GeneratesDeclarations': 'declaration',
    'InlineSourceMap': 'inlineSourceMap',
    'InlineSources': 'inlineSources',
    'IsolatedModules': 'isolatedModules',
    'JSXEmit': 'jsx',
    'MapRoot': 'mapRoot',
    'ModuleKind': 'module',
    'ModuleResolution': 'moduleResolution',
    'NewLine': 'newLine',
    'NoEmitOnError': 'noEmitOnError',
    'NoEmitHelpers': 'NoEmitHelpers',
    'NoImplicitAny': 'noImplicitAny',
    'NoLib': 'noLib',
    'NoResolve': 'noResolve',
    // OutFile and OutDir are resolved elsewhere
    'PreserveConstEnums': 'preserveConstEnums',
    'RemoveComments': 'removeComments',
    'RootDir': 'rootDir',
    'SourceMap': 'sourceMap',
    'SourceRoot': 'sourceRoot',
    'SuppressImplicitAnyIndexErrors': 'suppressImplicitAnyIndexErrors',
    'SuppressExcessPropertyErrors': 'suppressExcessPropertyErrors',
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

  const gruntfileToProject = relativePathToVSProjectFolderFromGruntfile(vsSettings);

  if (utils.hasValue(vsSettings.OutDir) && vsSettings.OutDir !== '') {
      options.CompilationTasks.forEach((item) => {
      let absolutePath = path.resolve(gruntfileToProject, vsSettings.OutDir);
      item.outDir = utils.enclosePathInQuotesIfRequired(
        path.relative(path.resolve('.'), absolutePath).replace(new RegExp('\\' + path.sep, 'g'), '/')
      );
    });
  }

  if (utils.hasValue(vsSettings.OutFile) && vsSettings.OutFile !== '') {
    options.CompilationTasks.forEach((item) => {
      let absolutePath = path.resolve(gruntfileToProject, vsSettings.OutFile);
      item.out = utils.enclosePathInQuotesIfRequired(
        path.relative(path.resolve('.'), absolutePath).replace(new RegExp('\\' + path.sep, 'g'), '/')
      );
    });
  }

  return options;
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
