/// <reference path="../defs/tsd.d.ts"/>
/// <reference path="../tasks/modules/interfaces.d.ts"/>

import {Promise} from 'es6-promise';

export const decoratorMetadataPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
      if (options.emitDecoratorMetadata === true &&
        options.experimentalDecorators === true) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected emitDecoratorMetadata === true and experimentalDecorators === true";
  });
};

export const decoratorMetadataNotPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.emitDecoratorMetadata === undefined) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected emitDecoratorMetadata === false, was " + options.emitDecoratorMetadata;
  });
};

export const variablesReplacedForTSConfig : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    const expected = "test/tsconfig/tsconfig-grunt-ts.json";
    if (options.tsconfig && (<ITSConfigSupport>options.tsconfig).tsconfig === expected) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected tsconfig file === ${expected}, was ${(<ITSConfigSupport>options.tsconfig).tsconfig}`;
  });
};

export const tsconfig_passThrough_onlySendsConfigThrough_WithPathAndAdditional : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    let tscfg = <ITSConfigSupport>options.tsconfig;
    if (tscfg
        && tscfg.passThrough
        && tscfg.tsconfig === 'test/tsconfig'
        && options.additionalFlags === '--someNewThing') {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected --project .  The tsconfig was ${JSON.stringify(tscfg)}.  AddlFlags was ${options.additionalFlags}`;
  });
};

export const tsconfig_passThrough_onlySendsConfigThrough_WithoutPath : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    let tscfg = <ITSConfigSupport>options.tsconfig;
    if (tscfg && tscfg.passThrough && tscfg.tsconfig === '.') {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected --project .  The tsconfig was ${JSON.stringify(tscfg)}`;
  });
};

export const variablesReplacedFor_vs : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    const expected = "test/vsproj/testproject.csproj";
    if (options.vs && (<IVisualStudioProjectSupport>options.vs).project === expected) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected vs project file === ${expected}, was ${(<IVisualStudioProjectSupport>options.vs).project}`;
  });
};

export const experimentalDecoratorsPassed: ICompilePromise = (strings, options) => {
    return new Promise((resolve, reject) => {
        if (options.experimentalDecorators === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected experimentalDecorators === true";
    });
};

export const noEmitPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.noEmit === true) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected noEmit === true";
  });
};


export const noEmitNotPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.noEmit === undefined) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected noEmit === false, was " + options.noEmit;
  });
};


export const inlineSourcesPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
      if (options.inlineSources === true &&
          options.sourceMap === false &&
          options.inlineSourceMap === true) {
      resolve({
        code: 0,
        output: ""
      });
      }
      let result = JSON.stringify({
          inlineSources: options.inlineSources,
          sourceMap: options.sourceMap,
          inlineSourceMap: options.inlineSourceMap
      });
      throw "expected inlineSources and inlineSourceMap, but not sourceMap.  Got " + result;
  });
};

export const inlineSourcesAndInlineSourceMapPassed: ICompilePromise = (strings, options) => {
    return new Promise(function (resolve, reject) {
        if (options.inlineSources === true &&
            options.sourceMap === false &&
            options.inlineSourceMap === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        let result = JSON.stringify({
            inlineSources: options.inlineSources,
            sourceMap: options.sourceMap,
            inlineSourceMap: options.inlineSourceMap
        });
        throw "expected inlineSources and inlineSourceMap, but not sourceMap.  Got " + result;
    });
};

export const inlineSourceMapPassedWithSourceMap: ICompilePromise = (strings, options) => {
    return new Promise(function (resolve, reject) {
        if (options.inlineSources === undefined &&
            options.sourceMap === false &&
            options.inlineSourceMap === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        let result = JSON.stringify({
            inlineSources: options.inlineSources,
            sourceMap: options.sourceMap,
            inlineSourceMap: options.inlineSourceMap
        });
        throw "expected inlineSourceMap only.  Got " + result;
    });
};

export const inlineSourcesNotPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.inlineSources === undefined && options.sourceMap === false) {
      resolve({
        code: 0,
        output: ""
      });
      }
    let result = JSON.stringify({
        inlineSources: options.inlineSources,
        sourceMap: options.sourceMap,
        inlineSourceMap: options.inlineSourceMap
    });
    throw "expected inlineSourcesPassed === undefined and sourceMap false.  Got " + result;
  });
};

