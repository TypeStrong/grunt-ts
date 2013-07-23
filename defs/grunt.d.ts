// What grunt adds to stirng 
interface String {
    yellow: any;
    cyan: any;
    green: any;
    red: any;
}


////////////////
// Main Grunt object 
// http://gruntjs.com/api/grunt
////////////////
interface IGrunt {
    // Config
    config: IGruntConfigObject;
    initConfig(config?: IGruntConfig);


    // Tasks
    task: any;
    // Creating
    registerTask: Function;
    registerMultiTask: Function;
    renameTask: Function;
    // Loading
    loadTasks: Function;
    loadNpmTasks: Function;

    // Errors
    warn: Function;
    fatal: Function;

    // Misc: 
    package: any;
    version: any;

    // File
    file: IGruntFileObject;

    // Event
    event: any;
    // Fail
    fail: any;
    // Log
    log: {
        writeln: (msg: string) => void; // green msg 
        error: (msg: string) => void; // error msg 
    };
    // Options
    option: any;
    // Template
    template: any;
    // Util
    util: any;
}

////////////////
/// Grunt Config object
/// http://gruntjs.com/api/grunt.config#accessing-config-data
////////////////
interface IGruntConfigObject {
    (...param: any[]): any;
    init: (config?: IGruntConfig) => void;
    get: Function;
    process: Function;
    getRaw: Function;
    set: Function;
    escape: (propString: string) => void;
    requires: Function;
}

////////////////
// Grunt File object
// http://gruntjs.com/api/grunt.file
////////////////
interface IGruntFileObjectOptionsSimple {
    encoding?: string;
}
interface IGruntFileObjectOptions extends IGruntFileObjectOptionsSimple {
    process?: Function;
    noProcess?: any;
}
interface IGruntFileObject {

    // Character encoding
    defaultEncoding: string;

    // Reading and writing
    read(filepath, options?: IGruntFileObjectOptionsSimple);
    readJSON(filepath, options?: IGruntFileObjectOptionsSimple);
    readYAML(filepath, options?: IGruntFileObjectOptionsSimple);
    write(filepath, contents, options?: IGruntFileObjectOptionsSimple);
    copy(srcpath, destpath, options?: IGruntFileObjectOptions);
    delete(filepath, options?: { force?: bool; });

    // Directories
    mkdir(dirpath, mode?);
    recurse(rootdir, callback);

    // Globbing patterns
    expand(patterns);
    expand(options, patterns);
    expandMapping(patterns, dest, options?);
    match(patterns, filepaths);
    match(options, patterns, filepaths);
    isMatch(patterns, filepaths): bool;
    isMatch(options, patterns, filepaths): bool;

    // file types
    exists(...paths: any[]);
    isLink(...paths: any[]);
    isDir(...paths: any[]);
    isFile(...paths: any[]);

    // paths
    isPathAbsolute(...paths: any[]);
    arePathsEquivalent(...paths: any[]);
    isPathCwd(...paths: any[]);
    setBase(...paths: any[]);

    // External libraries
    glob: any;
    minimatch: any;
    findup: any;
}


////////////////
/// Globally called export function module.exports
////////////////
declare var module: {
    exports(grunt: IGrunt): void;
}


////////////////
/// To add plugins update the IGruntConfig using open ended interface syntax
////////////////
interface IGruntConfig {
    pkg?: any;
}