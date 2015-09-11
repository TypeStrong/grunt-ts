'use strict';

import {Promise} from 'es6-promise';
import * as fs from 'fs';
import * as path from 'path';
import * as stripBom from 'strip-bom';
import * as _ from 'lodash';
import * as utils from './utils';

let templateProcessor: (templateString: string, options: any) => string = null;
let globExpander: (globs: string[]) => string[] = null;

export function resolveAsync(applyTo: IGruntTSOptions,
  taskOptions: ITargetOptions,
  targetOptions: ITargetOptions,
  theTemplateProcessor: (templateString: string, options: any) => string,
  theGlobExpander: (globs: string[]) => string[] = null) {

  templateProcessor = theTemplateProcessor;
  globExpander = theGlobExpander;

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
        return reject('Error parsing "' + projectFile + '".  It may not be valid JSON in UTF-8.  ' +
          'The shortest possible file contents that will "work" with grunt-ts is: {}');
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

  if (!tsconfig.ignoreSettings && co) {
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

  if (!('updateFiles' in tsconfig)) {
    tsconfig.updateFiles = true;
  }

  if (applyTo.CompilationTasks.length === 0) {
    applyTo.CompilationTasks.push({src: []});
  }

  const src = applyTo.CompilationTasks[0].src;

  if (tsconfig.updateFiles && projectSpec.filesGlob) {
    updateTSConfigAndFilesFromGlob(projectSpec.files, projectSpec.filesGlob, tsconfig.tsconfig );
  }

  const absolutePathToTSConfig = path.resolve(tsconfig.tsconfig, '..');

  if (projectSpec.files) {
    addUniqueRelativeFilesToSrc(projectSpec.files, src, absolutePathToTSConfig);
  } else {
    if (!(<any>globExpander).isStub) {
      // if files is not specified, default to including *.ts and *.tsx in folder and subfolders.
      const virtualGlob = [path.resolve(absolutePathToTSConfig, './**/*.ts'),
                        path.resolve(absolutePathToTSConfig, './**/*.tsx')];
      if (projectSpec.exclude && _.isArray(projectSpec.exclude)) {
          projectSpec.exclude.forEach(exc => {
            virtualGlob.push('!' + path.resolve(absolutePathToTSConfig, exc, './**/*.ts'));
            virtualGlob.push('!' + path.resolve(absolutePathToTSConfig, exc, './**/*.tsx'));
          });
      }

      const files = globExpander(virtualGlob);

      // make files relative to the tsconfig.json file
      for (let i = 0; i < files.length; i += 1) {
        files[i] = path.relative(absolutePathToTSConfig, files[i]).replace(/\\/g, '/');
      }

      projectSpec.files = files;
      if (projectSpec.filesGlob) {
        saveTSConfigSync(tsconfig.tsconfig, projectSpec);
      }
      addUniqueRelativeFilesToSrc(files, src, absolutePathToTSConfig);
    }
  }

  return result;
}


function updateTSConfigAndFilesFromGlob(filesRelativeToTSConfig: string[],
      globRelativeToTSConfig: string[], tsconfigFileName: string) {

    if (!(<any>globExpander).isStub) {
      return;
    }

    const absolutePathToTSConfig = path.resolve(tsconfigFileName, '..');

    let filesGlobRelativeToGruntfile: string[] = [];

    for (let i = 0; i < globRelativeToTSConfig.length; i += 1) {
      filesGlobRelativeToGruntfile.push(path.relative(path.resolve('.'), path.join(absolutePathToTSConfig, globRelativeToTSConfig[i])));
    }

    const filesRelativeToGruntfile = globExpander(filesGlobRelativeToGruntfile);

    {
      let filesRelativeToTSConfig_temp = [];
      const relativePathFromGruntfileToTSConfig = path.relative('.', absolutePathToTSConfig).replace(/\\/g, '/');
      for (let i = 0; i < filesRelativeToGruntfile.length; i += 1) {
        filesRelativeToGruntfile[i] = filesRelativeToGruntfile[i].replace(/\\/g, '/');
        filesRelativeToTSConfig_temp.push(path.relative(relativePathFromGruntfileToTSConfig, filesRelativeToGruntfile[i]));
      }

      filesRelativeToTSConfig = filesRelativeToTSConfig_temp;
    }

    const tsconfigJSONContent = utils.readAndParseJSONFromFileSync(tsconfigFileName);

    const tempTSConfigFiles = tsconfigJSONContent.files || [];

    if (_.difference(tempTSConfigFiles, filesRelativeToTSConfig).length > 0 ||
      _.difference(filesRelativeToTSConfig, tempTSConfigFiles).length > 0) {
        try {
          tsconfigJSONContent.files = filesRelativeToTSConfig;
          saveTSConfigSync(tsconfigFileName, tsconfigJSONContent);
        } catch (ex) {
          const error = new Error('Error updating tsconfig.json: ' + ex);
          throw error;
        }
    }
}

function saveTSConfigSync(fileName: string, content: any) {
    fs.writeFileSync(fileName, JSON.stringify(content, null, '    '));
}


function addUniqueRelativeFilesToSrc(tsconfigFilesArray: string[], compilationTaskSrc: string[], absolutePathToTSConfig: string) {
  const gruntfileFolder = path.resolve('.');

  _.map(_.uniq(tsconfigFilesArray), (file) => {
      const absolutePathToFile = path.normalize(path.join(absolutePathToTSConfig, file));
      const relativePathToFileFromGruntfile = path.relative(gruntfileFolder, absolutePathToFile).replace(new RegExp('\\' + path.sep, 'g'), '/');

      if (compilationTaskSrc.indexOf(absolutePathToFile) === -1 &&
          compilationTaskSrc.indexOf(relativePathToFileFromGruntfile) === -1) {
          compilationTaskSrc.push(relativePathToFileFromGruntfile);
      }
  });
}
