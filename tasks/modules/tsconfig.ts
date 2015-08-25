'use strict';

import {Promise} from 'es6-promise';
import * as fs from 'fs';
import * as stripBom from 'strip-bom';


export function resolveAsync(projectFile: string) {
  return new Promise<IGruntTSOptions>((resolve, reject) => {

    try {
      var projectFileTextContent = fs.readFileSync(projectFile, 'utf8');
    } catch (ex) {
      if (ex && ex.code === 'ENOENT') {
          reject('Could not find file "' + projectFile + '".');
      } else if (ex && ex.errno) {
          reject('Error ' + ex.errno + ' reading "' + projectFile + '".');
      } else {
          reject('Error reading "' + projectFile + '": ' + JSON.stringify(ex));
      }
      reject(ex);
    }

    try {
      var projectSpec = JSON.parse(stripBom(projectFileTextContent));
    } catch (ex) {
      reject('Error parsing "' + projectFile + '".  It may not be valid JSON in UTF-8.');
    }

    let spec: IGruntTSOptions = getCompilerOptions(projectSpec);

    resolve(spec);

  });
}

function getCompilerOptions(projectSpec: ITSConfig) {
  const result: IGruntTSOptions = <any>{};

  const co = projectSpec.compilerOptions;

  const tsconfigMappingToGruntTSProperty = ['declaration', 'emitDecoratorMetadata',
    'experimentalDecorators', 'isolatedModules',
    'inlineSourceMap', 'inlineSources', 'mapRoot', 'module', 'newLine', 'noEmit',
    'noEmitHelpers', 'noEmitOnError', 'noImplicitAny', 'noLib', 'noResolve',
    'out', 'outDir', 'preserveConstEnums', 'removeComments', 'sourceMap',
    'sourceRoot', 'suppressImplicitAnyIndexErrors', 'target'];

  tsconfigMappingToGruntTSProperty.forEach((propertyName) => {
    if (propertyName in co) {
        result[propertyName] = co[propertyName];
    }
  });

  return result;
}

interface ITSConfig {
    compilerOptions: ICompilerOptions;
}

// NOTE: This is from tsconfig.ts in atom-typescript
interface ICompilerOptions {
    allowNonTsExtensions?: boolean;
    charset?: string;
    codepage?: number;
    declaration?: boolean;
    diagnostics?: boolean;
    emitBOM?: boolean;
    experimentalAsyncFunctions?: boolean;
    experimentalDecorators?: boolean;                 // Experimental. Needed for the next option `emitDecoratorMetadata` see : https://github.com/Microsoft/TypeScript/pull/3330
    emitDecoratorMetadata?: boolean;                  // Experimental. Emits addition type information for this reflection API https://github.com/rbuckton/ReflectDecorators
    help?: boolean;
    isolatedModules?: boolean;
    inlineSourceMap?: boolean;
    inlineSources?: boolean;
    jsx?: string;
    locale?: string;
    mapRoot?: string;                                 // Optionally Specifies the location where debugger should locate map files after deployment
    module?: string;
    newLine?: string;
    noEmit?: boolean;
    noEmitHelpers?: boolean;
    noEmitOnError?: boolean;
    noErrorTruncation?: boolean;
    noImplicitAny?: boolean;                          // Error on inferred `any` type
    noLib?: boolean;
    noLibCheck?: boolean;
    noResolve?: boolean;
    out?: string;
    outDir?: string;                                  // Redirect output structure to this directory
    preserveConstEnums?: boolean;
    removeComments?: boolean;                         // Do not emit comments in output
    rootDir?: string;
    sourceMap?: boolean;                              // Generates SourceMaps (.map files)
    sourceRoot?: string;                              // Optionally specifies the location where debugger should locate TypeScript source files after deployment
    suppressImplicitAnyIndexErrors?: boolean;
    target?: string;                                  // 'es3'|'es5' (default)|'es6'
    version?: boolean;
    watch?: boolean;
}
