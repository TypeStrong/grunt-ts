var commandLineAssertions = require('./test/commandLineAssertions');
var utils = require('./tasks/modules/utils');

module.exports = function (grunt) {
    'use strict';

    var gruntStartedTimestamp = new Date().getTime(); // for report-time-elapsed task
    grunt.template.addDelimiters('config', '{%', '%}'); 

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        vsproj_path: 'test/vsproj',
        clean: {
            test: [
                'test/**/*.js',
                'test/**/*.js.map',
                'test/**/*.html.ts',
                '.tscache/**/*',
                '!test/test.js',
                '!test/expected/**/*',
                'test/htmlOutDir/generated/test',
                'test/htmlExternal/html.external.html.ts',
                'tscommand-*.txt',
                '!test/commandLineAssertions.js',
                '!test/optionsResolverTests.js',
                '!test/compilerTests.js',
                'test/**/*.orig',
                '!test/allowJs/allowJsLibrary.js'
            ],
            testPost: [
                'src/a.js',
                'src/b.js',
                'src/c.js',
                'src/reference.js',
                '**/.baseDir.ts',
                'test/tsconfig/*.json'
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
                configuration: grunt.file.readJSON('tslint.json')
            },
            source: {
                src: ['tasks/**/*.ts']
            },
            transformedHtml: {
                src: ['test/**/*.html.ts']
            }
        },
        'ts-internal': {
            options: {
                target: 'es5',
                module: 'commonjs',
                comments: true,
                sourceMap: true,
                verbose: true,
                fast: 'always',
                forceConsistentCasingInFileNames: true,
                noFallthroughCasesInSwitch: true,
                noImplicitReturns: true,
                pretty: true
            },
            build: {
                src: ['tasks/**/*.ts', 'test/*.ts']
            },
            test: {
                src: ['test/test.ts',
                  'test/commandLineAssertions.ts',
                  'test/optionsResolverTests.ts',
                  'test/compilerTests.ts']
            }
        },
        nodeunit: {
            slow: ['test/test.js'],
            fast: ['test/optionsResolverTests.js', 'test/compilerTests.js']
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
                    sourceMap: true,
                    declaration: true,
                },
            },
            simple: {
                test: true,
                options: {
                    sourceMap: true,
                    declaration: true
                },
                src: ['test/simple/ts/zoo.ts'],
                outDir: 'test/simple/js/',
            },
            simple_with_rootDir: {
                test: true,
                options: {
                    sourceMap: false,
                    rootDir: 'test/simple'
                },
                src: ['test/simple/ts/zoo.ts'],
                outDir: 'test/simple_with_rootDir/js/',
            },
            build_nodeunit_tests: {
                options: {
                    fast: 'never',
                    target: 'es5'
                },
                src: ['test/test.ts', 'test/testHelpers.ts', 'test/optionsResolverTests.ts', 'test/compilerTests.ts']
            },
            out_with_spaces: {
                test: true,
                testExecute: commandLineAssertions.out_with_spaces,
                options: {
                    fast: 'never',
                    sourceMap: false
                },
                src: ['test/simple/ts/zoo.ts'],
                out: 'test/out with spaces/out with spaces.js'
            },
            bad_sourcemap_option: {
                test: true,
                testExecute: commandLineAssertions.bad_sourcemap_option,
                options: {
                    fast: 'never',
                    sourcemap: true // should be sourceMap
                },
                src: ['test/simple/ts/zoo.ts'],
                out: 'test/badSourceMap.js'
            },
            outDir_with_spaces: {
                test: true,
                options: {
                    fast: 'never',
                    sourceMap: false
                },
                src: ['test/simple/ts/zoo.ts'],
                outDir: 'test/out with spaces'
            },
            multifiletest: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a/out.js' },
                    { src: ['test/multifile/b/**/*.ts'], dest: 'test/multifile/b/out.js' }],
                options: {
                    fast: 'never'
                }
            },
            files_dirdesttest: {
                test: true,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a/' }],
                options: {
                    fast: 'never'
                },
                testExecute: commandLineAssertions.files_dirdesttest
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
                testExecute: commandLineAssertions.files_showWarningIfFilesIsUsedWithSrcOrOut,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a/out.js' }],
                src: ['test/multifile/b/**/*.ts'],
                out: 'test/multifile/a/out.js',
                options: {
                    fast: 'never'
                }
            },
            files_showWarningIfFilesIsUsedWithSrcOrOutDir: {
                test: true,
                testExecute: commandLineAssertions.files_showWarningIfFilesIsUsedWithSrcOrOutDir,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a' }],
                src: ['test/multifile/b/**/*.ts'],
                outDir: 'test/multifile/a',
                options: {
                    fast: 'never'
                }
            },
            files_showWarningIfFilesIsUsedWithVs: {
                test: true,
                testExecute: commandLineAssertions.files_showWarningIfFilesIsUsedWithVs,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a' }],
                vs: 'test/vsproj/testproject.csproj',
                options: {
                    fast: 'never'
                }
            },
            files_showWarningIfFilesIsUsedWithFast: {
                test: true,
                testExecute: commandLineAssertions.files_showWarningIfFilesIsUsedWithFast,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: 'test/multifile/a' }],
                options: {
                    fast: 'always'
                }
            },
            files_testFilesUsedWithDestAsAJSFile: {
                test: true,
                testExecute: commandLineAssertions.files_testFilesUsedWithDestAsAFile,
                files: [
                    { src: ['test/multifile/a/**/*.ts'],
                      dest: 'test/multifile/files_testFilesUsedWithDestAsAJSFile/testDest.js' }
                ],
                options: {
                    fast: 'never'
                }
            },
            files_testFilesUsedWithDestAsAFolder: {
                test: true,
                testExecute: commandLineAssertions.files_testFilesUsedWithDestAsAFolder,
                files: [
                    { src: ['test/multifile/a/**/*.ts'],
                      dest: 'test/multifile/files_testFilesUsedWithDestAsAJSFolder' }
                ],
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
                testExecute: commandLineAssertions.files_testWarnIfFilesHasDestArray,
                files: [{ src: ['test/multifile/a/**/*.ts'], dest: ['test/multifile/a', 'test/multifile/b'] }],
                options: {
                    fast: 'never'
                }
            },
            files_testFilesObjectFormatWorks: {
                test: true,
                files: {
                    'test/files_ObjectFormat/a.js': ['test/multifile/a/**/*.ts'],
                    'test/files_ObjectFormat/b.js': ['test/multifile/b/**/*.ts', 'test/simple/ts/**/*.ts']
                },
                options: {
                    fast: 'never',
                    comments: true
                }
            },
            abtest: {
                test: true,
                src: ['test/abtest/**/*.ts'],
                reference: 'test/abtest/reference.ts',
                out: 'test/abtest/out.js',
                options: {
                    removeComments: false
                }
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
            es6test: {
                test: true,
                src: 'test/es6/stringTemplate.ts',
                outDir: 'test/es6/es6',
                options: {
                    target: 'es6'
                }
            },
            es6_to_es5test: {
                test: true,
                src: 'test/es6/stringTemplate.ts',
                outDir: 'test/es6/es5',
                options: {
                    target: 'es5'
                }
            },
            vsproj_test: {
                test: true,
                testExecute: commandLineAssertions.vsproj_test,
                vs: 'test/vsproj/testproject.csproj'
            },
            vsproj_test_config: {
                test: true,
                testExecute: commandLineAssertions.vsproj_test_config,
                vs: {
                    project: 'test/vsproj/testproject.csproj',
                    config: 'Release'
                }
            },
            vsproj_ignoreFiles_test: {
                test: true,
                src: 'test/vsproj/ignoreFiles/**/*.ts',
                vs: {
                    project: 'test/vsproj/testproject.csproj',
                    ignoreFiles: true
                }
            },
            vsproj_ignoreSettings_test: {
                test: true,
                vs: {
                    project: 'test/vsproj/testproject.csproj',
                    ignoreSettings: true
                },
                outDir: 'test/vsproj/ignoreSettings',
                options: {
                    target: 'es6'
                }
            },
            variablesReplacedInOut: {
                test: true,
                src: ['test/simple/ts/zoo.ts'],
                out: 'test/varreplacedtest/{%= pkg.name %}-test.js',
                options: {
                    target: 'es5',
                    declaration: false
                }
            },
            variablesReplacedInReference: {
                test: true,
                src: ['test/referenceReplaced/*.ts'],
                reference: 'test/referenceReplaced/referenced-{%= pkg.name %}.ts',
                options: {
                    target: 'es5',
                    declaration: false,
                    sourceMap: false,
                    noImplicitAny: true
                }
            },
            variablesReplacedForTSConfig: {
                test: true,
                tsconfig: 'test/tsconfig/tsconfig-{%= pkg.name %}.json',
                testExecute: commandLineAssertions.variablesReplacedForTSConfig
            },
            variablesReplacedFor_vs: {
                test: true,
                vs: '{%= vsproj_path %}/testproject.csproj',
                testExecute: commandLineAssertions.variablesReplacedFor_vs
            },
            tsconfig_passThrough_onlySendsConfigThrough_WithPathAndAdditional: {
                test: true,
                tsconfig: {
                    tsconfig: 'test/tsconfig',
                    passThrough: true
                },
                options: {
                    additionalFlags: '--someNewThing'
                },
                testExecute: commandLineAssertions.tsconfig_passThrough_onlySendsConfigThrough_WithPathAndAdditional
            },
            tsconfig_passThrough_onlySendsConfigThrough_WithoutPath: {
                test: true,
                tsconfig: {
                    passThrough: true
                },
                testExecute: commandLineAssertions.tsconfig_passThrough_onlySendsConfigThrough_WithoutPath
            },
            warnbothcomments: {
                test: true,
                testExecute: commandLineAssertions.warnbothcomments,
                src: ['test/abtest/**/*.ts'],
                reference: 'test/abtest/reference.ts',
                out: 'test/abtest/out.js',
                options: {
                    // this should cause a warning
                    comments: true,
                    removeComments: false,
                },
            },
            htmlSpecifiedButNoTypeScriptSource_ShouldError: {
                fail: true,
                html: ['test/html/**/*.tpl.html'],
                out: 'test/html/out.js',
                options: {
                    emitGruntEvents: true
                }
            },
            htmltest: {
                test: true,
                src: ['test/html/**/*.ts'],
                html: ['test/html/**/*.tpl.html'],
                reference: 'test/html/reference.ts',
                out: 'test/html/out.js',
            },
            htmltestWithTemplate: {
                test: true,
                src: ['test/htmlTemplate/**/*.ts'],
                html: ['test/htmlTemplate/**/*.tpl.html'],
                reference: 'test/htmlTemplate/reference.ts',
                out: 'test/htmlTemplate/out.js',
                options: {
                    htmlModuleTemplate: '<%= filename %>_<%= ext %>_module',
                    htmlVarTemplate: '<%= filename %>_<%= ext %>_variable',
                    comments: true
                },
            },
            htmltestSnakeModuleName: {
                test: true,
                src: ['test/htmlSnakeModuleName/**/*.ts'],
                html: ['test/htmlSnakeModuleName/**/*.tpl.html'],
                reference: 'test/htmlSnakeModuleName/reference.ts',
                out: 'test/htmlSnakeModuleName/out.js',
                options: {
                    htmlModuleTemplate: '<%= filename %>_<%= ext %>_module',
                    htmlVarTemplate: '<%= filename %>_<%= ext %>_variable',
                    comments: true
                },
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
                    sourceMap: true
                },
            },
            templatecache_test: {
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
                    fast: 'never',
                    module: 'commonjs',
                    comments: true
                }
            },
            refTransform: {
                test: true,
                src: ['test/references-transform/**/*.ts','test/references*.d.ts'],
                options: {
                    fast: 'never',
                    noImplicitAny: true,
                    comments: true
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
            continueIfTypeErrorAndNoFailOnTypeErrors: {
                test: true,
                src: ['test/failontypeerror/**/*.ts'],
                outDir: 'test/failontypeerror/js',
                options: {
                    failOnTypeErrors: false,
                    module: 'commonjs'
                }
            },
            hasEmitIfTypeErrorAnd_noEmitOnError_IsFalse: {
                test: true,
                src: 'test/noEmitOnError/testNoEmitOnError.ts',
                out: 'test/noEmitOnError/testNoEmitOnError_false.js',
                options: {
                    failOnTypeErrors: false,
                    noEmitOnError: false,
                    fast: 'never'
                }
            },
            doesNotHaveEmitIfTypeErrorAnd_noEmitOnError_IsTrue: {
                test: true,
                src: 'test/noEmitOnError/testNoEmitOnError.ts',
                out: 'test/noEmitOnError/testNoEmitOnError_true.js',
                options: {
                    failOnTypeErrors: false,
                    noEmitOnError: true,
                    fast: 'never'
                }
            },
            notPreservedIf_preserveConstEnums_IsFalse: {
                test: true,
                src: 'test/preserveConstEnums/test_preserveConstEnums.ts',
                out: 'test/preserveConstEnums/test_preserveConstEnums_false.js',
                options: {
                    preserveConstEnums: false,
                    fast: 'never'
                }
            },
            preservedIf_preserveConstEnums_IsTrue: {
                test: true,
                src: 'test/preserveConstEnums/test_preserveConstEnums.ts',
                out: 'test/preserveConstEnums/test_preserveConstEnums_true.js',
                options: {
                    preserveConstEnums: true,
                    fast: 'never'
                }
            },
            emitIf_suppressImplicitAnyIndexError_IsTrue: {
                test: true,
                src: 'test/suppressImplicitAnyIndexErrors/test_suppressImplicitAnyIndexError.ts',
                out: 'test/suppressImplicitAnyIndexErrors/test_suppressImplicitAnyIndexError_true.js',
                options: {
                    suppressImplicitAnyIndexErrors: true,
                    noImplicitAny: true,
                    failOnTypeErrors: true,
                    noEmitOnError: true,
                    fast: 'never'
                }
            },
            doNotEmitIf_suppressImplicitAnyIndexError_IsFalse: {
                test: true,
                src: 'test/suppressImplicitAnyIndexErrors/test_suppressImplicitAnyIndexError.ts',
                out: 'test/suppressImplicitAnyIndexErrors/test_suppressImplicitAnyIndexError_false.js',
                options: {
                    suppressImplicitAnyIndexErrors: false,
                    noImplicitAny: true,
                    failOnTypeErrors: false,
                    noEmitOnError: true,
                    fast: 'never'
                }
            },
            fail: {
                fail: true,                  // a designed to fail target
                src: ['test/fail/**/*.ts'],
                outDir: 'test/fail/js',
                baseDir: 'test/fail/ts',
                // watch: 'test',
                options: {                  // overide the main options for this target
                    sourceMap: false,
                    emitGruntEvents: true
                }
            },
            test_failOnTypeErrors: {
                fail: true,
                src: ['test/failontypeerror/**/*.ts'],
                outDir: 'test/failontypeerror/js',
                options: {
                    failOnTypeErrors: true,
                    emitGruntEvents: true
                }
            },
            files_testfailedcompilation: {
                fail: true,                  // a designed to fail target
                files: [{
                    src: ['test/files_testFailedCompilation/a/**/*.ts'],
                    dest: 'test/files_testFailedCompilation/a/out.js'
                },
                {
                    src: ['test/files_testFailedCompilation/b/**/*.ts'],
                    dest: 'test/files_testFailedCompilation/b/out.js'
                }],
                options: {
                    fast: 'never',
                    emitGruntEvents: true
                }
            },
            withemptymodule: {
                test: true,
                options: {
                    module: ''
                },
                src: 'test/withemptymodule/ts/Main.ts',
                out: 'test/withemptymodule/js/Main.js'
            },
            withwrongmodule: {
                fail: true,
                options: {
                    module: 'nothing',
                    emitGruntEvents: true
                },
                src: 'test/withwrongmodule/ts/*.ts',
                outDir: 'test/withwrongmodule/js'
            },
            usingOutWithExternalModules: {
                //expecting a warning here for using --out along with external modules (#257).
                test: true,
                options: {
                    module: 'amd'
                },
                src: 'test/withwrongmodule/ts/*.ts',
                out: 'test/usingOutWithExternalModules/result.js'
            },
            test_htmlOutputTemplate: {
                test: true,
                options: {
                    htmlVarTemplate: 'html',
                    htmlModuleTemplate: 'html.external',
                    htmlOutputTemplate:'module <%= modulename %> {\n' +
                    '    export var <%= varname %> = \'<%= content %>\';\n' +
                    '}\n'
                },
                html: 'test/htmlExternal/**/*.html',
                src: 'test/htmlExternal/**/*.ts'
            },
            new_TypeScript_1_8_Features: {
                test: true,
                testExecute: commandLineAssertions.new_TypeScript_1_8_Features,
                src: 'test/simple/ts/**/*.ts',
                options: {
                    reactNamespace: 'myReact',
                    skipDefaultLibCheck: true,
                    pretty: true,
                    allowUnusedLabels: true,
                    noImplicitReturns: true,
                    noFallthroughCasesInSwitch: true,
                    allowUnreachableCode: true,
                    forceConsistentCasingInFileNames: true,
                    allowJs: true,
                    noImplicitUseStrict: true
                }
            },
            new_TypeScript_2_0_Features: {
                test: true,
                testExecute: commandLineAssertions.new_TypeScript_2_0_Features,
                src: 'test/simple/ts/**/*.ts',
                options: {
                    strictNullChecks: true,
                    noImplicitThis: true,
                    lib: ['es2017']
                }
            },
            new_TypeScript_2_and_2_1_Features: {
                test: true,
                testExecute: commandLineAssertions.new_TypeScript_2_and_2_1_Features,
                src: 'test/simple/ts/**/*.ts',
                options: {
                    alwaysStrict: true,
                    baseUrl: '../',
                    charset: 'utf8',
                    declarationDir: '.././declarations dir/',
                    diagnostics: true,
                    importHelpers: true,
                    jsxFactory: 'React.createElement',
                    lib: ['es5', 'es2015.promise'],
                    listEmittedFiles: true,
                    listFiles: true,
                    maxNodeModuleJsDepth: 2,
                    noImplicitThis: true,
                    noUnusedLocals: true,
                    noUnusedParameters: true,
                    strictNullChecks: true,
                    traceResolution: true,
                    types: ['node', 'lodash', 'express'],
                    typeRoots: ['./sometypings','../../otherTypings'],
                    disableSizeLimit: true
                }
            },
            new_TypeScript_2_3_Features: {
                test: true,
                testExecute: commandLineAssertions.new_TypeScript_2_3_Features,
                src: 'test/simple/ts/**/*.ts',
                options: {
                    allowJs: true,
                    checkJs: true,
                    strict: true,
                    noImplicitThis: true,
                    downlevelIteration: true,
                    lib: ['esnext','dom.iterable','es2017.sharedmemory','esnext.asynciterable']
                }
            },
            new_TypeScript_2_4_thru_2_6_Features: {
                test: true,
                testExecute: commandLineAssertions.new_TypeScript_2_4_thru_2_6_Features,
                src: 'test/simple/ts/**/*.ts',
                options: {
                    noStrictGenericChecks: true,
                    preserveSymlinks: true,
                    skipLibCheck: true,
                    strictFunctionTypes: true
                }
            },
            new_TypeScript_2_6_final_and_2_7_Features: {
                test: true,
                testExecute: commandLineAssertions.new_TypeScript_2_6_final_and_2_7_Features,
                src: 'test/simple/ts/**/*.ts',
                options: {
                    esModuleInterop: true,
                    strictPropertyInitialization: true,
                    module: 'esnext'
                }
            },
            issue_392: {
                test: true,
                src: ['test/issue_392/app/**/*.ts',
                    '!test/issue_392/app/**/*.spec.ts',
                    'test/issue_392/typings/**/*.ts',
                    'test/issue_392/missing_typings/**/*.ts'
                    ],
                tsconfig: 'test/issue_392/issue_392-tsconfig.json',
                testExecute: commandLineAssertions.issue_392,
                options: {
                    fast: 'never',
                    verbose: true
                }
            },
            issue_397: {
                test: true,
                tsconfig: 'test/issue_397/src/issue_397-tsconfig.json',
                testExecute: commandLineAssertions.issue_397,
                options: {
                    fast: 'never',
                    verbose: true
                }
            },
            issue_426_1: {
                test: true,
                tsconfig: 'test/issue_426_baseUrl/src/issue_426_1.tsconfig.json',
                testExecute: commandLineAssertions.issue_426_1,
                options: {
                    fast: 'never',
                    verbose: true
                }
            },
            issue_426_2: {
                test: true,
                tsconfig: 'test/issue_426_baseUrl/src/issue_426_2.tsconfig.json',
                testExecute: commandLineAssertions.issue_426_2,
                options: {
                    fast: 'never',
                    verbose: true
                }
            },
            issue_426_3: {
                test: true,
                tsconfig: 'test/issue_426_baseUrl/src/issue_426_3.tsconfig.json',
                testExecute: commandLineAssertions.issue_426_3,
                options: {
                    fast: 'never',
                    verbose: true
                }
            },
            honorGruntfileExcludesWhenParsingTsconfig: {
                test: true,
                src: ['test/issue_392_2/app/**/*.ts','!test/issue_392_2/app/**/*.spec.ts'],
                tsconfig: 'test/issue_392_2/tsconfig.json',
                outDir: 'test/issue_392_2/compiled',
                testExecute: commandLineAssertions.honorGruntfileExcludesWhenParsingTsconfig,
                options: {
                    fast: 'never',
                    verbose: true
                }
            },
            allowJs_CompileWorks: {
                test: true,
                src: ['test/allowJs/allowJsConsumer.ts',
                  'test/allowJs/allowJsLibrary.js'],
                out: 'test/allowJs/result.js',
                options: {
                    allowJs: true,
                    noEmitOnError: true,
                    module: 'system'
                }
            },
            decoratorMetadataPassed: {
                test: true,
                testExecute: commandLineAssertions.decoratorMetadataPassed,
                src: 'test/simple/ts/z*o.ts',
                options: {
                    fast: 'never',
                    target: 'es6',
                    emitDecoratorMetadata: true,
                }
            },
            experimentalDecoratorsPassed: {
                test: true,
                testExecute: commandLineAssertions.experimentalDecoratorsPassed,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    target: 'es6',
                    experimentalDecorators: true,
                }
            },
            decoratorMetadataNotPassed: {
                test: true,
                testExecute: commandLineAssertions.decoratorMetadataNotPassed,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    target: 'es6',
                }
            },
            noEmitPassed: {
                test: true,
                testExecute: commandLineAssertions.noEmitPassed,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    noEmit: true
                }
            },
            noEmitNotPassed: {
                test: true,
                testExecute: commandLineAssertions.noEmitNotPassed,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never'
                }
            },
            inlineSourcesPassed: {
                test: true,
                testExecute: commandLineAssertions.inlineSourcesPassed,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    inlineSources: true,
                    sourceMap: false
                }
            },
            inlineSourcesAndInlineSourceMapPassed: {
                test: true,
                testExecute: commandLineAssertions.inlineSourcesAndInlineSourceMapPassed,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    inlineSources: true,
                    inlineSourceMap: true
                }
            },
            inlineSourceMapPassedWithSourceMap: {
                test: true,
                testExecute: commandLineAssertions.inlineSourceMapPassedWithSourceMap,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    inlineSourceMap: true,
                    sourceMap: true
                }
            },
            inlineSourcesNotPassed: {
                test: true,
                testExecute: commandLineAssertions.inlineSourcesNotPassed,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    sourceMap: false
                }
            },
            param_newLine_CRLF: {
                test: true,
                testExecute: commandLineAssertions.param_newLine_CRLF,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    newLine: 'CRLF'
                }
            },
            param_newLine_LF: {
                test: true,
                testExecute: commandLineAssertions.param_newLine_LF,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    newLine: 'LF'
                }
            },
            test_systemJS: {
                test: true,
                testExecute: commandLineAssertions.test_systemJS,
                src: 'test/withwrongmodule/ts/*.ts',
                options: {
                    fast: 'never',
                    module: 'system'
                }
            },
            test_umd: {
                test: true,
                testExecute: commandLineAssertions.test_umd,
                src: 'test/withwrongmodule/ts/*.ts',
                options: {
                    fast: 'never',
                    module: 'umd'
                }
            },
            test_isolatedModules: {
                test: true,
                testExecute: commandLineAssertions.test_isolatedModules,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    isolatedModules: true
                }
            },
            test_noEmitHelpers: {
                test: true,
                testExecute: commandLineAssertions.test_noEmitHelpers,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    noEmitHelpers: true
                }
            },
            test_additionalFlags: {
                test: true,
                testExecute: commandLineAssertions.test_additionalFlags,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    fast: 'never',
                    additionalFlags: '--version'
                }
            },
            test_jsx: {
                test: true,
                testExecute: commandLineAssertions.test_jsx,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    jsx: 'preserve'
                }
            },
            test_moduleResolution: {
                test: true,
                testExecute: commandLineAssertions.test_moduleResolution,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    moduleResolution: 'classic'
                }
            },
            test_experimentalAsyncFunctions: {
                test: true,
                testExecute: commandLineAssertions.test_experimentalAsyncFunctions,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    experimentalAsyncFunctions: true
                }
            },
            test_rootDir: {
                test: true,
                testExecute: commandLineAssertions.test_rootDir,
                src: 'test/simple/ts/zoo.ts',
                outDir: 'test/simple/js/test_rootDir',
                options: {
                    rootDir: 'test/simple'
                }
            },
            test_directoriesWithSpaces: {
                test: true,
                testExecute: commandLineAssertions.test_directoriesWithSpaces,
                src: 'test/simple/ts/zoo.ts',
                outDir: 'test/outDir with spaces',
                options: {
                    rootDir: 'test/rootDir with spaces',
                    sourceRoot: 'test/sourceRoot with spaces',
                    mapRoot: 'test/mapRoot with spaces'
                }
            },
            test_noLib: {
                test: true,
                testExecute: commandLineAssertions.test_noLib,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    noLib: true
                }
            },
            test_baseDirSpecified: {
                test: true,
                testExecute: commandLineAssertions.test_baseDirSpecified,
                src: 'test/baseDirOption/baseDirSpecified/foo/bar.ts',
                outDir: 'test/baseDirOption/outDir/baseDirSpecified/',
                baseDir: 'test/baseDirOption/baseDirSpecified/',
                options: {
                    fast: 'never'
                }
            },
            test_baseDirNotSpecified: {
                test: true,
                testExecute: commandLineAssertions.test_baseDirNotSpecified,
                src: 'test/baseDirOption/baseDirNotSpecified/foo/bar.ts',
                outDir: 'test/baseDirOption/outDir/baseDirNotSpecified/',
                // `baseDir` is not specified
                options: {
                    fast: 'never'
                }
            },
            test_emitBOM: {
                test: true,
                testExecute: commandLineAssertions.test_emitBOM,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    emitBOM: true
                }
            },
            test_locale: {
                test: true,
                testExecute: commandLineAssertions.test_locale,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    locale: 'ja-jp'
                }
            },
            test_suppressExcessPropertyErrors: {
                test: true,
                testExecute: commandLineAssertions.test_suppressExcessPropertyErrors,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    suppressExcessPropertyErrors: true
                }
            },
            test_stripInternal: {
                test: true,
                testExecute: commandLineAssertions.test_stripInternal,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    stripInternal: true
                }
            },
            test_allowSyntheticDefaultImports: {
                test: true,
                testExecute: commandLineAssertions.test_allowSyntheticDefaultImports,
                src: 'test/simple/ts/zoo.ts',
                options: {
                    allowSyntheticDefaultImports: true
                }
            },
            test_htmlTemplateGlob: {
                test: false, // called manually by test_htmlTemplateResultAddedToGlobs.
                files: [{ src: ['test/htmlTemplateGlob/**/t*.ts']},
                    { src: ['test/htmlTemplateGlob/**/o*.ts'] }],
                html: ['test/htmlTemplateGlob/**/*.html']
            },
            test_nestedSources: {
                test: true,
                src: [[['test/simple/ts/zoo.ts']]],
                outDir: 'test/nestedSources/'
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
    }, ['test_htmlTemplateResultAddedToGlobs']));

    (function() {
        // Collect fail tasks
        var grunt_ts_total_failures = 0,
          failTasks = grunt.util._.reduce(grunt.config.get('ts'), function (memo, task, name) {
                if (task.fail) {
                    memo.push('ts:' + name);
                }
                return memo;
            }, []),
          fastIntegrationTests = grunt.util._.reduce(grunt.config.get('ts'), function (memo, task, name) {
                if (task.test && task.testExecute) {
                    memo.push('ts:' + name);
                }
                return memo;
            }, []);
        grunt.registerTask('test_fail', failTasks);
        grunt.registerTask('test_fastIntegration', fastIntegrationTests);
        grunt.event.on('grunt-ts.failure', function() {
                grunt_ts_total_failures += 1;
            });
        grunt.registerTask('validate_failure_count', 'Counts failure events emitted by grunt-ts', function() {
            console.log('Expected ' + failTasks.length + ' task failures, got ' +
                grunt_ts_total_failures + ' failures.');
            if (failTasks.length === 0) {
                console.log('Expected more than zero failures.');
                return false;
            }
            return (grunt_ts_total_failures === failTasks.length);
        });
    }());

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

    // Build
    grunt.registerTask('prep', ['clean:test', 'jshint:support']);
    grunt.registerTask('build', ['prep', 'ts-internal', 'tslint:source', 'report-time-elapsed']);

    // Test
    grunt.registerTask('fail', ['continue:on', 'test_fail', 'continue:off', 'validate_failure_count']);
    grunt.registerTask('test', ['stageFiles', 'test_all', 'fail', 'ts:build_nodeunit_tests', 'nodeunit:fast',
      'nodeunit:slow', 'tslint:transformedHtml', 'clean:testPost']);

    // Release
    grunt.registerTask('release', ['build', 'test', 'report-time-elapsed']);
    grunt.registerTask('default', ['release']);

    (function(){
        var test_htmlTemplateResultAddedToGlobs_shouldExist = [
            'test/htmlTemplateGlob/test.html.ts',
            'test/htmlTemplateGlob/test.html.js',
            'test/htmlTemplateGlob/test.html.js.map',
            'test/htmlTemplateGlob/doNotTranspile.html.ts'
        ];
        var test_htmlTemplateResultAddedToGlobs_shouldNotExist = [
            'test/htmlTemplateGlob/doNotTranspile.html.js',
            'test/htmlTemplateGlob/doNotTranspile.html.js.map'
        ];

        grunt.registerTask('test_htmlTemplateResultAddedToGlobs',
            'integration test to prove that new TS files created by HTML evaluation are included on the' +
            'first run.',  function() {

            [test_htmlTemplateResultAddedToGlobs_shouldExist,
              test_htmlTemplateResultAddedToGlobs_shouldNotExist].forEach(
                function (array) {
                    array.forEach(function (fileName) {
                        if (grunt.file.exists(fileName)) {
                            grunt.file.delete(fileName);
                        }
                    });
                }
            );

            grunt.task.run('ts:test_htmlTemplateGlob');
            grunt.task.run('test_htmlTemplateResultAddedToGlobsAssert');
        });

        grunt.registerTask('test_htmlTemplateResultAddedToGlobsAssert',
            'integration test to prove that new TS files created by HTML evaluation are included on the' +
            'first run.',  function() {
            var validatedFileCount = 0, result = true;
            test_htmlTemplateResultAddedToGlobs_shouldExist.forEach(
              function (fileName) {
                if (!grunt.file.exists(fileName)) {
                    console.log('Expected file "' + fileName + '" to exist.');
                    result = false;
                } else {
                    validatedFileCount += 1;
                }
            });
            test_htmlTemplateResultAddedToGlobs_shouldNotExist.forEach(
              function (fileName) {
                if (grunt.file.exists(fileName)) {
                    console.log('Expected file "' + fileName + '" to not exist.');
                    result = false;
                } else {
                    validatedFileCount += 1;
                }
            });
            return result && (validatedFileCount === 6);
        });
    }());


    //////////////////////////////////////////////
    // Dev
    //
    // `grunt dev` if using grunt watch
    // Or
    // `grunt run` if using webstorm / manual run
    //
    // Modify tasksToTest based on what you are working on

    var tasksToTest = ['ts:vsproj_test'];

    grunt.registerTask('dev', ['run', 'watch']);

    function taskToBuildGruntTsAndThenRunOtherTasks(tasksToRun) {
        return function() {

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
            tasksToRun.unshift('ts-internal:build');

            // Now execute
            var currentIndex = 0;
            function getNextTaskFunction() {
                currentIndex++;
                if (currentIndex === tasksToRun.length) {
                    return done;
                }
                else {
                    return function () {
                        runTask(tasksToRun[currentIndex], getNextTaskFunction());
                    };
                }
            }
            runTask(tasksToRun[0], getNextTaskFunction());
        };
    }


    grunt.registerTask('testfast', taskToBuildGruntTsAndThenRunOtherTasks(
            ['ts-internal:test', 'stageFiles','test_fastIntegration', 'nodeunit:fast']
            ));


    grunt.registerTask('run', taskToBuildGruntTsAndThenRunOtherTasks(tasksToTest));

    grunt.registerTask('report-time-elapsed','Reports the time elapsed since gruntStartedTimestamp', function() {
        var seconds = ((new Date().getTime()) - gruntStartedTimestamp) / 1000;
        console.log(('Your "Grunt work" took ' + seconds.toFixed(2) + ' seconds and finished at ' +
          (new Date().toLocaleString()) + '.').green);
        return true;
    });

    grunt.registerTask('stageFiles','Ensures that certain files that are cleaned will be present for the tests.',
      function() {
        var done = this.async();
        try {
            utils.copyFile('test/tsconfig_artifact/tsconfig-grunt-ts.json','test/tsconfig/tsconfig-grunt-ts.json',
            function (err) {
                if (err) {
                    grunt.log.writeln(err);
                    done(false);
                }
                done();
            }
          );
        } catch (ex) {
            console.log(ex);
            return false;
        }
        return true;
    });
};
