var path = require('path'), fs = require('fs'), vm = require('vm');

var spawn = require('child_process').spawn;

var currentPath = path.resolve(".");

function resolveTypeScriptBinPath(currentPath, depth) {
    var targetPath = path.resolve(__dirname, (new Array(depth + 1)).join("../../"), "../node_modules/typescript/bin");
    if (path.resolve(currentPath, "node_modules/typescript/bin").length > targetPath.length) {
        return;
    }
    if (fs.existsSync(path.resolve(targetPath, "typescript.js"))) {
        return targetPath;
    }

    return resolveTypeScriptBinPath(currentPath, ++depth);
}

function getTsc(binPath) {
    return '"' + binPath + '\\' + 'tsc" ';
}

var tsc = getTsc(resolveTypeScriptBinPath(currentPath, 0));

function compileFile(filepath) {
    var args = [tsc, filepath];

    var ls = spawn('node', args);
    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    ls.on('close', function (code) {
        console.log('child process exited with code ' + code);
    });

    console.log("hey".green);
    console.log(args);
}

compileFile('"C:\\REPOS\\grunt-ts\\test\\fixtures\\Simple.ts"');

module.exports = function (grunt) {
    var gruntIO = function (currentPath, destPath, basePath, compSetting, outputOne) {
        var createdFiles = [];
        basePath = basePath || ".";

        return {
            getCreatedFiles: function () {
                return createdFiles;
            },
            resolvePath: path.resolve,
            readFile: function (file) {
                grunt.verbose.write('Reading ' + file + '...');
                try  {
                    var content = fs.readFileSync(file, 'utf8');

                    if (content.charCodeAt(0) === 0xFEFF) {
                        content = content.slice(1);
                    }
                    grunt.verbose.ok();
                    return content;
                } catch (e) {
                    grunt.verbose.fail("CAN'T READ");
                    throw e;
                }
            },
            dirName: path.dirname,
            createFile: function (writeFile, useUTF8) {
                var code = "";
                return {
                    Write: function (str) {
                        code += str;
                    },
                    WriteLine: function (str) {
                        code += str + grunt.util.linefeed;
                    },
                    Close: function () {
                        var created = (function () {
                            var source, type;
                            if (/\.js$/.test(writeFile)) {
                                source = writeFile.substr(0, writeFile.length - 3) + ".ts";
                                type = "js";
                            } else if (/\.js\.map$/.test(writeFile)) {
                                source = writeFile.substr(0, writeFile.length - 7) + ".ts";
                                type = "map";
                            } else if (/\.d\.ts$/.test(writeFile)) {
                                source = writeFile.substr(0, writeFile.length - 5) + ".ts";
                                type = "declaration";
                            }
                            if (outputOne) {
                                source = "";
                            }
                            return {
                                source: source,
                                type: type
                            };
                        })();
                        if (code.trim().length < 1) {
                            return;
                        }
                        if (!outputOne) {
                            var g = path.join(currentPath, basePath);
                            writeFile = writeFile.substr(g.length);
                            writeFile = path.join(currentPath, destPath ? destPath.toString() : '', writeFile);
                        }
                        grunt.file.write(writeFile, code);
                        created.dest = writeFile;
                        createdFiles.push(created);
                    }
                };
            },
            findFile: function (rootPath, partialFilePath) {
                var file = path.join(rootPath, partialFilePath);
                while (true) {
                    if (fs.existsSync(file)) {
                        try  {
                            var content = grunt.file.read(file);

                            if (content.charCodeAt(0) === 0xFEFF) {
                                content = content.slice(1);
                            }
                            return {
                                content: content,
                                path: file
                            };
                        } catch (err) {
                        }
                    } else {
                        var parentPath = path.resolve(rootPath, "..");
                        if (rootPath === parentPath) {
                            return null;
                        } else {
                            rootPath = parentPath;
                            file = path.resolve(rootPath, partialFilePath);
                        }
                    }
                }
            },
            directoryExists: function (path) {
                return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
            },
            fileExists: function (path) {
                return fs.existsSync(path);
            },
            stderr: {
                Write: function (str) {
                    grunt.log.error(str);
                },
                WriteLine: function (str) {
                    grunt.log.error(str);
                },
                Close: function () {
                }
            }
        };
    }, pluralizeFile = function (n) {
        if (n === 1) {
            return "1 file";
        }
        return n + " files";
    }, prepareSourceMapPath = function (currentPath, options, createdFiles) {
        var useFullPath = options.fullSourceMapPath;

        if (!options.sourcemap) {
            return;
        }

        createdFiles.filter(function (item) {
            return item.type === "map" || (useFullPath && item.type == "js");
        }).forEach(function (item) {
            var mapOpj, lines, sourceMapLine;
            if (item.type === "map") {
                mapObj = JSON.parse(grunt.file.read(item.dest));
                mapObj.sources.length = 0;
                mapObj.sources.push(path.relative(path.dirname(item.dest), item.source).replace(/\\/g, "/"));
                if (useFullPath) {
                    mapObj.file = "file:///" + (item.dest.substr(0, item.dest.length - 6) + "js").replace(/\\/g, "/");
                }
                grunt.file.write(item.dest, JSON.stringify(mapObj));
            } else if (useFullPath && item.type === "js") {
                lines = grunt.file.read(item.dest).split(grunt.util.linefeed);
                sourceMapLine = lines[lines.length - 2];
                if (/^\/\/@ sourceMappingURL\=.+\.js\.map$/.test(sourceMapLine)) {
                    lines[lines.length - 2] = "//@ sourceMappingURL=file:///" + item.dest.replace(/\\/g, "/") + ".map";
                    grunt.file.write(item.dest, lines.join(grunt.util.linefeed));
                }
            }
        });
    };

    grunt.registerMultiTask('ts', 'Compile TypeScript files', function () {
        var that = this;

        this.files.forEach(function (f) {
            var dest = f.dest, options = that.options(), extension = that.data.extension, files = [];

            grunt.file.expand(f.src).forEach(function (filepath) {
                if (filepath.substr(-5) === ".d.ts") {
                    return;
                }
                files.push(filepath);
            });

            for (key in files) {
                var tmp = [files[key]];
                compile(tmp, dest, grunt.util._.clone(options), extension);
            }

            if (grunt.task.current.errorCount) {
                return false;
            }
        });

        if (grunt.task.current.errorCount) {
            return false;
        }
    });

    var compile = function (srces, destPath, options, extension) {
        var basePath = options.base_path, typeScriptBinPath = resolveTypeScriptBinPath(currentPath, 0), typeScriptPath = path.resolve(typeScriptBinPath, "typescript.js"), libDPath = path.resolve(typeScriptBinPath, "lib.d.ts"), outputOne = !!destPath && path.extname(destPath) === ".js";

        if (!typeScriptBinPath) {
            grunt.fail.warn("typescript.js not found. please 'npm install typescript'.");
            return false;
        }

        var code = grunt.file.read(typeScriptPath);
        vm.runInThisContext(code, typeScriptPath);

        var setting = new TypeScript.CompilationSettings();
        var io = gruntIO(currentPath, destPath, basePath, setting, outputOne);
        var env = new TypeScript.CompilationEnvironment(setting, io);
        var resolver = new TypeScript.CodeResolver(env);

        if (options) {
            if (options.target) {
                var target = options.target.toLowerCase();
                if (target === 'es3') {
                    setting.codeGenTarget = TypeScript.CodeGenTarget.ES3;
                } else if (target == 'es5') {
                    setting.codeGenTarget = TypeScript.CodeGenTarget.ES5;
                }
            }
            if (options.style) {
                setting.setStyleOptions(options.style);
            }
            if (options.module) {
                var module = options.module.toLowerCase();
                if (module === 'commonjs' || module === 'node') {
                    TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
                } else if (module === 'amd') {
                    TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
                }
            }
            if (options.sourcemap) {
                setting.mapSourceFiles = options.sourcemap;
            }
            if (outputOne && options.fullSourceMapPath) {
                setting.emitFullSourceMapPath = options.fullSourceMapPath;
            }
            if (options.declaration_file || options.declaration) {
                setting.generateDeclarationFiles = true;
                if (options.declaration_file) {
                    grunt.log.writeln("'declaration_file' option now obsolate. use 'declaration' option".yellow);
                }
            }
            if (options.comments) {
                setting.emitComments = true;
            }
        }
        if (outputOne) {
            destPath = path.resolve(currentPath, destPath);
            setting.outputOption = destPath;
        }

        var units = [
            {
                fileName: libDPath,
                code: grunt.file.read(libDPath)
            }
        ];
        var compiler = new TypeScript.TypeScriptCompiler(io.stderr, new TypeScript.NullLogger(), setting), resolutionDispatcher = {
            postResolutionError: function (errorFile, line, col, errorMessage) {
                io.stderr.Write(errorFile + "(" + line + "," + col + ") " + (errorMessage == "" ? "" : ": " + errorMessage));
                compiler.errorReporter.hasErrors = true;
            },
            postResolution: function (path, code) {
                if (!units.some(function (u) {
                    return u.fileName === path;
                })) {
                    units.push({ fileName: path, code: code.content });
                }
            }
        };

        srces.forEach(function (src) {
            resolver.resolveCode(path.resolve(currentPath, src), "", false, resolutionDispatcher);
            console.log('here5');
        });

        compiler.setErrorOutput(io.stderr);
        if (setting.emitComments) {
            compiler.emitCommentsToOutput();
        }
        units.forEach(function (unit) {
            try  {
                if (!unit.code) {
                    unit.code = grunt.file.read(unit.fileName);
                }
                compiler.addUnit(unit.code, unit.fileName, false);
            } catch (err) {
                compiler.errorReporter.hasErrors = true;
                io.stderr.WriteLine(err.message);
            }
        });
        compiler.typeCheck();
        if (compiler.errorReporter.hasErrors) {
            return false;
        }
        compiler.emit(io);

        compiler.emitDeclarations();
        if (compiler.errorReporter.hasErrors) {
            return false;
        }

        if (!outputOne) {
            prepareSourceMapPath(currentPath, options, io.getCreatedFiles());
        }
        var result = { js: [], m: [], d: [], other: [] };
        io.getCreatedFiles().forEach(function (item) {
            if (item.type === "js")
                result.js.push(item.dest); else if (item.type === "map")
                result.m.push(item.dest); else if (item.type === "declaration")
                result.d.push(item.dest); else
                result.other.push(item.dest);
        });
        var resultMessage = "js: " + pluralizeFile(result.js.length) + ", map: " + pluralizeFile(result.m.length) + ", declaration: " + pluralizeFile(result.d.length);
        if (outputOne) {
            if (result.js.length > 0) {
                grunt.log.writeln("File " + (result.js[0]).cyan + " created.");
            }
            grunt.log.writeln(resultMessage);
        } else {
            grunt.log.writeln(pluralizeFile(io.getCreatedFiles().length).cyan + " created. " + resultMessage);
        }
        return true;
    };
};
