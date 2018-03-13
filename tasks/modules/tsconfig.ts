'use strict';

import {Promise} from 'es6-promise';
import * as fs from 'fs';
import * as path from 'path';
import * as stripBom from 'strip-bom';
import * as _ from 'lodash';
import * as detectIndent from 'detect-indent';
import * as detectNewline from 'detect-newline';
import * as utils from './utils';
import * as ts from '../ts';
import * as jsmin from 'jsmin2';


let templateProcessor: (templateString: string, options: any) => string = null;
let globExpander: (globs: string[]) => string[] = null;
let gruntfileGlobs : string[] = null;
let verboseLogger: (logText: string) => void = null;
let absolutePathToTSConfig: string;

let detectedIndentString = '    ', detectedNewline = utils.eol;

const gruntfileFolder = path.resolve('.');

export function resolveAsync(applyTo: Partial<IGruntTSOptions>,
  taskOptions: ITargetOptions,
  targetOptions: ITargetOptions,
  theTemplateProcessor: (templateString: string, options: any) => string,
  theGlobExpander: (globs: string[]) => string[] = null,
  theVerboseLogger: (logText: string) => void = null) {

  templateProcessor = theTemplateProcessor;
  globExpander = theGlobExpander;
  gruntfileGlobs = getGlobs(taskOptions, targetOptions);
  verboseLogger = theVerboseLogger || ((logText: string) => {});

  return new Promise<Partial<IGruntTSOptions>>((resolve, reject) => {

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
      let projectSpec: ITSConfigFile = {extends: (<ITSConfigSupport>applyTo.tsconfig).tsconfig};
      while (projectSpec.extends) {
        const pathOfTsconfig = path.resolve(projectSpec.extends, '..');
        try {
          var projectFileTextContent = fs.readFileSync(projectSpec.extends, 'utf8');
        } catch (ex) {
          if (ex && ex.code === 'ENOENT') {
              return reject('Could not find file "' + projectSpec.extends + '".');
          } else if (ex && ex.errno) {
              return reject('Error ' + ex.errno + ' reading "' + projectSpec.extends + '".');
          } else {
              return reject('Error reading "' + projectSpec.extends + '": ' + JSON.stringify(ex));
          }
        }
        try {
          const content = stripBom(projectFileTextContent);
          if (content.trim() === '') {
            // we are done.
            projectSpec.extends = undefined;
          } else {
            detectedIndentString = detectIndent(content).indent;
            detectedNewline = detectNewline(content);
            const minifiedContent = jsmin(content);
            const parentContent = JSON.parse(minifiedContent.code);
            projectSpec = _.defaultsDeep(projectSpec, parentContent);
            if (parentContent.extends) {
              projectSpec.extends = path.resolve(pathOfTsconfig, parentContent.extends);
              if (!_.endsWith(projectSpec.extends, '.json')) {
                projectSpec.extends += '.json';
              }
            } else {
              projectSpec.extends = undefined;
            }
          }
        } catch (ex) {
          return reject('Error parsing "' + projectSpec.extends + '".  It may not be valid JSON in UTF-8.');
        }
      }

      applyTo = handleBadConfiguration(applyTo, projectSpec);
      applyTo = applyCompilerOptions(applyTo, projectSpec);
      applyTo = resolve_output_locations(applyTo, projectSpec);
    }

    resolve(applyTo);
  });
}


function handleBadConfiguration(options: Partial<IGruntTSOptions>, projectSpec: ITSConfigFile) {
  if (projectSpec.compilerOptions) {
    if (projectSpec.compilerOptions.out && projectSpec.compilerOptions.outFile) {
      options.warnings.push('Warning: `out` and `outFile` should not be used together in tsconfig.json.');
    }
    if (projectSpec.compilerOptions.out) {
      options.warnings.push('Warning: Using `out` in tsconfig.json can be unreliable because it will output relative' +
        ' to the tsc working directory.  It is better to use `outFile` which is always relative to tsconfig.json, ' +
        ' but this requires TypeScript 1.6 or higher.');
    }
  }

  const tsconfigSetting = options.tsconfig as ITSConfigSupport;
  if (projectSpec.include && tsconfigSetting.overwriteFilesGlob) {
    options.errors.push('Error: grunt-ts does not support using the `overwriteFilesGlob` feature with a tsconfig.json' +
      ' file that has an `include` array.  If your version of TypeScript supports `include`, you should just use that.');
  }
  if (projectSpec.include && tsconfigSetting.updateFiles) {
    options.errors.push('Error: grunt-ts does not support using the `updateFiles` feature with a tsconfig.json' +
      ' file that has an `include` array.  If your version of TypeScript supports `include`, you should just use that.');
  }

  return options;
}


