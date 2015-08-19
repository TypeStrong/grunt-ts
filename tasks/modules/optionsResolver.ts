/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>

import {GruntTSDefaults} from './defaults';
import * as utils from './utils';
import _ = require('lodash');

const propertiesFromTarget = ['html', 'htmlOutDir', 'htmlOutDirFlatten', 'reference', 'testExecute', 'tsconfig',
        'templateCache', 'vs', 'watch'],
      propertiesFromTargetOptions = ['additionalFlags', 'comments', 'compile', 'compiler', 'declaration',
        'emitDecoratorMetadata', 'experimentalDecorators', 'failOnTypeErrors', 'fast', 'htmlModuleTemplate',
        'htmlVarTemplate', 'inlineSourceMap', 'inlineSources', 'isolatedModules', 'mapRoot', 'module', 'newLine', 'noEmit',
        'noEmitHelpers', 'noImplicitAny', 'noResolve', 'preserveConstEnums', 'removeComments', 'sourceRoot', 'sourceMap',
        'suppressImplicitAnyIndexErrors', 'target', 'verbose'];

interface OptionsResolveResult {
  options: IGruntTSOptions;
  warnings: string[];
  errors: string[];
}

export function resolve(rawTaskOptions: grunt.task.IMultiTask<ITargetOptions>,
                        rawTargetOptions: grunt.task.IMultiTask<ITargetOptions>,
                        targetName = '',
                        files: IGruntTSCompilationInfo[] = []) {

  let result = applyGruntOptions(null, rawTaskOptions);
  result = applyGruntOptions(result, rawTargetOptions);
  result = copyCompilationTasks(result, files);
  result = applyAssociatedOptionsAndResolveConflicts(result);
  result = applyGruntTSDefaults(result);

  if (result.options.targetName === undefined ||
      (!result.options.targetName && targetName)) {
    result.options.targetName = targetName;
  }

  return result;
}

function emptyOptionsResolveResult() {
  return {
    options: <IGruntTSOptions><any>{},
    warnings: [],
    errors: []
  };
}

function applyGruntOptions(applyTo: OptionsResolveResult, gruntOptions: grunt.task.IMultiTask<ITargetOptions>) {

  const result : OptionsResolveResult = applyTo || emptyOptionsResolveResult();

  if (gruntOptions) {
    for (let propertyName of propertiesFromTarget) {
      if (propertyName in gruntOptions) {
        result.options[propertyName] = gruntOptions[propertyName];
      }
    }
    if (gruntOptions.options) {
      for (let propertyName of propertiesFromTargetOptions) {
        if (propertyName in gruntOptions.options) {
          result.options[propertyName] = gruntOptions.options[propertyName];
        }
      }
    }
  }

  return result;
}

function copyCompilationTasks(options: OptionsResolveResult, files: IGruntTSCompilationInfo[]) {
  let o = options.options;
  if (o.CompilationTasks === null || o.CompilationTasks === undefined) {
    o.CompilationTasks = [];
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
    o.CompilationTasks.push(compilationSet);
  }
  return options;
}

function applyAssociatedOptionsAndResolveConflicts(options: OptionsResolveResult) {
  let o = options.options;

  if (o.emitDecoratorMetadata) {
    o.experimentalDecorators = true;
  }

  if (o.inlineSourceMap && o.sourceMap) {
    options.warnings.push('TypeScript cannot use inlineSourceMap and sourceMap together.  Ignoring sourceMap.');
    o.sourceMap = false;
  }

  if (o.inlineSources && o.sourceMap) {
    options.errors.push('It is not permitted to use inlineSources and sourceMap together.  Use one or the other.');
  }

  if (o.inlineSources && !o.sourceMap) {
    o.inlineSources = true;
    o.inlineSourceMap = true;
    o.sourceMap = false;
  }

  return options;
}


function applyGruntTSDefaults(options: OptionsResolveResult) {
  let o = options.options;

  if (!('sourceMap' in o) && !('inlineSourceMap' in o)) {
    o.sourceMap = GruntTSDefaults.sourceMap;
  }

  if (!('target' in o)) {
    o.target = GruntTSDefaults.target;
  }

  if (!('fast' in o)) {
    o.fast = 'watch';
  }

  if (!('compile' in o)) {
    o.compile = true;
  }

  if (!('htmlOutDir' in o)) {
    o.htmlOutDir = null;
  }

  if (!('htmlOutDirFlatten' in o)) {
    o.htmlOutDirFlatten = false;
  }

  if (!('htmlModuleTemplate' in o)) {
    o.htmlModuleTemplate = '<%= filename %>';
  }

  if (!('htmlVarTemplate' in o)) {
    o.htmlVarTemplate = '<%= ext %>';
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