export const vsproj_test : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.sourceMap === true &&
        options.removeComments === false &&
        options.module === 'commonjs' &&
        options.CompilationTasks[0].outDir === 'test/vsproj/vsproj_test' &&
        options.strictNullChecks === true) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected sourceMap === true, removeComments===" +
      "false, module===commonjs, outDir===vsproj_test, strictNullChecks===true.  Was " +
        JSON.stringify([options.sourceMap,
        options.removeComments, options.module, options.CompilationTasks[0].outDir, options.strictNullChecks]);
  });
};

export const vsproj_test_config : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.sourceMap === false &&
        options.removeComments === true &&
        options.CompilationTasks[0].outDir.indexOf('vsproj_test_config') >= 0) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected sourceMap === false, removeComments===" +
      "true, outDir contains vsproj_test_config.  Was " +
        JSON.stringify([options.sourceMap,
        options.removeComments, options.CompilationTasks[0].outDir]);
  });
};

export const param_newLine_CRLF: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.newLine === "CRLF") {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected newLine=CRLF.  Was " +
        JSON.stringify([options.newLine]);
  });
};

export const param_newLine_LF: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.newLine === "LF") {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected newLine=LF.  Was " +
        JSON.stringify([options.newLine]);
  });
};

export const files_testFilesUsedWithDestAsAFolder: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.CompilationTasks[0].outDir === "test/multifile/files_testFilesUsedWithDestAsAJSFolder" &&
      (options.CompilationTasks[0].out || "not specified") === "not specified") {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected --out not specified and outDir=test/multifile/files_testFilesUsedWithDestAsAJSFolder.  Was " +
        JSON.stringify([options.CompilationTasks[0].outDir]);
  });
};

export const files_testFilesUsedWithDestAsAFile: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.CompilationTasks[0].out === "test/multifile/files_testFilesUsedWithDestAsAJSFile/testDest.js" &&
      (options.CompilationTasks[0].outDir || "not specified") === "not specified") {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected --outDir not specified and out=test/multifile/files_testFilesUsedWithDestAsAJSFile/testDest.js.  Was " +
        JSON.stringify([options.CompilationTasks[0].outDir]);
  });
};

export const test_systemJS: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.module === "system") {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected system.  Was " +
        JSON.stringify([options.module]);
  });
};

export const test_umd: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.module === "umd") {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected umd.  Was " +
        JSON.stringify([options.module]);
  });
};

export const test_isolatedModules: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.isolatedModules === true) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected --isolatedModules.  Got ${JSON.stringify(options)}`;
  });
};

export const test_noEmitHelpers: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.noEmitHelpers === true) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected --noEmitHelpers.  Got ${JSON.stringify(options)}`;
  });
};

export const test_additionalFlags: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.additionalFlags === '--version') {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected --version.  Got ${JSON.stringify(options)}`;
  });
};

export const bad_sourcemap_option: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    if (options.warnings.length > 0
        && options.warnings[0].indexOf("sourceMap") > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see a warning for bad sourceMap option.`;
  });
};

export const out_with_spaces: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1];
    if (command.indexOf('--out "test/out with spaces/out with spaces.js"') > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see relative path to out with spaces.js surrounded in quotes.`;
  });
};

export const files_showWarningIfFilesIsUsedWithSrcOrOut: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    const expectedWarning = `Warning: In task "files_showWarningIfFilesIsUsedWithSrcOrOut", either` +
      ` "files" or "src" should be used - not both.`;

    if (command.indexOf('multifile/b/a.ts') > -1 &&
        command.indexOf('multifile/b/b.ts') > -1 &&
        command.indexOf('multifile/b/c.ts') > -1 &&
        command.indexOf('multifile/b/reference.ts') > -1 &&
        command.indexOf('multifile/a/a.ts') === -1 &&
        options.warnings.indexOf(expectedWarning) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see TypeScript files in multifile/b, but not multifile/a.  Also, expected ` +
      `a warning about using src with files.`;
  });
};