function getGlobs(taskOptions: ITargetOptions, targetOptions: ITargetOptions) {
  let globs = null;

  if (taskOptions && isStringOrArray((<any>taskOptions).src)) {
    globs = _.map(getFlatCloneOf([(<any>taskOptions).src]), item => templateProcessor(item, {}));
  }
  if (targetOptions && isStringOrArray((<any>targetOptions).src)) {
    globs = _.map(getFlatCloneOf([(<any>targetOptions).src]), item => templateProcessor(item, {}));
  }

  return globs;

  function isStringOrArray(thing: any) {
    return (_.isArray(thing) || _.isString(thing));
  }

  function getFlatCloneOf(array: Array<any>) {
    return [...(<any>_.flattenDeep(array))];
  }
}

function resolve_output_locations(options: Partial<IGruntTSOptions>, projectSpec: ITSConfigFile) {
  if (options.CompilationTasks
      && options.CompilationTasks.length > 0
      && projectSpec
      && projectSpec.compilerOptions) {
    options.CompilationTasks.forEach(compilationTask => {
        if (projectSpec.compilerOptions.out && !compilationTask.out) {
          compilationTask.out = path.normalize(
            projectSpec.compilerOptions.out
          ).replace(/\\/g, '/');
        }
        if (projectSpec.compilerOptions.outFile  && !compilationTask.out) {
          compilationTask.out = path.normalize(path.join(
            relativePathFromGruntfileToTSConfig(),
            projectSpec.compilerOptions.outFile)).replace(/\\/g, '/');
        }
        if (projectSpec.compilerOptions.outDir) {
          compilationTask.outDir = path.normalize(path.join(
            relativePathFromGruntfileToTSConfig(),
            projectSpec.compilerOptions.outDir)).replace(/\\/g, '/');
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
        tsconfig: path.join(gruntfileFolder, 'tsconfig.json')
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
    if (!('tsconfig' in <ITSConfigSupport>raw.tsconfig) &&
        !(<ITSConfigSupport>raw.tsconfig).passThrough) {
      (<ITSConfigSupport>raw.tsconfig).tsconfig = 'tsconfig.json';
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

function applyCompilerOptions(applyTo: Partial<IGruntTSOptions>, projectSpec: ITSConfigFile) {
  let result: IGruntTSOptions = applyTo || <any>{};
  const co = projectSpec.compilerOptions,
    tsconfig = <ITSConfigSupport>applyTo.tsconfig;

  absolutePathToTSConfig = path.resolve(tsconfig.tsconfig, '..');

  if (!tsconfig.ignoreSettings && co) {

    // Go here for the tsconfig.json documentation:
    // https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/tsconfig.json.md
    // There is a link to http://json.schemastore.org/tsconfig

    const sameNameInTSConfigAndGruntTS = [
      'allowJs',
      'allowSyntheticDefaultImports',
      'allowUnreachableCode',
      'allowUnusedLabels',
      'alwaysStrict',
      'baseUrl',
      'charset',
      'checkJs',
      'declaration',
      'declarationDir',
      'diagnostics',
      'disableSizeLimit',
      'downlevelIteration',
      'emitBOM',
      'emitDecoratorMetadata',
      'esModuleInterop',
      'experimentalAsyncFunctions',
      'experimentalDecorators',
      'forceConsistentCasingInFileNames',
      'isolatedModules',
      'importHelpers',
      'inlineSourceMap',
      'inlineSources',
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
      'out',
      'outDir',
      // outFile is handled below.
      'preserveConstEnums',
      'preserveSymlinks',
      'pretty',
      'reactNamespace',
      'removeComments',
      'rootDir',
      'skipDefaultLibCheck',
      'skipLibCheck',
      'sourceMap',
      'sourceRoot',
      'strict',
      'strictFunctionTypes',
      'strictNullChecks',
      'strictPropertyInitialization',
      'stripInternal',
      'suppressExcessPropertyIndexErrors',
      'suppressImplicitAnyIndexErrors',
      'target',
      'traceResolution',
      'types',
      // typeRoots is handled below.
      // we do not support the native TypeScript watch.
    ];

    sameNameInTSConfigAndGruntTS.forEach(propertyName => {
      if ((propertyName in co) && !(propertyName in result)) {
          result[propertyName] = co[propertyName];
      }
    });

    // now copy the ones that don't have the same names.

    // `outFile` was added in TypeScript 1.6 and is the same as out for command-line
    // purposes except that `outFile` is relative to the tsconfig.json.
    if (('outFile' in co) && !('out' in result)) {
      result['out'] = co['outFile'];
    }

    // when inside the tsconfig.json the `typeRoots` paths needs to be move relative to gruntfile
    if (('typeRoots' in co) && !('typeRoots' in result)) {
      const relPath = relativePathFromGruntfileToTSConfig();
      result['typeRoots'] = _.map(co['typeRoots'], p => { return path.relative('.', path.resolve(relPath, p)).replace(/\\/g, '/'); });
    }
  }

  if (!('updateFiles' in tsconfig)) {
    tsconfig.updateFiles = !('include' in projectSpec) && ('filesGlob' in projectSpec);
  }

  if (applyTo.CompilationTasks.length === 0) {
    applyTo.CompilationTasks.push({src: []});
  }

  if (tsconfig.overwriteFilesGlob) {
    if (!gruntfileGlobs) {
      throw new Error('The tsconfig option overwriteFilesGlob is set to true, but no glob was passed-in.');
    }

    const relPath = relativePathFromGruntfileToTSConfig(),
      gruntGlobsRelativeToTSConfig: string[] = [];

    for (let i = 0; i < gruntfileGlobs.length; i += 1) {
        gruntfileGlobs[i] = gruntfileGlobs[i].replace(/\\/g, '/');
        gruntGlobsRelativeToTSConfig.push(path.relative(relPath, gruntfileGlobs[i]).replace(/\\/g, '/'));
    }

    if (_.difference(projectSpec.filesGlob, gruntGlobsRelativeToTSConfig).length > 0 ||
        _.difference(gruntGlobsRelativeToTSConfig, projectSpec.filesGlob).length > 0) {
          projectSpec.filesGlob = gruntGlobsRelativeToTSConfig;
          if (projectSpec.files) {
            projectSpec.files = [];
          }
          saveTSConfigSync(tsconfig.tsconfig, projectSpec);
    }
  }

  result = addFilesToCompilationContext(result, projectSpec);

  return result;
}


function addFilesToCompilationContext(applyTo: IGruntTSOptions, projectSpec: ITSConfigFile) {
  // see http://www.typescriptlang.org/docs/handbook/tsconfig-json.html

  const resolvedInclude: string[] = [], resolvedExclude: string[] = [], resolvedFiles: string[] = [];

  const result: IGruntTSOptions = applyTo,
    co = projectSpec.compilerOptions,
    tsconfig = <ITSConfigSupport>applyTo.tsconfig,
    src = applyTo.CompilationTasks[0].src;

  if (projectSpec.exclude) {
    resolvedExclude.push(...(projectSpec.exclude.map(f => {
        let p = path.join(absolutePathToTSConfig, f);
        try {
          let stats = fs.statSync(p);
          if (stats.isDirectory()) {
            p = path.join(p, '**');
          }
        } catch (err) {
          // eat it - likely a "does not exist" error.
          verboseLogger(`Warning: "${p}" was specified in tsconfig \`exclude\` property, but was not found on disk.`);
        }
        return utils.prependIfNotStartsWith(p, '!');
      })));
    verboseLogger('Resolved exclude from tsconfig: ' + JSON.stringify(resolvedExclude));
  } else {
    resolvedExclude.push(utils.prependIfNotStartsWith(path.join(absolutePathToTSConfig, 'node_modules/**'), '!'),
      utils.prependIfNotStartsWith(path.join(absolutePathToTSConfig, 'bower_components/**'), '!'),
      utils.prependIfNotStartsWith(path.join(absolutePathToTSConfig, 'jspm_packages/**'), '!'));
  }

  if (co && co.outDir) {
    resolvedExclude.push(utils.prependIfNotStartsWith(path.join(absolutePathToTSConfig, co.outDir, '**'), '!'));
  }

  if (projectSpec.include || projectSpec.files) {
    if (projectSpec.files) {
      resolvedFiles.push(...projectSpec.files.map(f => path.join(absolutePathToTSConfig, f)));
      verboseLogger('Resolved files from tsconfig: ' + JSON.stringify(resolvedFiles));
    }
    if (_.isArray(projectSpec.include)) {
      resolvedInclude.push(...projectSpec.include.map(f => path.join(absolutePathToTSConfig, f)));
      verboseLogger('Resolved include from tsconfig: ' + JSON.stringify(resolvedInclude));
    }
  } else {
    if (!tsconfig.updateFiles) {
      resolvedInclude.push(
        path.join(absolutePathToTSConfig, '**/*.ts'),
        path.join(absolutePathToTSConfig, '**/*.d.ts'),
        path.join(absolutePathToTSConfig, '**/*.tsx')
      );
      if (applyTo.allowJs) {
        resolvedInclude.push(
          path.join(absolutePathToTSConfig, '**/*.js'),
          path.join(absolutePathToTSConfig, '**/*.jsx')
        );
      }
      verboseLogger('Automatic include from tsconfig: ' + JSON.stringify(resolvedInclude));
    }
  }

  const resolvedExcludeFromGruntfile = (applyTo.CompilationTasks[0].glob || [])
    .filter(g => g.charAt(0) === '!').map(g => '!' + path.join(gruntfileFolder, g.substr(1)));

  const expandedCompilationContext: string[] = [];
  if (resolvedInclude.length > 0 || resolvedExclude.length > 0) {
    if ((globExpander as any).isStub) {
      result.warnings.push('Attempt to resolve glob in tsconfig module using stub globExpander.');
    }
    const globsToResolve = [...resolvedInclude, ...resolvedExclude, ...resolvedExcludeFromGruntfile];

    expandedCompilationContext.push(...(globExpander(globsToResolve).filter(p => {

      if (_.endsWith(p, '.ts') || _.endsWith(p, '.tsx')) {
        return true;
      }
      if (applyTo.allowJs && (_.endsWith(p, '.js') || _.endsWith(p, '.jsx'))) {
        return true;
      }
      return false;
    })));
  }

  const tsconfigCompilationContext = [...expandedCompilationContext, ...resolvedFiles];

  verboseLogger('Will resolve tsconfig compilation context from: ' + JSON.stringify(tsconfigCompilationContext));

  addUniqueRelativeFilesToSrc(tsconfigCompilationContext, src, absolutePathToTSConfig);

  if (tsconfig.updateFiles && projectSpec.filesGlob) {
    if (projectSpec.files === undefined) {
      projectSpec.files = [];
    }
    updateTSConfigAndFilesFromGlobAndAddToCompilationContext(projectSpec.files, projectSpec.filesGlob, tsconfig.tsconfig, src);
  }

  return result;
}


function relativePathFromGruntfileToTSConfig() {
  if (!absolutePathToTSConfig) {
    throw 'attempt to get relative path to tsconfig.json before setting absolute path';
  }
  return path.relative('.', absolutePathToTSConfig).replace(/\\/g, '/');
}


function updateTSConfigAndFilesFromGlobAndAddToCompilationContext(filesRelativeToTSConfig: string[],
      globRelativeToTSConfig: string[], tsconfigFileName: string, currentCompilationFilesList: string[]) {

    if ((<any>globExpander).isStub) {
      return;
    }

    const absolutePathToTSConfig = path.resolve(tsconfigFileName, '..');

    let filesGlobRelativeToGruntfile: string[] = [];

    for (let i = 0; i < globRelativeToTSConfig.length; i += 1) {
      filesGlobRelativeToGruntfile.push(path.relative(gruntfileFolder, path.join(absolutePathToTSConfig, globRelativeToTSConfig[i])));
    }

    const filesRelativeToGruntfile = globExpander(filesGlobRelativeToGruntfile);

    {
      let filesRelativeToTSConfig_temp = [];
      const relativePathFromGruntfileToTSConfig = path.relative('.', absolutePathToTSConfig).replace(/\\/g, '/');
      for (let i = 0; i < filesRelativeToGruntfile.length; i += 1) {
        filesRelativeToGruntfile[i] = filesRelativeToGruntfile[i].replace(/\\/g, '/');
        if (currentCompilationFilesList.indexOf(filesRelativeToGruntfile[i]) === -1) {
          currentCompilationFilesList.push(filesRelativeToGruntfile[i]);
        }
        filesRelativeToTSConfig_temp.push(path.relative(relativePathFromGruntfileToTSConfig, filesRelativeToGruntfile[i]).replace(/\\/g, '/'));
      }

      filesRelativeToTSConfig.length = 0;
      filesRelativeToTSConfig.push(...filesRelativeToTSConfig_temp);
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

function saveTSConfigSync(fileName: string, content: ITSConfigFile) {
    fs.writeFileSync(fileName, prettyJSON(content, detectedIndentString, detectedNewline));
}

export function prettyJSON(object: any, indent: string | number = 4, newLine: string = utils.eol): string {
  const cache = [];
  let value = JSON.stringify(
    object,
    // fixup circular reference
    function(key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    },
    indent
  );
  value = value.replace(/(?:\r\n|\r|\n)/g, newLine) + newLine;
  return value;
}

const replaceSlashesRegex = new RegExp('\\' + path.sep, 'g');

function addUniqueRelativeFilesToSrc(tsconfigFilesArray: string[], compilationTaskSrc: string[], absolutePathToTSConfig: string) {

  _.map(_.uniq(tsconfigFilesArray), (file) => {
      const absolutePathToFile = utils.isAbsolutePath(file) ? file : path.normalize(path.join(absolutePathToTSConfig, file));
      const relativePathToFileFromGruntfile = path.relative(gruntfileFolder, absolutePathToFile).replace(replaceSlashesRegex, '/');

      if (compilationTaskSrc.indexOf(absolutePathToFile) === -1 &&
          compilationTaskSrc.indexOf(relativePathToFileFromGruntfile) === -1) {
          compilationTaskSrc.push(relativePathToFileFromGruntfile);
      }
  });
}

