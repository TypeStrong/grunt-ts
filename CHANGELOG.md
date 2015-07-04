# Releases

## Next

## v4.2.0-beta.1 (2015-06-07)
* FEAT: TypeScript 1.5 beta support.
  * Added support for new TS 1.5 switches: newLine, noEmit, emitDecoratorMetadata, isolatedModules, noEmitHelpers, inlineSourceMap, inlineSources.
  * Added support for SystemJS ('system') and UMD ('umd') on `module` option.
  * Grunt-ts now compiles correctly with TypeScript 1.5 beta, and all tests pass.  Development should now be done with TypeScript 1.5.
  * Note - the compiler that *ships* with grunt-ts will remain as 1.4 until 1.5 is finalized.  Update `typescript` in your `package.json` to `1.5.0-beta` and run `npm install` if you wish to use the TypeScript 1.5 beta to compile *your* code.
* FEAT: Added new `additionalFlags` option to allow passing arbitrary strings to tsc (To allow immediate support for new or custom features on the command-line)
* FEAT: Implemented support for arbitrary HTML transforms, such as to external modules (#249).  Thanks to @sethx for the Pull Request.
* FIX: Now grunt-ts provides a warning if someone uses --out with an external module system (#257).  Thanks to @dbeckwith for the report.
* DOCS: Updated the docs for all of the above.

## v4.1.2 (2015-06-03)
* FIX: Regression with `out` and `outDir` for paths with spaces (Also reported on #251).  Thanks to @seanmailander for the report.

## v4.1.1 (2015-06-02)
* FIX: Support for the Grunt `files` feature had a regression and was not working correctly.  (#251).  Thanks to @Linowitch for the report.  We've built in some assertions to ensure this doesn't happen again.

## v4.1.0 (2015-05-10)
* FIX: The `reference` property should properly work with Grunt transforms again (#235 + #245).  Thanks to @thorseye for the PR and @smfeest for independently reporting.
* FIX: Should work better in situations where `node` isn't the PATH of the current process (#236).  Thanks to @ryanthomas840310 for the PR and @olegccc for the initial report.
* FIX: The `html` feature now emits TypeScript that passes tslint (#226).  Thank you for the suggestion and example code @BerndWessels.
* FIX: The `html` feature now supports file names with periods (#237).  Thanks to @starstuffharvestingstarlight.
* CHORE: Updated to latest chokidar in `package.json` (#232).  Thanks to @paulmillr.
* CHORE: Cleaned up our sample Gruntfile (#228).  Thanks to @bennyn.
* DOCS: Improved documentation for `html` feature (#234). Thanks to @ben8p.

## v4.0.1 (2015-03-27)
* FIX: Corrected an issue introduced in 4.0.0 where Grunt transforms were not running on `out`, `outDir`, `reference`, `mapRoot`, or `sourceRoot`.  (#220 - thanks to paulgambrell and JoeFirebaugh for the report.)
* FIX: An empty compile step was getting called once per project file if `vs` was used; this has been corrected.
* FIX: Ignored a dev-only directory for npm.
* FIX: Comments will now be preserved when using `vs` unless RemoveComments is explicitly set in the Visual Studio project.
* DOCS: Clarified that Compile on Save is not necessarily disabled if you follow the instructions to disable the Visual Studio TypeScript build (but it can be disabled if desired).

## v4.0.0 (2015-03-27)
* FEAT: Now supports parsing and compiling directly against the TypeScript files and configuration specified in a Visual Studio project file - .csproj or .vbproj.  Visual Studio *not* required and files list/config override-able, ignorable and extend-able.  (https://github.com/TypeStrong/grunt-ts/pull/215)
* FEAT: Now includes a custom TypeScript targets file to easily disable the internal Visual Studio TypeScript build.
* DOCS: New detailed instructions on how to disable TypeScript build within Visual Studio while keeping TypeScript Build project properties pane functional.
* DOCS: Several documentation improvements and clarifications.
* FIX: report error on wrong `module` option. (https://github.com/TypeStrong/grunt-ts/pull/212)
* FIX: Corrected an issue where the grunt-ts transforms module might transform itself.  #SkyNet
* CHORE: Added unit test for ///ts:ref= transform.
* CHORE: Removed dependency on tslint-path-formatter and upgraded grunt-tslint dev dependency to 2.0.0.

## v3.0.0 (2015-02-06)
* **Breaking Change**: the default bundled typescript compiler is now `1.4.1`
* FEAT: More compiler flags supported (https://github.com/TypeStrong/grunt-ts/pull/206)
* CHORE: updated chokidar. Needed to decrease CPU utilization on certain OSes (https://github.com/TypeStrong/grunt-ts/issues/192#issuecomment-68136726)
* FIX: now will default to Grunt end of line character, but supports Grunt override (#200).
* CHORE: do not publish `/customcompiler` folder to npm

## v2.0.1 (2014-12-20)
 * FIX: Compatibility with TypeScript 1.3 exit codes (#189).
 * FIX: Show issue count in red if failOnTypeError option is set and there are non-emit preventing errors  (#189).
 * FIX: Fixed bad `failontypeerror` test. (Used incorrect location for parameter in Gruntfile.js).

## v2.0.0 (2014-12-05)
* DOCS: Major documentation overhaul (https://github.com/TypeStrong/grunt-ts/pull/185)
* DOCS: More sample config for gruntfile (https://github.com/TypeStrong/grunt-ts/pull/166)
* DOCS: changelog is now *newest on top*
* FEAT: support for `files` in gruntfile (https://github.com/TypeStrong/grunt-ts/pull/171)
* FEAT: support watching multiple DIRS. (https://github.com/grunt-ts/grunt-ts/pull/155)
* CHORE: Use lodash instead of underscore (https://github.com/TypeStrong/grunt-ts/pull/161)
* FIX: missing tsc.js will now fail the build step (#177)

## v1.12.0 (2014-09-30)
* ENANCEMENT: Transforms are run even when the compile option is false

## v1.11.13 (2014-09-30)
* FIX: transforms will now pick up a generated references.ts (#148)

## v1.11.12
* FIX: transforms should now work for files with BOM (#146)

## v1.11.11
* import/export transforms can provide an alternate variable name to use instead of the file name (#143)
* Error displayed when `/// ts:???` is detected but no transform exists for `???`

## v1.11.10
* FIX: `///ts:import` and `///ts:ref` will now work with `d.ts` files as well.

## v1.11.9
* DOCS: recommend `fast:always` with `grunt-contrib-watch` because `spawn:false` breaks under stress (i.e. `interrupt:true`)
* FIX: use `stdout` if not empty. Otherwise fall back to `stderr` (a change introduced in the latest version of the compiler for consistency with other Microsoft compilers) See https://github.com/grunt-ts/grunt-ts/issues/140

## v1.11.8
* Update bundled TypeScript compiler to v1.0.1

## v1.11.7
* Fix: Make `///  ts:import` etc. work same as `///ts:import` i.e. whitespace independent.(#135)

## v1.11.6
* FEAT: Add a `compiler` task option to specify a custom compiler bin path : https://github.com/grunt-ts/grunt-ts/issues/126
* DOCS: Add documentation for transforms (https://github.com/grunt-ts/grunt-ts/issues/85) + `ts:ref`
* DOCS: I don't like `amdLoader` anymore now that we have transforms. So **deprecating** it and moving its docs to its own file.
* DOCS: Moved docs for customizing `html2ts` output into their own file as I want readme to be quick and effective (focused on why).
* DOCS: Add documentation for fast compile
	* All tasks like `grunt-contrib-watch` are supported
	* will not work with `--out`
	* the granularity https://github.com/grunt-ts/grunt-ts/issues/96#issuecomment-38987023

## v1.11.5
* No need to warn when default values are usable. Ref: https://github.com/grunt-ts/grunt-ts/issues/115
* Fix path.join error because of `grunt.task.current.target` : https://github.com/grunt-ts/grunt-ts/issues/118
* Update LKG with self

## v1.11.4
* Add additional error summary for type error vs. code emit preventing error : https://github.com/grunt-ts/grunt-ts/pull/120

## v1.11.3
* Add `failOnTypeErrors` task option. If `false` build succeeds (exit code 0) if JS can be emitted successfully. More : https://github.com/grunt-ts/grunt-ts/pull/103

## v1.11.2
* Add `///ts:ref` transform for reference tags
* change `'./../path/to/file'` to be `'../path/to/file'` when doing transforms

## v1.11.1
* Do not update templateCache if previous file is same as the new calculated one

## v1.11.0
* Fix LKG https://github.com/grunt-ts/grunt-ts/issues/97 i.e. `grunt upgrade`
* Cleanup `.npmignore`
* **Breaking Change**: Update the bundled TSC to v1.0.0
* **Breaking Change**: Remove `index` option (https://github.com/grunt-ts/grunt-ts/issues/68). This has been replaced by transformers. Plus the blindly created index is unreliable for when we have any file that doesn't `export` anything.

## v1.10.0
* **Breaking Change**: updated `fast` task option to have three levels: https://github.com/grunt-ts/grunt-ts/issues/96#issuecomment-38987023 `watch` (default) | `always` | `never`. If you never specified it than you don't need to do anything as the new default `'watch'` is same as old default `true`
* use grunt-ts to smoothe grunt-ts development workflow
* Update LKG is automatic at the moment because of https://github.com/grunt-ts/grunt-ts/issues/97

## v1.9.3
* Update cache hashed filename to be more intuitive : https://github.com/grunt-ts/grunt-ts/issues/96#issuecomment-38985020
* Change `baseDir` temporary file to be less intrusive : https://github.com/grunt-ts/grunt-ts/issues/77#issuecomment-38983764

## v1.9.2
* Fix: if fast compiling and user specified an `outDir` but `baseDir` isn't specified, figure one out based on the target src glob. (https://github.com/grunt-ts/grunt-ts/issues/77#issuecomment-37714430)
* Chore: updated chokidar https://github.com/grunt-ts/grunt-ts/pull/94

## v1.9.1
* Fix: Automatically clear the `.tscache` on loading `grunt-ts` task. https://github.com/grunt-ts/grunt-ts/issues/81

## v1.9.0
* **Breaking change**: `reference.ts` generation now does EOL based on the current OS. This is the only rational reasonable way to handle EOLs.
* **Breaking change**: `fast:true` is now the default. This means that your project might not be build ready just because the last `ts:compile` succeeded. You should add a task to clean `.tscache` and recompile everything for that safety before you push to the build server.
