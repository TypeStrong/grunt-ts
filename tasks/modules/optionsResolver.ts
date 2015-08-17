/// <reference path="../../defs/tsd.d.ts"/>
/// <reference path="./interfaces.d.ts"/>

import {GruntTSDefaults} from './defaults';

const propertiesOnTarget = ['files', 'html', 'out', 'outDir', 'reference', 'src', 'testExecute', 'tsconfig', 'templateCache',
        'vs', 'watch'],
      propertiesOnTargetOptions = ['additionalFlags', 'comments', 'compile', 'compiler', 'declaration',
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
                        targetName = '') {

  let result = applyGruntOptions(null, rawTaskOptions);
  result = applyGruntOptions(result, rawTargetOptions);
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
    for (let propertyName of propertiesOnTarget) {
      if (propertyName in gruntOptions) {
        result.options[propertyName] = gruntOptions[propertyName];
      }
    }
    if (gruntOptions.options) {
      for (let propertyName of propertiesOnTargetOptions) {
        if (propertyName in gruntOptions.options) {
          result.options[propertyName] = gruntOptions.options[propertyName];
        }
      }
    }
  }

  return result;
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

  return options;

}