export const files_showWarningIfFilesIsUsedWithSrcOrOutDir: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    const expectedWarning = `Warning: In task "files_showWarningIfFilesIsUsedWithSrcOrOutDir", either` +
      ` "files" or "src" should be used - not both.`;

    if (command.indexOf('multifile/b/a.ts') > -1 &&
        command.indexOf('multifile/b/b.ts') > -1 &&
        command.indexOf('multifile/b/c.ts') > -1 &&
        command.indexOf('multifile/b/reference.ts') > -1 &&
        command.indexOf('multifile/a/a.ts') === -1 &&
        options.warnings.indexOf(expectedWarning) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see TypeScript files in multifile/b, but not multifile/a.  Also, expected ` +
      `a warning about using src with files.`;
  });
};

export const files_showWarningIfFilesIsUsedWithVs: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    const expectedWarning = `Warning: In task "files_showWarningIfFilesIsUsedWithVs", either "files" ` +
      `or "vs" should be used - not both.`;

    if (command.indexOf('multifile/a/a.ts') > -1 &&
        command.indexOf('multifile/a/b.ts') > -1 &&
        command.indexOf('multifile/a/c.ts') > -1 &&
        command.indexOf('multifile/a/reference.ts') > -1 &&
        command.indexOf('vsproj/vsprojtest1.ts') > -1 &&
        command.indexOf('multifile/b') === -1 &&
        options.warnings.indexOf(expectedWarning) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see TypeScript files in multifile/a and vsproj.  Also, expected ` +
      `a warning about using vs with files.`;
  });
};

export const files_showWarningIfFilesIsUsedWithFast: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    const expectedWarning = `Warning: target "files_showWarningIfFilesIsUsedWithFast" is attempting to use fast compilation with "files".` +
      `  This is not currently supported.  Setting "fast" to "never".`;

    if (command.indexOf('multifile/a/a.ts') > -1 &&
        command.indexOf('multifile/a/b.ts') > -1 &&
        command.indexOf('multifile/a/c.ts') > -1 &&
        command.indexOf('multifile/a/reference.ts') > -1 &&
        options.warnings.indexOf(expectedWarning) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see TypeScript files in multifile/a and a warning about using src with files.`;
  });
};

export const files_testWarnIfFilesHasDestArray: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    const expectedWarning = `Warning: target "files_testWarnIfFilesHasDestArray" has an array specified for the files.dest property.` +
      `  This is not supported.  Taking first element and ignoring the rest.`;

    if (command.indexOf('multifile/a/a.ts') > -1 &&
        command.indexOf('multifile/a/b.ts') > -1 &&
        command.indexOf('multifile/a/c.ts') > -1 &&
        command.indexOf('multifile/a/reference.ts') > -1 &&
        command.indexOf(',') === -1 &&
        options.warnings.indexOf(expectedWarning) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see TypeScript files in multifile/a and a warning about using an array for dest.` +
      `There should be no commas in the command line (which would indicate the array was passed as an array).`;
  });
};

export const warnbothcomments: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    const expectedWarning = `WARNING: Option "comments" and "removeComments" should not be used together.  ` +
      `The --removeComments value of false supercedes the --comments value of true`;

    if (command.indexOf('test/abtest/reference.ts') > -1 &&
        command.indexOf('comments') === -1 &&
        command.indexOf('remove') === -1 &&
        options.warnings.indexOf(expectedWarning) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to not see removeComments passed.`;
  });
};

export const test_jsx: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    const expected = '--jsx preserve';
    if (command.indexOf(expected) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see ${expected} in the command line and didn't.  Got this: ${command}`;
  });
};

export const test_moduleResolution: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    const expected = '--moduleResolution classic';
    if (command.indexOf(expected) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see ${expected} in the command line and didn't.  Got this: ${command}`;
  });
};

