'use strict';

import * as utils from './utils';

const TypeScriptDefaults: IGruntTSOptions = {
    allowBool: false,
    allowImportModule: false,
    amdloader: null,
    compile: true,
    declaration: false,
    emitDecoratorMetadata: false,
    experimentalDecorators: false,
    mapRoot: '',
    module: null,
    noImplicitAny: false,
    noResolve: false,
    comments: null,
    removeComments: null,
    sourceMap: true,
    sourceRoot: '',
    target: null,
    verbose: false,
    fast: null,
    watch: null,
    compiler: '',
    html: null,
    htmlModuleTemplate: null,
    htmlVarTemplate: null,
    htmlOutputTemplate: null,
    htmlOutDir: null,
    htmlOutDirFlatten: null,
    failOnTypeErrors: null,
    emitGruntEvents: null,
    noEmitOnError: false,
    preserveConstEnums: false,
    suppressImplicitAnyIndexErrors: false,
    noEmit: false,
    inlineSources: false,
    inlineSourceMap: false,
    newLine: utils.eol,
    isolatedModules: false,
    noEmitHelpers: false,
    additionalFlags: '',
    templateCache: null,
    targetName: '',
    jsx: null,
    moduleResolution: null,
    experimentalAsyncFunctions: null,
    rootDir: null,
    warnings: [],
    errors: []
};


export const GruntTSDefaults = applyGruntTSDefaults(TypeScriptDefaults);

function applyGruntTSDefaults(options: IGruntTSOptions) {
  options.sourceMap = true;
  options.target = 'es5';
  options.htmlModuleTemplate = '<%= filename %>';
  options.htmlVarTemplate = '<%= ext %>';
  options.htmlOutDirFlatten = false;
  options.fast = 'watch';
  options.removeComments = true;
  options.failOnTypeErrors = true;
  options.emitGruntEvents = false;
  return options;
}
