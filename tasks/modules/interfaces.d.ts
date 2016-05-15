
interface IGruntTargetOptions extends ITargetOptions {
    out?: string; // if sepecified e.g. 'single.js' all output js files are merged into single.js using tsc --out command
    outDir?: string; // if sepecified e.g. '/build/js' all output js files are put in this location
}

interface ITargetOptions {
    reference?: string; // path to a reference.ts e.g. './approot/'
    baseDir?: string; // If specified. outDir files are made relative to this.
    html: string[];  // if specified this is used to generate typescript files with a single variable which contains the content of the html
    htmlOutDir: string; // if specified with html, the generated typescript file will be produce in the directory
    htmlOutDirFlatten?: boolean; // if specified with htmlOutDir, the files will be flat in the htmlOutDir
    watch: string; // if specified watches all files in this directory for changes.
    amdloader: string;  // if specified creates a js file to load all the generated typescript files in order using requirejs + order
    templateCache?: {
        src: string[]; // if search through all the html files at this location
        dest: string;
        baseUrl: string;
    };
    testExecute?: (args: string[]) => Promise<ICompileResult>;
    vs?: string | IVisualStudioProjectSupport;
    tsconfig?: boolean | string | ITSConfigSupport;
    targetName?: string;
    options?: ITaskOptions;
}

interface ITaskOptions {
    /** Deprecated in tsc */
    allowBool: boolean;
    /** Deprecated in tsc */
    allowImportModule: boolean;
    /** Emit declarations*/
    declaration: boolean;
    emitDecoratorMetadata: boolean;
    experimentalDecorators: boolean;
    mapRoot: string;
    /** amd | commonjs | umd | system | es6 | es2015  */
    module: string;
    noImplicitAny: boolean;
    noResolve: boolean;
    /** false to remove comments */
    comments: boolean;
    /** true to remove comments */
    removeComments: boolean;
    sourceMap: boolean;
    sourceRoot: string;
    /** es3, es5, es6 */
    target: string;
    failOnTypeErrors: boolean;
    /** If a type error occurs, do not emit the JavaScript.  New in TypeScript 1.4.  */
    noEmitOnError: boolean;
    /** Const enums will be kept as enums in the emitted JS. If false, the enum values will
     * look like magic numbers with a comment in the emitted JS. */
    preserveConstEnums: boolean;
    /** Allows access to properties of an object by string indexer when --noImplicitAny is
     * active, even if TypeScript doesn't know about them. */
    suppressImplicitAnyIndexErrors: boolean;
    verbose: boolean;
    compile: boolean;
    fast: string; // never | always | watch (default)
    compiler: string; // If you want, the path to a custom TypeScript compiler's main JS file
    htmlOutputTemplate: string; // If you want you can specify your own template against which the HTML will be generated
    htmlModuleTemplate: string;
    htmlVarTemplate: string;
    noEmit: boolean;
    inlineSourceMap: boolean;
    inlineSources: boolean;
    /** Specifies the end of line sequence to be used when emitting files: 'CRLF' (dos) or 'LF' (unix). */
    newLine: string;
    /** Makes cases that break single-file transpilation an error. */
    isolatedModules: boolean;
    /** If true, will not generate custom helper functions like  __extends in compiled output. */
    noEmitHelpers: boolean;
    /** Represents a string literal to pass to compiler */
    additionalFlags: string;
    /** Specify JSX code generation style: 'preserve' or 'react' */
    jsx: string;
    /** Specifies module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */
    moduleResolution: string;
    /** Enables experimental support for ES7 async functions */
    experimentalAsyncFunctions: string;
    /** Sepecifies the root directory of input files.  Use to control the output directory structure with --outDir. */
    rootDir: string;
    /** grunt-ts setting to emit events in Grunt */
    emitGruntEvents: boolean;
    /** noLib - do not auto-include the lib.d.ts file in the compilation context */
    noLib: boolean;
    /** emitBOM - indicates if emitted files should include a Byte Order Mark */
    emitBOM: boolean;
    /** locale - pass a culture string like "en" or "ja-jp" for locale-specific error messages (requires error file in same folder as tsc) */
    locale: string;
    /** Disables strict object literal assignment checking */
    suppressExcessPropertyErrors: boolean;
    /** Does not emit objects marked as internal */
    stripInternal: boolean;
    /** Assumes a defalt export as the whole module if one is not specified, or as the only export if only one export is specified */
    allowSyntheticDefaultImports: boolean;
    /** Specifies the object invoked for createElement and __spread when targeting 'react' JSX emit. */
    reactNamespace: string;
    /** Treat a file as a default lib if it has '/// <reference no-default-lib="true"/> at the top */
    skipDefaultLibCheck: boolean;
    /** Stylize errors and messages using color and context. */
    pretty: boolean;
    /** Do not report errors on unused labels. */
    allowUnusedLabels: boolean;
    /** Report error when not all code paths in function return a value. */
    noImplicitReturns: boolean;
    /** Report errors for fallthrough cases in switch statement. */
    noFallthroughCasesInSwitch: boolean;
    /** Do not report errors on unreachable code. */
    allowUnreachableCode: boolean;
    /** Disallow inconsistently-cased references to the same file. */
    forceConsistentCasingInFileNames: boolean;
    /** Allow JavaScript files to be compiled. */
    allowJs: boolean;
    /** Do not emit  "use strict"  directives in module output. */
    noImplicitUseStrict: boolean;
}

interface IVisualStudioProjectSupport {
    project: string;
    config?: string;
    ignoreFiles?: boolean;
    ignoreSettings?: boolean;
}

interface ICompileResult {
    code: number;
    output: string;
    fileCount?: number;
}

interface ICompilePromise {
  (args: string[], options? : IGruntTSOptions) : Promise<ICompileResult>;
}

interface IGruntTSOptions extends ITaskOptions, ITargetOptions {
  CompilationTasks?: IGruntTSCompilationInfo[];
  warnings: string[];
  errors: string[];
}

interface IGruntTSCompilationInfo extends grunt.file.IFilesConfig {
  outDir?: string;
  out?: string;
  src?: string[];
  glob?: string[];
}

declare module 'strip-bom' {
  var stripBom: (content: string) => string;
  export = stripBom;
}

interface ITSConfigSupport {
  tsconfig?: string;
  ignoreSettings?: boolean;
  overwriteFilesGlob?: boolean;
  updateFiles?: boolean;
  passThrough?: boolean;
}

interface ITSConfigFile {
    compilerOptions?: ICompilerOptions;
    files?: string[];
    exclude?: string[];
    filesGlob?: string[];
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
    experimentalDecorators?: boolean;
    emitDecoratorMetadata?: boolean;
    help?: boolean;
    isolatedModules?: boolean;
    inlineSourceMap?: boolean;
    inlineSources?: boolean;
    jsx?: string;
    locale?: string;
    mapRoot?: string;
    module?: string;
    moduleResolution: string;
    newLine?: string;
    noEmit?: boolean;
    noEmitHelpers?: boolean;
    noEmitOnError?: boolean;
    noErrorTruncation?: boolean;
    noImplicitAny?: boolean;
    noLib?: boolean;
    noLibCheck?: boolean;
    noResolve?: boolean;
    out?: string;
    outFile?: string;
    outDir?: string;
    preserveConstEnums?: boolean;
    removeComments?: boolean;
    rootDir?: string;
    sourceMap?: boolean;
    sourceRoot?: string;
    suppressImplicitAnyIndexErrors?: boolean;
    target?: string;
    version?: boolean;
    watch?: boolean;
}
