
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
    /** Represents a string literal to pass to compiler */
    additionalFlags: string;
    /** Deprecated in tsc */
    allowBool: boolean;
    /** Deprecated in tsc */
    allowImportModule: boolean;
    /** Allow JavaScript files to be compiled. */
    allowJs: boolean;
    /** Assumes a defalt export as the whole module if one is not specified, or as the only export if only one export is specified */
    allowSyntheticDefaultImports: boolean;
    /** Do not report errors on unreachable code. */
    allowUnreachableCode: boolean;
    /** Do not report errors on unused labels. */
    allowUnusedLabels: boolean;
    /** Parse in strict mode and emit "use strict" for each source file */
    alwaysStrict: boolean;
    /** Base directory to resolve non-relative module names */
    baseUrl: string;
    /** The character set of the input files. */
    charset: string;
    /** Report errors in .js/.jsx files. */
    checkJs: boolean;
    /** false to remove comments */
    comments: boolean;
    /** grunt-ts specific setting */
    compile: boolean;
    /** grunt-ts specific setting - the path to a custom TypeScript compiler's main JS file */
    compiler: string;
    /** Emit declarations */
    declaration: boolean;
    /** Output directory for generated declaration files. */
    declarationDir: string;
    /** Show diagnostic information. */
    diagnostics: boolean;
    /** Disable size limitation on JavaScript project. */
    disableSizeLimit: boolean;
    /** Provide full support for iterables when targeting ES5 or ES3. */
    downlevelIteration: boolean;
    /** emitBOM - indicates if emitted files should include a Byte Order Mark */
    emitBOM: boolean;
    emitDecoratorMetadata: boolean;
    /** grunt-ts setting to emit events in Grunt */
    emitGruntEvents: boolean;
    /** Requires default import of callable CommonJS modules but with runtime behavior like Babel or Webpack */
    esModuleInterop: boolean;
    /** Enables experimental support for ES7 async functions - required for async prior to TypeScript 2 */
    experimentalAsyncFunctions: string;
    experimentalDecorators: boolean;
    /** grunt-ts specific setting to fail Grunt pipeline when a type error is raised by TypeScript. */
    failOnTypeErrors: boolean;
    /** grunt-ts specific setting - never | always | watch (default) */
    fast: string;
    /** grunt-ts specific setting - never cached files regex */
    forceCompileRegex: string;
    /** Disallow inconsistently-cased references to the same file. */
    forceConsistentCasingInFileNames: boolean;
    /** grunt-ts specific setting - template against which the HTML will be generated */
    htmlOutputTemplate: string;
    /** grunt-ts specific setting */
    htmlModuleTemplate: string;
    /** grunt-ts specific setting */
    htmlVarTemplate: string;
    /** Import emit helpers (e.g. __extends, __rest, etc..) from tslib */
    importHelpers: boolean;
    inlineSourceMap: boolean;
    inlineSources: boolean;
    /** Makes cases that break single-file transpilation an error. */
    isolatedModules: boolean;
    /** Specify JSX code generation style: 'preserve', 'react', or 'react-native' */
    jsx: string;
    /** Specify the JSX factory function to use when targeting react JSX emit, e.g. React.createElement or h. */
    jsxFactory: string;
    /** List of standard library files to be included in the compilation. */
    lib: string[];
    /** Print names of generated files part of the compilation. */
    listEmittedFiles: boolean;
    /** Print names of files included in the compilation context. */
    listFiles: boolean;
    /** locale - pass a culture string like "en" or "ja-jp" for locale-specific error messages (requires error file in same folder as tsc) */
    locale: string;
    /** Specifies the location where debugger should locate map files instead of generated locations. */
    mapRoot: string;
    /** The maximum dependency depth to search under node_modules and load JavaScript files. */
    maxNodeModuleJsDepth: number;
    /** amd | commonjs | umd | system | es6 | es2015 | none  */
    module: string;
    /** Specifies module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */
    moduleResolution: string;
    /** Specifies the end of line sequence to be used when emitting files: 'CRLF' (dos) or 'LF' (unix). */
    newLine: string;
    noEmit: boolean;
    /** If true, will not generate custom helper functions like  __extends in compiled output. */
    noEmitHelpers: boolean;
    /** If a type error occurs, do not emit the JavaScript.  New in TypeScript 1.4.  */
    noEmitOnError: boolean;
    /** Report errors for fallthrough cases in switch statement. */
    noFallthroughCasesInSwitch: boolean;
    noImplicitAny: boolean;
    /** Report error when not all code paths in function return a value. */
    noImplicitReturns: boolean;
    /** Raise error on this expressions with an implied 'any' type. */
    noImplicitThis: boolean;
    /** Do not emit  "use strict"  directives in module output. */
    noImplicitUseStrict: boolean;
    /** noLib - do not auto-include the lib.d.ts file in the compilation context */
    noLib: boolean;
    noResolve: boolean;
    /** Disable strict checking of generic signatures in function types. */
    noStrictGenericChecks: boolean;
    /** Report errors on unused locals. */
    noUnusedLocals: boolean;
    /** Report errors on unused parameters. */
    noUnusedParameters: boolean;
    /** Const enums will be kept as enums in the emitted JS. If false, the enum values will
     * look like magic numbers with a comment in the emitted JS. */
    preserveConstEnums: boolean;
    /** Do not resolve symlinks to their real path; treat a symlinked file like a real one. */
    preserveSymlinks: boolean;
    /** Stylize errors and messages using color and context. */
    pretty: boolean;
    /** Specifies the object invoked for createElement and __spread when targeting 'react' JSX emit. */
    reactNamespace: string;
    /** true to remove comments */
    removeComments: boolean;
    /** Sepecifies the root directory of input files.  Use to control the output directory structure with --outDir. */
    rootDir: string;
    /** Skip type checking of all declaration files (*.d.ts). */
    skipLibCheck: boolean;
    /** Treat a file as a default lib if it has '/// <reference no-default-lib="true"/> at the top */
    skipDefaultLibCheck: boolean;
    sourceMap: boolean;
    sourceRoot: string;
    /** Enable all strict type checking options. */
    strict: boolean;
    /** Enforce contravariant function parameter comparison */
    strictFunctionTypes: boolean;
    /** Enables strict null checking mode (null and undefined are not in the domain of every type) */
    strictNullChecks: boolean;
    /** Ensures each instance property is initialized before use */
    strictPropertyInitialization: boolean;
    /** Does not emit objects marked @internal in jsdoc */
    stripInternal: boolean;
    /** Disables strict object literal assignment checking */
    suppressExcessPropertyErrors: boolean;
    /** Allows access to properties of an object by string indexer when --noImplicitAny is
     * active, even if TypeScript doesn't know about them. */
    suppressImplicitAnyIndexErrors: boolean;
    /** es3, es5, es6 */
    target: string;
    /** Report module resolution log messages. */
    traceResolution: boolean;
    /** List of names of type definitions to include. */
    types: string[];
    /** List of folders to include type definitions from. */
    typeRoots: string[];
    /** grunt-ts specific setting */
    verbose: boolean;
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
  (args: string[], options?: Partial<IGruntTSOptions>): Promise<ICompileResult>;
}

interface IGruntTSOptions extends ITaskOptions, ITargetOptions {
  CompilationTasks?: IGruntTSCompilationInfo[];
  warnings: string[];
  errors: string[];
  tsCacheDir: string;
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
    include?: string[];
    filesGlob?: string[];
    /** this tsconfig overrides settings in its parent tsconfig located here */
    extends?: string;
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
    typeRoots: string[];
}
