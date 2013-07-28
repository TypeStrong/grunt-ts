/// <reference path="../defs/grunt/grunt.d.ts"/>
/// <reference path="../defs/underscore/underscore.d.ts"/>

/*
 * grunt-ts
 * Licensed under the MIT license.
 */


declare var require;
declare var __dirname;
declare var mapObj;
declare var key;

interface ICompileResult {
    code: number;
    output: string;
}

interface ITargetOptions {
    src: string[]; // input files  // Note : this is a getter and returns a new "live globbed" array 
    reference: string; // path to a reference.ts e.g. './approot/'
    out: string; // if sepecified e.g. 'single.js' all output js files are merged into single.js using tsc --out command 
    watch: string; // if specified e.g. './appdir/' will watch the directory for changes. Note that specifing this makes the grunt task async (i.e. it keep running)
}

interface ITaskOptions {
    target: string; // es3 , es5 
    module: string; // amd, commonjs 
    sourcemap: boolean;
    declaration: boolean;
    nolib: boolean;
    comments: boolean;
}


// Typescript imports 
import _ = require("underscore");

function pluginFn(grunt: IGrunt) {

    // plain vanilla imports
    var path = require('path'),
        fs = require('fs'),
        vm = require('vm'),
        shell = require('shelljs'),
        eol = require('os').EOL;


    function resolveTypeScriptBinPath(currentPath, depth): string {
        var targetPath = path.resolve(__dirname,
            (new Array(depth + 1)).join("../../"),
            "../node_modules/typescript/bin");
        if (path.resolve(currentPath, "node_modules/typescript/bin").length > targetPath.length) {
            return;
        }
        if (fs.existsSync(path.resolve(targetPath, "typescript.js"))) {
            return targetPath;
        }

        return resolveTypeScriptBinPath(currentPath, ++depth);
    }

    function getTsc(binPath: string): string {
        return '"' + binPath + '/' + 'tsc" ';
    }

    var exec = shell.exec;
    var cwd = path.resolve(".");
    var tsc = getTsc(resolveTypeScriptBinPath(cwd, 0));

    function compileAllFiles(files: string[], target: ITargetOptions, task: ITaskOptions): ICompileResult {

        var filepath: string = files.join(' ');
        var cmd = 'node ' + tsc + ' ' + filepath;

        // boolean options 
        if (task.sourcemap)
            cmd = cmd + ' --sourcemap';
        if (task.declaration)
            cmd = cmd + ' --declaration';
        if (task.nolib)
            cmd = cmd + ' --nolib';
        if (task.comments)
            cmd = cmd + ' --comments';

        // string options
        cmd = cmd + ' --target ' + task.target.toUpperCase();
        cmd = cmd + ' --module ' + task.module.toLowerCase();

        // Target options: 
        if (target.out) {
            cmd = cmd + ' --out ' + target.out;
        }
        var result = exec(cmd);
        return result;
    }

    // Useful string functions 
    // used to make sure string ends with a slash 
    function endsWith(str: string, suffix: string) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };
    function endWithSlash(path: string): string {
        if (!endsWith(path, '/') && !endsWith(path, '\\')) {
            return path + '/';
        }
        return path;
    }


    grunt.registerMultiTask('ts', 'Compile TypeScript files', function () {

        var currenttask: ITask = this;

        // setup default options 
        var options = currenttask.options<ITaskOptions>({
            module: 'commonjs',
            target: 'es3',
            declaration: false,
            sourcemap: true,
            nolib: false,
            comments: false
        });

        // Was the whole process successful
        var success = true;
        var watch;

        // Some interesting logs: 
        //http://gruntjs.com/api/inside-tasks#inside-multi-tasks
        //console.log(this)
        //console.log(this.files[0]); // An array of target files ( only one in our case )
        //console.log(this.files[0].src); // a getter for a resolved list of files 
        //console.log(this.files[0].orig.src); // The original glob / array / !array / <% array %> for files. Can be very fancy :) 

        // this.files[0] is actually a single in our case as we gave examples of  one source / out per target
        this.files.forEach(function (target: ITargetOptions) {


            // Create a reference file? 
            var reference = target.reference;
            var referenceFile;
            var referencePath;
            if (!!reference) {
                referencePath = path.resolve(reference);
                referenceFile = path.resolve(referencePath, 'reference.ts');
            }
            function isReferenceFile(filename: string) {
                return path.resolve(filename) == referenceFile;
            }

            // Create an output file? 
            var out = target.out;
            var outFile;
            var outFile_d_ts;
            if (!!out) {
                outFile = path.resolve(out);
                outFile_d_ts = outFile.replace('.js', '.d.ts');
            }
            function isOutFile(filename: string): boolean {
                return path.resolve(filename) == outFile_d_ts;
            }

            // Compiles all the files 
            function runCompilation(files) {
                grunt.log.writeln('Compiling.'.yellow);

                // TODO: Idea: Customize the targets based on file contents

                // Time the task and go 
                var starttime = new Date().getTime();

                // Create a reference file if specified
                if (!!referencePath) {
                    var contents = [];
                    files.forEach((filename: string) => {
                        contents.push('/// <reference path="' + path.relative(referencePath, filename).split('\\').join('/') + '" />');
                    });
                    fs.writeFileSync(referenceFile, contents.join(eol));
                }

                // Compile all the files
                var result = compileAllFiles(files, target, options);
                if (result.code != 0) {
                    var msg = "Compilation failed"/*+result.output*/;
                    grunt.log.error(msg.red);
                    success = false;
                }
                else {
                    var endtime = new Date().getTime();
                    var time = (endtime - starttime) / 1000;
                    grunt.log.writeln(('Success: ' + time.toFixed(2) + 's for ' + files.length + ' typescript files').green);
                }
            }           

            var debouncedCompile = _.debounce(() => {
                // Reexpand the original file glob: 
                var files = grunt.file.expand(currenttask.data.src);

                // Clear the files of output.d.ts and reference.ts 
                files = _.filter(files, (filename) => {
                    return (!isReferenceFile(filename) && !isOutFile(filename));
                });

                // compile 
                runCompilation(files);
            }, 150); // randomly 150 as chokidar looks at file system every 100ms 

            // Initial compilation: 
            debouncedCompile();

            // Watches all the files 
            watch = target.watch;
            if (!!watch) {
                // get path                
                watch = path.resolve(watch);

                // make async 
                var done = currenttask.async();

                var watchpath = watch;
                grunt.log.writeln(('Watching all Typescript files under : ' + watchpath).cyan);

                // create a gaze instance for path 
                var chokidar = require('chokidar');
                var watcher = chokidar.watch(watchpath, { ignoreInitial: true, persistent: true });                

                // local event to handle file event 
                function handleFileEvent(filepath: string, displaystr: string) {
                    // Ignore the special cases for files we generate
                    if (isOutFile(filepath) || isReferenceFile(filepath)) {
                        return;
                    }
                    if (!endsWith(filepath, '.ts')) { // should not happen
                        return;
                    }

                    grunt.log.writeln((displaystr + ' >>' + filepath).yellow);
                    debouncedCompile();
                }

                // A file has been added/changed/deleted has occurred
                watcher.on('add', function (path) { handleFileEvent(path, '+++ added  '); })
                    .on('change', function (path) { handleFileEvent(path, '### changed'); })
                    .on('unlink', function (path) { handleFileEvent(path, '--- removed'); })
                    .on('error', function (error) { console.error('Error happened', error); });
            }
        });

        if (!watch)
            return success;
    });
};
export = pluginFn;