export const test_experimentalAsyncFunctions: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    const expected = '--experimentalAsyncFunctions';
    if (command.indexOf(expected) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see ${expected} in the command line and didn't.  Got this: ${command}`;
  });
};

export const test_rootDir: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    const expected = '--rootDir test/simple';
    if (command.indexOf(expected) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see ${expected} in the command line and didn't.  Got this: ${command}`;
  });
};

export const test_directoriesWithSpaces: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');

    if (command.indexOf(`--rootDir "test/rootDir with spaces"`) > -1 &&
        command.indexOf(`--outDir "test/outDir with spaces"`) > -1 &&
        command.indexOf(`--sourceRoot "test/sourceRoot with spaces"`) > -1 &&
        command.indexOf(`--mapRoot "test/mapRoot with spaces"`) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see rootDir, outDir, sourceRoot, and mapRoot with quoted values in the command line and didn't.  Got this: ${command}`;
  });
};

export const new_TypeScript_1_8_Features: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');

    if (command.indexOf(`--reactNamespace myReact`) > -1 &&
        command.indexOf(`--skipDefaultLibCheck`) > -1 &&
        command.indexOf(`--pretty`) > -1 &&
        command.indexOf(`--allowUnusedLabels`) > -1 &&
        command.indexOf(`--noImplicitReturns`) > -1 &&
        command.indexOf(`--noFallthroughCasesInSwitch`) > -1 &&
        command.indexOf(`--allowUnreachableCode`) > -1 &&
        command.indexOf(`--forceConsistentCasingInFileNames`) > -1 &&
        command.indexOf(`--allowJs`) > -1 &&
        command.indexOf(`--noImplicitUseStrict`) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see all of the new TypeScript 1.8 values in the command line and didn't.  Got this: ${command}`;
  });
};

export const new_TypeScript_2_0_Features: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');
    if (command.indexOf(`--strictNullChecks`) > -1 &&
        command.indexOf(`--noImplicitThis`) > -1 &&
        command.indexOf(`--lib es2017`) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see all of the new TypeScript 2.0 values in the command line and didn't.  Got this: ${command}`;
  });
};

export const new_TypeScript_2_and_2_1_Features: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');

    if (command.indexOf(`--alwaysStrict`) > -1 &&
        command.indexOf(`--baseUrl ..`) > -1 &&
        command.indexOf(`--charset utf8`) > -1 &&
        command.indexOf(`--declarationDir "../declarations dir"`) > -1 &&
        command.indexOf(`--diagnostics`) > -1 &&
        command.indexOf(`--importHelpers`) > -1 &&
        command.indexOf(`--jsxFactory React.createElement`) > -1 &&
        command.indexOf(`--lib es5,es2015.promise`) > -1 &&
        command.indexOf(`--listEmittedFiles`) > -1 &&
        command.indexOf(`--listFiles`) > -1 &&
        command.indexOf(`--maxNodeModuleJsDepth 2`) > -1 &&
        command.indexOf(`--noImplicitThis`) > -1 &&
        command.indexOf(`--noUnusedLocals`) > -1 &&
        command.indexOf(`--noUnusedParameters`) > -1 &&
        command.indexOf(`--strictNullChecks`) > -1 &&
        command.indexOf(`--traceResolution`) > -1 &&
        command.indexOf(`--types "node,lodash,express"`) > -1 &&
        command.indexOf(`--typeRoots "./sometypings,../../otherTypings"`) > -1 &&
        command.indexOf(`--disableSizeLimit`) > -1)
    {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see all of the new TypeScript 2 and 2.1 values in the command line and didn't.  Got this: ${command}`;
  });
}


export const new_TypeScript_2_3_Features: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');

    if (command.indexOf(`--strict`) > -1 &&
        command.indexOf(`--checkJs`) > -1 &&
        command.indexOf(`--downlevelIteration`) > -1 &&
        command.indexOf(`--lib esnext,dom.iterable,es2017.sharedmemory,esnext.asynciterable`) > -1)
    {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see all of the new TypeScript 2 and 2.1 values in the command line and didn't.  Got this: ${command}`;
  });
}


