
interface ITargetOptions {
    src: string[]; // input files  // Note : this is a getter and returns a new "live globbed" array 
    dest?: string;
    files: {
        src: string[];
        dest: string;
    }[];
    reference: string; // path to a reference.ts e.g. './approot/'
    out: string; // if sepecified e.g. 'single.js' all output js files are merged into single.js using tsc --out command     
    outDir: string; // if sepecified e.g. '/build/js' all output js files are put in this location
    baseDir: string; // If specified. outDir files are made relative to this. 
    html: string[];  // if specified this is used to generate typescript files with a single variable which contains the content of the html
    htmlOutDir: string; // if specified with html, the generated typescript file will be produce in the directory
    htmlOutDirFlatten: boolean; // if specified with htmlOutDir, the files will be flat in the htmlOutDir
    watch: string; // if specified watches all files in this directory for changes. 
    amdloader: string;  // if specified creates a js file to load all the generated typescript files in order using requirejs + order
    templateCache: {
        src: string[]; // if search through all the html files at this location
        dest: string;
        baseUrl: string;
    };
    vs?: string | IVisualStudioProjectSupport;
}

interface ITaskOptions {
    /** Deprecated in tsc */
    allowBool: boolean;
    /** Deprecated in tsc */
    allowImportModule: boolean;
    /** Emit declarations*/
    declaration: boolean;
    mapRoot: string;
    module: string; // amd, commonjs
    noImplicitAny: boolean;
    noResolve: boolean;
    comments: boolean; // false to remove comments
    removeComments: boolean; // true to remove comments
    sourceMap: boolean;
    sourceRoot: string;
    /** es3, es5, es6 */
    target: string;
    failOnTypeErrors: boolean;
    /** If a type error occurs, do not emit the JavaScript.  New in TypeScript 1.4.  */
    noEmitOnError: boolean;
    emitDecoratorMetadata: boolean;
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
    htmlOutDir: string;
    htmlOutDirFlatten: boolean;
}

interface IVisualStudioProjectSupport {
    project: string;
    config?: string;
    ignoreFiles?: boolean;
    ignoreSettings?: boolean;
}
