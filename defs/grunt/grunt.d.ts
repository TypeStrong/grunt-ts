// What grunt adds to string
// https://github.com/marak/colors.js/
interface String {
    yellow: string;
    cyan: string;
    white: string;
    magenta: string;
    green: string;
    red: string;
    grey: string;
    blue: string;
}


interface ITask {
    // options from user point : http://gruntjs.com/configuring-tasks#options
    // options from plugin dev point: http://gruntjs.com/api/inside-tasks#this.options
    options<T>(defaults?: T): T;
    async: () => (ret: boolean) => void;
    filesSrc: string[]; // a getter http://gruntjs.com/api/inside-tasks#inside-multi-tasks
    data: {
        src: any;
        html: any; // SPECIFIC TO GRUNT-TS         
    }
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
    task: ITask;
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
    // Options https://github.com/gruntjs/grunt/wiki/grunt.option
    option: { (key: string): any; init: Function; flags: Function };
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
    delete(filepath, options?: { force?: boolean; });

    // Directories
    mkdir(dirpath, mode?);
    recurse(rootdir, callback);

    // Globbing patterns
    expand(patterns): string[];
    expand(options, patterns): string[];
    expandMapping(patterns, dest, options?);
    match(patterns, filepaths);
    match(options, patterns, filepaths);
    isMatch(patterns, filepaths): boolean;
    isMatch(options, patterns, filepaths): boolean;

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
/// To add plugins update the IGruntConfig using open ended interface syntax
////////////////
interface IGruntConfig {
    pkg?: any;
}