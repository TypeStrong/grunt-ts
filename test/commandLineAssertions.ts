/// <reference path="../defs/tsd.d.ts"/>
/// <reference path="../tasks/modules/interfaces.d.ts"/>
/// <reference path="../defs/csproj2ts/csproj2ts.d.ts" />


export var decoratorMetadataPassed : ICompilePromise = (strings, options) => {
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

export var decoratorMetadataNotPassed : ICompilePromise = (strings, options) => {
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

export var variablesReplacedForTSConfig : ICompilePromise = (strings, options) => {
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

export var tsconfig_passThrough_onlySendsConfigThrough_WithPathAndAdditional : ICompilePromise = (strings, options) => {
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

export var tsconfig_passThrough_onlySendsConfigThrough_WithoutPath : ICompilePromise = (strings, options) => {
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

export var variablesReplacedFor_vs : ICompilePromise = (strings, options) => {
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

export var experimentalDecoratorsPassed: ICompilePromise = (strings, options) => {
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

export var noEmitPassed : ICompilePromise = (strings, options) => {
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


export var noEmitNotPassed : ICompilePromise = (strings, options) => {
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


export var inlineSourcesPassed : ICompilePromise = (strings, options) => {
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

export var inlineSourcesAndInlineSourceMapPassed: ICompilePromise = (strings, options) => {
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

export var inlineSourceMapPassedWithSourceMap: ICompilePromise = (strings, options) => {
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

export var inlineSourcesNotPassed : ICompilePromise = (strings, options) => {
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

export var vsproj_test : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.sourceMap === true &&
        options.removeComments === false &&
        options.module === 'commonjs' &&
        options.CompilationTasks[0].outDir === 'test/vsproj/vsproj_test') {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected sourceMap === true, removeComments===" +
      "false, module===commonjs, outDir===vsproj_test.  Was " +
        JSON.stringify([options.sourceMap,
        options.removeComments, options.module, options.CompilationTasks[0].outDir]);
  });
};

export var vsproj_test_config : ICompilePromise = (strings, options) => {
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

export var param_newLine_CRLF: ICompilePromise = (strings, options) => {
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

export var param_newLine_LF: ICompilePromise = (strings, options) => {
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

export var files_testFilesUsedWithDestAsAFolder: ICompilePromise = (strings, options) => {
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

export var files_testFilesUsedWithDestAsAFile: ICompilePromise = (strings, options) => {
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

export var test_systemJS: ICompilePromise = (strings, options) => {
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

export var test_umd: ICompilePromise = (strings, options) => {
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

export var test_isolatedModules: ICompilePromise = (strings, options) => {
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

export var test_noEmitHelpers: ICompilePromise = (strings, options) => {
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

export var test_additionalFlags: ICompilePromise = (strings, options) => {
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

export var bad_sourcemap_option: ICompilePromise = (strings, options) => {
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

export var out_with_spaces: ICompilePromise = (strings, options) => {
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

export var files_showWarningIfFilesIsUsedWithSrcOrOut: ICompilePromise = (strings, options) => {
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

export var files_showWarningIfFilesIsUsedWithSrcOrOutDir: ICompilePromise = (strings, options) => {
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

export var files_showWarningIfFilesIsUsedWithVs: ICompilePromise = (strings, options) => {
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
    throw `expected to see TypeScript files in multifile/b, but not multifile/a.  Also, expected ` +
      `a warning about using src with files.`;
  });
};
