'use strict';

import {Promise} from 'es6-promise';
import * as fs from 'fs';
import * as path from 'path';
import * as stripBom from 'strip-bom';
import * as _ from 'lodash';

let templateProcessor: (templateString: string, options: any) => string = null;

export function resolveAsync(applyTo: IGruntTSOptions,
  taskOptions: ITargetOptions,
  targetOptions: ITargetOptions,
  theTemplateProcessor: (templateString: string, options: any) => string) {

  templateProcessor = theTemplateProcessor;

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
          tsconfig.tsconfig = templateProcessor(targetTSConfig.tsconfig, {});
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
      return reject(ex);
    }

    if (!applyTo.tsconfig) {
      return resolve(applyTo);
    }

    if ((<ITSConfigSupport>applyTo.tsconfig).passThrough) {
      if (applyTo.CompilationTasks.length === 0) {
        applyTo.CompilationTasks.push({src: []});
      }
      if (!(<ITSConfigSupport>applyTo.tsconfig).tsconfig) {
        (<ITSConfigSupport>applyTo.tsconfig).tsconfig = '.';
      }
    } else {
      let projectFile = (<ITSConfigSupport>applyTo.tsconfig).tsconfig;
      try {
        var projectFileTextContent = fs.readFileSync(projectFile, 'utf8');
      } catch (ex) {
        if (ex && ex.code === 'ENOENT') {
            return reject('Could not find file "' + projectFile + '".');
        } else if (ex && ex.errno) {
            return reject('Error ' + ex.errno + ' reading "' + projectFile + '".');
        } else {
            return reject('Error reading "' + projectFile + '": ' + JSON.stringify(ex));
        }
        return reject(ex);
      }

      try {
        var projectSpec: ITSConfigFile = JSON.parse(stripBom(projectFileTextContent));
      } catch (ex) {
        return reject('Error parsing "' + projectFile + '".  It may not be valid JSON in UTF-8.');
      }

      applyTo = applyCompilerOptions(applyTo, projectSpec);
      applyTo = resolve_out_and_outDir(applyTo, projectSpec);
    }

    resolve(applyTo);
  });
}

function resolve_out_and_outDir(options: IGruntTSOptions, projectSpec: ITSConfigFile) {
  if (options.CompilationTasks
      && options.CompilationTasks.length > 0
      && projectSpec
      && projectSpec.compilerOptions) {
    options.CompilationTasks.forEach((compilationTask) => {
        if (projectSpec.compilerOptions.out) {
          compilationTask.out = projectSpec.compilerOptions.out;
        }
        if (projectSpec.compilerOptions.outDir) {
          compilationTask.outDir = projectSpec.compilerOptions.outDir;
        }
    });
  }
  return options;
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

      let tsconfigName = templateProcessor(<string>raw.tsconfig, {});
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
