/// <reference path="../defs/tsd.d.ts"/>
/// <reference path="../tasks/modules/interfaces.d.ts"/>
/// <reference path="../defs/csproj2ts/csproj2ts.d.ts" />


export var decoratorMetadataPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.emitDecoratorMetadata === true) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected emitDecoratorMetadata === true";
  });
};

export var decoratorMetadataNotPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.emitDecoratorMetadata === false) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected emitDecoratorMetadata === false";
  });
};

export var noEmitPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.noEmit === true) {
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
    if (options.task.noEmit === false) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected noEmit === false";
  });
};


export var inlineSourcesPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.inlineSources === true && options.task.sourceMap === true) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected inlineSourcesPassed and sourceMap true";
  });
};

export var inlineSourcesNotPassed : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.inlineSources === false && options.task.sourceMap === false) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected inlineSourcesPassed and sourceMap false.  Was " +
      JSON.stringify([options.task.inlineSources,options.task.sourceMap]);
  });
};

export var vsproj_test : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.sourceMap === true &&
        options.task.removeComments === false &&
        options.task.module === 'commonjs' &&
        options.target.outDir.indexOf('vsproj_test') >= 0) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected sourceMap === true, removeComments===" +
      "false, module===commonjs, outDir===vsproj_test.  Was " +
        JSON.stringify([options.task.sourceMap,
        options.task.removeComments, options.task.module, options.target.outDir]);
  });
};

export var vsproj_test_config : ICompilePromise = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.sourceMap === false &&
        options.task.removeComments === true &&
        options.target.outDir.indexOf('vsproj_test_config') >= 0) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected sourceMap === false, removeComments===" +
      "true, outDir contains vsproj_test_config.  Was " +
        JSON.stringify([options.task.sourceMap,
        options.task.removeComments, options.target.outDir]);
  });
};
