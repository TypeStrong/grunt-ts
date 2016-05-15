'use strict';

import * as utils from './utils';
import * as _ from 'lodash';

const TypeScriptDefaults: IGruntTSOptions = {
    allowBool: false,
    allowImportModule: false,
    allowSyntheticDefaultImports: null,
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
    suppressExcessPropertyErrors: false,
    suppressImplicitAnyIndexErrors: false,
    stripInternal: false,
    noEmit: false,
    noLib: false,
    emitBOM: false,
    inlineSources: false,
    inlineSourceMap: false,
    newLine: utils.eol,
    isolatedModules: false,
    noEmitHelpers: false,
    additionalFlags: '',
    templateCache: null,
    targetName: '',
    locale: null,
    jsx: null,
    moduleResolution: null,
    experimentalAsyncFunctions: null,
    reactNamespace: null,
    skipDefaultLibCheck: null,
    pretty: false,
    allowUnusedLabels: false,
    noImplicitReturns: false,
    noFallthroughCasesInSwitch: false,
    allowUnreachableCode: false,
    forceConsistentCasingInFileNames: false,
    allowJs: false,
    noImplicitUseStrict: false,
    rootDir: null,
    warnings: [],
    errors: []
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
