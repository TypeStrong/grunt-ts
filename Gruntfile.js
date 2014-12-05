module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            test: [
                'test/**/*.js',
                'test/**/*.js.map',
                'test/**/*.html.ts',
                '.tscache/**/*',
                '!test/test.js',
                '!test/expected/**/*',
                'test/htmlOutDir/generated/test'
            ],
            testPost: [
                'src/a.js',
                'src/b.js',
                'src/c.js',
                'src/reference.js'
            ]
        },
        jshint: {
            options: grunt.util._.extend(grunt.file.readJSON('.jshintrc'), {
                reporter: './node_modules/jshint-path-reporter'
            }),
            support: ['Gruntfile.js']
        },
        tslint: {
            options: {
                configuration: grunt.file.readJSON('tslint.json'),
                formatter: 'tslint-path-formatter'
            },
            source: {
                src: ['tasks/**/*.ts']
            }
        },
        'ts-internal': {
            options: {
                target: 'es5',
                module: 'commonjs',
                comments: true,
                sourcemap: true,
                verbose: true,
                fast: 'always'
            },
            build: {
                src: ['tasks/**/*.ts']
            },
            test: {
                src: ['test/test.ts']
            }
        },
        nodeunit: {
            tests: ['test/test.js']
        },
        watch: {
            dev: {
                files: ['**/*.ts', '!**/*.d.ts'],
                tasks: ['run'],
            }
        },
        ts: {
            // Set the default options, see : http://gruntjs.com/configuring-tasks#options
            options: {
                // 'es3' (default) | 'es5'
                target: 'es3',
                // Use amd for asynchonous loading or commonjs  'amd' (default) | 'commonjs'
                module: 'commonjs',
                // Generate a source map file for each result js file (true (default) | false)
                sourcemap: true,
                // Generate a declaration .d.ts file for each resulting js file (true | false  (default))
                declaration: false,
                // ??? (true | false (default))
                nolib: false,
                // Leave comments in compiled js code (true | false (default))
                comments: false,
                // Print the tsc command (true | false (default))
                verbose: true
            },
            // A specific target
            work: {
                // The source typescript files, see : http://gruntjs.com/configuring-tasks#files
                src: ['test/work/**/*.ts'],
                // If specified, generate an out.js file which is the merged js file
                out: 'test/work/out.js',
                // Override the default options, see : http://gruntjs.com/configuring-tasks#options
                options: {
                    sourcemap: true,
                    declaration: true,
                },
            },
            simple: {
                test: true,
                options: {
                    sourcemap: true,
                    declaration: true
                },
                src: ['test/simple/ts/zoo.ts'],
                outDir: 'test/simple/js/',
            },
            multifiletest: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a/out.js' },
                    { src: ['test/multifile/b/**/*.ts'], dest: 'test/multifile/b/out.js' }],
                options: {
                    fast: 'never'
                }
            },
            files_testsingle: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a/out.js' }],
                options: {
                    fast: 'never'
                }
            },
            files_testempty: {
                test: true,
                files: [],
                options: {
                    fast: 'never'
                }
            },
            files_testMissing: {
                test: true,
                files: [{
                    src: ['test/THIS_FOLDER_DOES_NOT_EXIST/**/*.ts'],
                    dest: 'test/THIS_FOLDER_DOES_NOT_EXIST/out.js'
                }],
                options: {
                    fast: 'never'
                }
            },
            files_showWarningIfFilesIsUsedWithSrcOrOut: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a/out.js' }],
                src: ['test/multifile/b/**/*.ts'],
                out: 'test/multifile/a/out.js',
                options: {
                    fast: 'never'
                }
            },
            files_showWarningIfFilesIsUsedWithSrcOrOutDir: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a' }],
                src: ['test/multifile/b/**/*.ts'],
                outDir: 'test/multifile/a',
                options: {
                    fast: 'never'
                }
            },
            files_showWarningIfFilesIsUsedWithWatch: {
                //note this should not actually watch.
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a' }],
                watch: ['test/multifile/a/**/*.ts'],
                options: {
                    fast: 'never'
                }
            },
            files_showWarningIfFilesIsUsedWithFast: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a' }],
                options: {
                    fast: 'always'
                }
            },
            files_testFilesUsedWithDestAsAJSFile: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a/testDest.js' }],
                options: {
                    fast: 'never'
                }
            },
            files_testFilesUsedWithDestAsAFolder: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a' }],
                options: {
                    fast: 'never'
                }
            },
            files_testFilesWithMissingDest: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts']}],
                options: {
                    fast: 'never'
                }
            },
            files_testWarnIfFilesHasDestArray: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: ['test/multifile/a', 'test/multifile/b'] }],
                options: {
                    fast: 'never'
                }
            },
            files_testWarnIfFilesIsAnObjectWithSrcOnly: {
                test: true,
                files: { src: ['test/multifile/a/**/*.ts']},
                options: {
                    fast: 'never'
                }
            },
            files_testFilesObjectFormatWorks: {
                test: true,
                files: {
                    'test/multifile/a.js': ['test/multifile/a/**/*.ts'],
                    'test/multifile/b.js': ['test/multifile/b/**/*.ts']
                },
                options: {
                    fast: 'never'
                }
            },
            abtest: {
                test: true,
                src: ['test/abtest/**/*.ts'],
                reference: 'test/abtest/reference.ts',
                out: 'test/abtest/out.js',
            },
            amdloadersrc: {
                test: true,
                src: ['test/amdloader/ts/app/**/*.ts'],
                html: ['test/amdloader/ts/app/**/*.html'],
                reference: 'test/amdloader/ts/app/reference.ts',
                outDir: 'test/amdloader/js/app',
                amdloader: 'test/amdloader/js/app/loader.js',
                //  watch: 'test/amdloader/app'
            },
            amdloadertest: {
                test: true,
                src: ['test/amdloader/ts/test/**/*.ts'],
                html: ['test/amdloader/ts/test/**/*.html'],
                reference: 'test/amdloader/ts/test/reference.ts',
                outDir: 'test/amdloader/js/test',
                amdloader: 'test/amdloader/js/test/loader.js',
            },
            amdtest: {
                test: true,
                src: ['test/amdtest/**/*.ts'],
                options: {
                    module: 'amd'
                }
            },
            warnbothcomments: {
                test: true,
                src: ['test/abtest/**/*.ts'],
                reference: 'test/abtest/reference.ts',
                out: 'test/abtest/out.js',
                options: {
                    // this should cause a warning
                    comments: true,
                    removeComments: false,
                },
            },
            htmlSpecifiedButNoTypeScriptSource_ShouldWarn: {
                test: true,
                html: ['test/html/**/*.tpl.html'],
                out: 'test/html/out.js',
            },
            htmltest: {
                test: true,
                src: ['test/html/**/*.ts'],
                html: ['test/html/**/*.tpl.html'],
                reference: 'test/html/reference.ts',
                out: 'test/html/out.js',
            },
            htmlWithHtmlOutDirTest: {
                test: true,
                src: ['test/htmlOutDir/reference.ts','test/htmlOutDir/src/bar.ts',
                    'test/htmlOutDir/src/foo.ts',
                    //NOTE Not strictly necessarily based on the implementation
                    'test/htmlOutDir/generated/**/*.ts'],
                html: ['test/htmlOutDir/**/*.tpl.html'],
                reference: 'test/htmlOutDir/reference.ts',
                htmlOutDir: 'test/htmlOutDir/generated',
                out: 'test/htmlOutDir/out.js'
            },
            htmlWithFlatHtmlOutDirTest: {
                test: true,
                src: ['test/htmlOutDirFlat/reference.ts','test/htmlOutDirFlat/src/bar.ts',
                    'test/htmlOutDirFlat/src/foo.ts',
                    //NOTE Not strictly necessarily based on the implementation
                    'test/htmlOutDirFlat/generated/**/*.ts'],
                html: ['test/htmlOutDirFlat/**/*.tpl.html'],
                reference: 'test/htmlOutDirFlat/reference.ts',
                htmlOutDir: 'test/htmlOutDirFlat/generated',
                htmlOutDirFlatten: true,
                out: 'test/htmlOutDirFlat/out.js'
            },
            definitelyTypedTest: {
                test: true,
                src: ['test/definitelytypedtest/**/*.ts'],
                html: ['test/definitelytypedtest/**/*.tpl.html'],
                reference: 'test/definitelytypedtest/reference.ts',
                out: 'test/definitelytypedtest/out.js',
            },
            nocompile: {
                test: true,
                src: ['test/nocompile/**/*.ts'],
                reference: 'test/nocompile/reference.ts',
                out: 'test/nocompile/out.js',
                options: {
                    compile: false,
                }
            },
            outdirtest: {
                test: true,
                src: ['test/outdirtest/**/*.ts'],
                outDir: 'test/outdirtest/js',
            },
            sourceroottest: {
                test: true,
                src: ['test/sourceroot/src/**/*.ts'],
                html: ['test/sourceroot/src/**/*.html'],
                reference: 'test/sourceroot/src/reference.ts',
                out: 'test/sourceroot/public/js/app.js',
                options: {
                    sourceRoot: 'js',
                    mapRoot: 'map',  // assuming we move all map files with some other grunt task
                },
            },
            templatecache: {
                test: true,
                src: ['test/templatecache/**/*.ts'],
                reference: 'test/templatecache/ts/reference.ts',
                amdloader: 'test/templatecache/js/loader.js',
                outDir: 'test/templatecache/js',
                templateCache: {
                    baseUrl: 'test/templatecache/js/',
                    src: ['test/templatecache/js/**/*.html'],
                    dest: 'test/templatecache/js/templateCache.js',
                },
            },
            transform: {
                test: true,
                src: ['test/transform/ts/**/*.ts'],
                outDir: 'test/transform/js',
                options: {
                    fast: 'always'
                }
            },
            customcompiler: {
                test: true,
                src: ['test/customcompiler/ts/**/*.ts'],
                outDir: 'test/customcompiler/js',
                options: {
                    compiler: './customcompiler/tsc'
                }
            },
            fail: {
                fail: true,                  // a designed to fail target                
                src: ['test/fail/**/*.ts'],
                outDir: 'test/fail/js',
                baseDir: 'test/fail/ts',
                // watch: 'test',
                options: {                  // overide the main options for this target 
                    sourcemap: false
                }
            },
            files_testfailedcompilation: {
                fail: true,                  // a designed to fail target
                files: [{
                    src: ['test/files_testfailedcompilation/a/**/*.ts'],
                    dest: 'test/files_testfailedcompilation/a/out.js'
                },
                {
                    src: ['test/files_testfailedcompilation/b/**/*.ts'],
                    dest: 'test/files_testfailedcompilation/b/out.js'
                }],
                options: {
                    fast: 'never'
                }
            }
        }
    });

    // Helper to upgrade internal compiler task (fresh dogfood)
    // Only do this when stable!
    var lkgPath = './tasks-internal';
    grunt.registerTask('upgrade', function () {
        var done = this.async();
        var ncp = require('ncp').ncp;
        var rimraf = require('rimraf');

        rimraf(lkgPath, function (err) {
            if (!err) {
                ncp('./tasks', lkgPath, function (err) {
                    if (!err) {
                        var next = grunt.file.read('./tasks/ts.js');
                        grunt.file.delete(lkgPath + '/ts.js');

                        // change `ts` to `ts-internal`
                        var pattern = 'grunt.registerMultiTask(\'ts\',';
                        var internal = 'grunt.registerMultiTask(\'ts-internal\',';
                        if (next.indexOf(pattern) < 0) {
                            grunt.fail.warn('can\'t find task declaration-pattern: ' + pattern);
                            done(false);
                            return;
                        }
                        next = next.replace(pattern, internal);

                        // Also add header to show which version was used
                        next = '// v' + grunt.config.get('pkg.version') +
                            ' ' + new Date().toISOString() + '\r\n' + next;

                        grunt.file.write(lkgPath + '/ts-internal.js', next);
                    }
                    else {
                        console.log(err);
                        done(false);
                    }
                });
            }
            else {
                console.log(err);
                done(false);
            }
        });
    });

    // Collect test tasks
    grunt.registerTask('test_all', grunt.util._.reduce(grunt.config.get('ts'), function (memo, task, name) {
        if (task.test) {
            memo.push('ts:' + name);
        }
        return memo;
    }, []));

    // Collect test tasks
    grunt.registerTask('test_fail', grunt.util._.reduce(grunt.config.get('ts'), function (memo, task, name) {
        if (task.fail) {
            memo.push('ts:' + name);
        }
        return memo;
    }, []));

    // Loading it for testing since we have in a local 'tasks' folder 
    grunt.loadTasks('tasks');
    // in your configuration you would load this like: 
    //grunt.loadNpmTasks('grunt-ts')

    grunt.loadTasks(lkgPath); // dogfood
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-continue');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-debug-task');

    // Build
    grunt.registerTask('prep', ['clean:test', 'jshint:support']);
    grunt.registerTask('build', ['prep', 'ts-internal', 'tslint:source']);

    // Test
    grunt.registerTask('fail', ['continueOn', 'test_fail', 'continueOff']);
    grunt.registerTask('test', ['test_all', 'fail', 'nodeunit', 'clean:testPost']);

    // Release
    grunt.registerTask('release', ['build', 'test']);
    grunt.registerTask('default', ['release']);

    //////////////////////////////////////////////
    // Dev   
    //
    // `grunt dev` if using grunt watch
    // Or 
    // `grunt run` if using webstorm / manual run
    // 
    // Modify tasksToTest based on what you are working on 

    var tasksToTest = ['ts:fail', 'nodeunit'];

    grunt.registerTask('dev', ['run', 'watch']);

    grunt.registerTask('run', function () {

        // Clear the console and move to 0 0 
        // http://stackoverflow.com/a/14976765/390330
        console.log('\u001b[2J\u001b[0;0H');
        console.log('>>>>>>>>>>> Cleared console >>>>>>>>>>> \n\n'.grey);

        var done = this.async();

        // Using a simple chain of ts:internal followed by ts:yourtest would not have run the updated grunt-ts
        // We are spawn to ensure that `ts:` is reloaded after compile
        function runTask(taskName, callback) {
            grunt.util.spawn({
                cmd: 'grunt',
                args: [taskName]
            }, function (err, output) {
                if (err) {
                    console.log(output.stderr || output.stdout);
                    done(err);
                }
                else {
                    console.log(output.stdout);
                    console.log('\n'); // looks better
                    callback();
                }
            });
        }

        // Add build task
        tasksToTest.unshift('ts-internal:build');

        // Now execute
        var currentIndex = 0;
        function getNextTaskFunction() {
            currentIndex++;
            if (currentIndex === tasksToTest.length) {
                return done;
            }
            else {
                return function () {
                    runTask(tasksToTest[currentIndex], getNextTaskFunction());
                };
            }
        }
        runTask(tasksToTest[0], getNextTaskFunction());

    });

    //////////////////////////////////////////////

};