export const new_TypeScript_2_4_thru_2_6_Features: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');

    if (command.indexOf(`--noStrictGenericChecks`) > -1 &&
        command.indexOf(`--preserveSymlinks`) > -1 &&
        command.indexOf(`--skipLibCheck`) > -1 &&
        command.indexOf(`--strictFunctionTypes`) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see all of the new TypeScript 2.4/2.5/2.6 values in the command line and didn't.  Got this: ${command}`;
  });
};


export const new_TypeScript_2_6_final_and_2_7_Features: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');

    if (command.indexOf(`--esModuleInterop`) > -1 &&
        command.indexOf(`--strictPropertyInitialization`) > -1 &&
        command.indexOf(`--module esnext`) > -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see all of the new TypeScript 2.6 and 2.7 values in the command line and didn't.  Got this: ${command}`;
  });
};

export const files_dirdesttest: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g, '/');

    if (command.indexOf(`--outDir test/multifile/a/`) > -1 &&
        command.indexOf(`test/multifile/a/a.ts`) > -1 &&
        command.indexOf(`test/multifile/a/c.ts`) > -1 &&
        command.indexOf(`test/multifile/a/c.ts`) > -1)
    {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see three files under test/multifile/a and the --outDir switch, but didn't.  Got this: ${command}`;
  });
};

export const honorGruntfileExcludesWhenParsingTsconfig: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');

    if (command.indexOf(`.spec.ts`) === -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to not see .spec.ts files included (which are excluded from the glob in the Gruntfile).  Got this: ${command}`;
  });
}

export const issue_392: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');

    if (command.indexOf(`node_modules`) === -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see node_modules excluded and didn't (See GitHub issue 392).  Got this: ${command}`;
  });
}

export const issue_397: ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {

    const command = strings[1].replace(/\\/g,'/');

    if (command.indexOf(`--typeRoots "test/issue_397/src/typings,test/issue_397/src/other_typings"`) !== -1) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw `expected to see typeRoots files to be relative (See GitHub issue 397).  Got this: ${command}`;
  });
}


export const issue_426_1 = simpleCommandLineCheck("--baseUrl .");
export const issue_426_2 = simpleCommandLineCheck("--baseUrl ./");
export const issue_426_3 = simpleCommandLineCheck("--baseUrl ./app");
export const test_noLib = simpleCommandLineCheck("--noLib");
export const test_emitBOM = simpleCommandLineCheck("--emitBOM");
export const test_locale = simpleCommandLineCheck("--locale ja-jp");
export const test_suppressExcessPropertyErrors = simpleCommandLineCheck("--suppressExcessPropertyErrors");
export const test_stripInternal = simpleCommandLineCheck("--stripInternal");
export const test_allowSyntheticDefaultImports = simpleCommandLineCheck("--allowSyntheticDefaultImports");

function simpleCommandLineCheck(lookFor: string) {
  const result: ICompilePromise = (strings, options) => {
    return new Promise(function(resolve, reject) {

      const command = strings[1].replace(/\\/g,'/');
      if (command.indexOf(lookFor) > -1) {
        resolve({
          code: 0,
          output: ""
        });
      }
      throw `expected to see ${lookFor} on the command line and didn't.  Got this: ${command}`;
    });
  };
  return result;
}

const BASE_DIR_FILE_NAME = ".baseDir.ts";
export const test_baseDirSpecified = baseDirCheck(true);
export const test_baseDirNotSpecified = baseDirCheck(false);
function baseDirCheck(shouldBaseDirBeIncluded: boolean): ICompilePromise {
  return (strings, options) => {
    return new Promise((resolve, reject) => {

      const command = strings[1].replace(/\\/g,'/');

      var isBaseDirFileNameIncluded = (command.indexOf(BASE_DIR_FILE_NAME) !== -1);
      if (isBaseDirFileNameIncluded === shouldBaseDirBeIncluded) {
        resolve({
          code: 0,
          output: ""
        });
      } else {
        throw `expected ${shouldBaseDirBeIncluded ? "" : "not "}to see ${BASE_DIR_FILE_NAME} on the command line and didn't.  Got this: ${command}`;
      }
    });
  };
}
