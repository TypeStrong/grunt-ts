'use strict';

import {Promise} from 'es6-promise';
import * as fs from 'fs';
import * as path from 'path';
import * as stripBom from 'strip-bom';
import * as _ from 'lodash';

export function resolveAsync(applyTo: IGruntTSOptions,
  taskOptions: ITargetOptions,
  targetOptions: ITargetOptions) {
  return new Promise<IGruntTSOptions>((resolve, reject) => {

    try {
      const taskTSConfig = getTSConfigSettings(taskOptions);
      const targetTSConfig = getTSConfigSettings(targetOptions);

      let tsconfig: ITSConfigSupport = null;

      if (taskTSConfig) {
        tsconfig = taskTSConfig;
      }
      if (targetTSConfig) {
        if (!tsconfig) {
          tsconfig = targetTSConfig;
        }

        if ('tsconfig' in targetTSConfig) {
          tsconfig.tsconfig = targetTSConfig.tsconfig;
        }
        if ('ignoreSettings' in targetTSConfig) {
          tsconfig.ignoreSettings = targetTSConfig.ignoreSettings;
        }
        if ('overwriteFilesGlob' in targetTSConfig) {
          tsconfig.overwriteFilesGlob = targetTSConfig.overwriteFilesGlob;
        }
        if ('updateFiles' in targetTSConfig) {
          tsconfig.updateFiles = targetTSConfig.updateFiles;
        }
        if ('passThrough' in targetTSConfig) {
          tsconfig.passThrough = targetTSConfig.passThrough;
        }
      }

      applyTo.tsconfig = tsconfig;

    } catch (ex) {
      reject(ex);
      return;
    }

    if (!applyTo.tsconfig) {
      resolve(applyTo);
      return;
    }

    let projectFile = (<ITSConfigSupport>applyTo.tsconfig).tsconfig;
    try {
      var projectFileTextContent = fs.readFileSync(projectFile, 'utf8');
    } catch (ex) {
      if (ex && ex.code === 'ENOENT') {
          reject('Could not find file "' + projectFile + '".');
          return;
      } else if (ex && ex.errno) {
          reject('Error ' + ex.errno + ' reading "' + projectFile + '".');
          return;
      } else {
          reject('Error reading "' + projectFile + '": ' + JSON.stringify(ex));
          return;
      }
      reject(ex);
      return;
    }

    try {
      var projectSpec: ITSConfigFile = JSON.parse(stripBom(projectFileTextContent));
    } catch (ex) {
      reject('Error parsing "' + projectFile + '".  It may not be valid JSON in UTF-8.');
      return;
    }

    applyTo = applyCompilerOptions(applyTo, projectSpec);

    resolve(applyTo);
  });
}

function getTSConfigSettings(raw: ITargetOptions): ITSConfigSupport {

  try {
    if (!raw || !raw.tsconfig) {
      return null;
    }

    if (typeof raw.tsconfig === 'boolean') {
      return {
        tsconfig: path.join(path.resolve('.'), 'tsconfig.json')
      };
    } else if (typeof raw.tsconfig === 'string') {

      let tsconfigName = <string>raw.tsconfig;
      let fileInfo = fs.lstatSync(tsconfigName);

      if (fileInfo.isDirectory()) {
        tsconfigName = path.join(tsconfigName, 'tsconfig.json');
      }

      return {
        tsconfig: tsconfigName
      };
    }
    return raw.tsconfig;
  } catch (ex) {
    if (ex.code === 'ENOENT') {
      throw ex;
    }
    let exception : NodeJS.ErrnoException = {
      name: 'Invalid tsconfig setting',
      message: 'Exception due to invalid tsconfig setting.  Details: ' + ex,
      code: ex.code,
      errno: ex.errno
    };
    throw exception;
  }
}

function applyCompilerOptions(applyTo: IGruntTSOptions, projectSpec: ITSConfigFile) {
  const result: IGruntTSOptions = applyTo || <any>{};

  const co = projectSpec.compilerOptions;
  const tsconfig: ITSConfigSupport = applyTo.tsconfig;

  if (!tsconfig.ignoreSettings) {
    const tsconfigMappingToGruntTSProperty = ['declaration', 'emitDecoratorMetadata',
      'experimentalDecorators', 'isolatedModules',
      'inlineSourceMap', 'inlineSources', 'mapRoot', 'module', 'newLine', 'noEmit',
      'noEmitHelpers', 'noEmitOnError', 'noImplicitAny', 'noLib', 'noResolve',
      'out', 'outDir', 'preserveConstEnums', 'removeComments', 'sourceMap',
      'sourceRoot', 'suppressImplicitAnyIndexErrors', 'target'];

    tsconfigMappingToGruntTSProperty.forEach((propertyName) => {
      if (propertyName in co) {
        if (!(propertyName in result)) {
          result[propertyName] = co[propertyName];
        }
      }
    });
  }

  if (applyTo.CompilationTasks.length === 0) {
    applyTo.CompilationTasks.push({src: []});
  }

  let src = applyTo.CompilationTasks[0].src;
  let absolutePathToTSConfig = path.resolve(tsconfig.tsconfig, '..');

  const gruntfileFolder = path.resolve('.');
  _.map(_.uniq(projectSpec.files), (file) => {
      const absolutePathToFile = path.normalize(path.join(absolutePathToTSConfig, file));
      const relativePathToFileFromGruntfile = path.relative(gruntfileFolder, absolutePathToFile).replace(new RegExp('\\' + path.sep, 'g'), '/');

      if (src.indexOf(absolutePathToFile) === -1 &&
          src.indexOf(relativePathToFileFromGruntfile) === -1) {
          src.push(relativePathToFileFromGruntfile);
      }
  });

  return result;
}
