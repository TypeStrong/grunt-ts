'use strict';

import * as utils from './utils';
import * as _ from 'lodash';

const TypeScriptDefaults: IGruntTSOptions = {
    additionalFlags: '',
    allowBool: false,
    allowImportModule: false,
    allowJs: false,
    allowSyntheticDefaultImports: null,
    allowUnreachableCode: false,
    allowUnusedLabels: false,
    alwaysStrict: false,
    amdloader: null,
    baseUrl: null,
    charset: null,
    comments: null,
    compile: true,
    compiler: '',
    declaration: false,
    declarationDir: null,
    diagnostics: false,
    emitBOM: false,
    emitDecoratorMetadata: false,
    emitGruntEvents: null,
    errors: [],
    experimentalAsyncFunctions: null,
    experimentalDecorators: false,
    failOnTypeErrors: null,
    fast: null,
    forceConsistentCasingInFileNames: false,
    html: null,
    htmlModuleTemplate: null,
    htmlOutDir: null,
    htmlOutDirFlatten: null,
    htmlOutputTemplate: null,
    htmlVarTemplate: null,
    inlineSourceMap: false,
    inlineSources: false,
    importHelpers: false,
    isolatedModules: false,
    jsx: null,
    jsxFactory: null,
    lib: null,
    listEmittedFiles: false,
    listFiles: false,
    locale: null,
    mapRoot: '',
    maxNodeModuleJsDepth: null,
    module: null,
    moduleResolution: null,
    newLine: utils.eol,
    noEmit: false,
    noEmitHelpers: false,
    noEmitOnError: false,
    noFallthroughCasesInSwitch: false,
    noImplicitAny: false,
    noImplicitReturns: false,
    noImplicitThis: false,
    noImplicitUseStrict: false,
    noLib: false,
    noResolve: false,
    noUnusedLocals: false,
    noUnusedParameters: false,
    preserveConstEnums: false,
    pretty: false,
    reactNamespace: null,
    removeComments: null,
    rootDir: null,
    skipDefaultLibCheck: null,
    sourceMap: true,
    sourceRoot: '',
    strictNullChecks: false,
    stripInternal: false,
    suppressExcessPropertyErrors: false,
    suppressImplicitAnyIndexErrors: false,
    target: null,
    targetName: '',
    templateCache: null,
    traceResolution: false,
    types: null,
    typeRoots: null,
    verbose: false,
    warnings: [],
    watch: null
};


export const GruntTSDefaults = applyGruntTSDefaults(_.clone(TypeScriptDefaults));

function applyGruntTSDefaults(options: IGruntTSOptions) {
  // this function applies defaults where grunt-ts differs from TypeScript
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
