/// <reference path="../defs/grunt.d.ts"/>

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

// Just annoying: 
interface String {
    endsWith(suffix: string): boolean;
}
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

module.exports = function (grunt: IGrunt) {

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

    // used to make sure string ends with a slash 
    function endWithSlash(path: string): string {
        var lastchar = path[path.length - 1];
        if (lastchar != '/' && lastchar != '\\') {
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


            // Create a reference file 
            var reference = target.reference;
            if (!!reference) {
                reference = endWithSlash(reference); // probably not required
                var contents = [];
                target.src.forEach((filename: string) => {
                    // do not add a reference to reference: 
                    if (filename.indexOf('reference.ts') == -1)
                        contents.push('/// <reference path="' + path.relative(reference, filename).split('\\').join('/') + '" />')
                });
                fs.writeFileSync(reference + '/reference.ts', contents.join(eol));
            }

            // Compiles all the files 
            function runCompilation(files) {
                var result = compileAllFiles(files, target, options);
                if (result.code != 0) {
                    var msg = "Compilation failed"/*+result.output*/;
                    grunt.log.error(msg.red);
                    success = false;
                }
                else {
                    grunt.log.writeln((files.length + ' typescript files successfully processed.').green);
                }
            }
            runCompilation(target.src);

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
                function handleFileEvent(event: string, filepath: string, displaystr: string) {
                    // Ignore the special case for generated out.d.ts :)                     
                    if (target.out && filepath.endsWith('.d.ts')) {
                        return;
                    }
                    if (!filepath.endsWith('.ts')) { // should not happen
                        return;
                    }

                    // console.log(gaze.watched()); // debug gaze 

                    grunt.log.writeln((displaystr+' >>' + filepath + ' was ' + event).yellow);
                    grunt.log.writeln('Compiling.'.yellow);
                    //runCompilation([filepath]); // Potential optimization, But we want the whole project to be compilable                    

                    // Reexpand the original file glob: 
                    var files = grunt.file.expand(currenttask.data.src);

                    // compile 
                    runCompilation(files);
                }

                // A file has been added/changed/deleted has occurred
                watcher.on('add', function (path) { handleFileEvent('added', path,'+++'); })
                    .on('change', function (path) { handleFileEvent('changed', path,'###'); })
                    .on('unlink', function (path) { handleFileEvent('removed', path,'---'); })
                    .on('error', function (error) { console.error('Error happened', error); });
            }
        });

        if (!watch)
            return success;
    });
};
