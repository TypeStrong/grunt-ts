# Releases

## vNext

## v6.0.0-beta.22
* FIX: Loosen Grunt peer dependency to any 1.0 version.  Thanks for the PR [@danielrentz](https://github.com/danielrentz).  (#431)

## v6.0.0-beta.21
* FIX: Resolves baseUrl appearing blank under certain circumstances.  Thanks for the PR to first-time contributor [@beyerleinf](https://github.com/beyerleinf).  (#426)

## v6.0.0-beta.20
* FEATURE: Adds support for a RegEx to exclude files from the fast cache.  Thanks for the PR to first-time contributor [@shuky19](https://github.com/shuky19).  (#422)

## v6.0.0-beta.19
* FIX: using out in conjunction with a tsconfig.json was broken.  Thanks for the report [@jkanchelov](https://github.com/jkanchelov).  (#409)

## v6.0.0-beta.18
* FEAT: Adds support for compiler features up to TypeScript 2.7 (`esModuleInterop`, `strictPropertyInitialization`, `esnext` module type).
* DOCS: Recommend using tsconfig.json over GruntJS-style `src` setup.

## v6.0.0-beta.17
* FEAT: Adds support for compiler features up to TypeScript 2.6 RC (strictFunctionChecks).
* FIX: Whoops I didn't realize `skipLibCheck` and `skipDefaultLibCheck` were different.  Fixed in this release - thanks [@kierans](https://github.com/kierans) (#413).
* FEAT: Somewhat tighter npm package due to improved .npmignore file.  Thanks to first time contributor, [@stevegreatrex](https://github.com/stevegreatrex) (#287) (#411).
* FEAT: New support for specifying location of the tscache directory.  See docs for `tsCacheDir` for more details.  Thanks very much to first time contributor [@beebs93](https://github.com/beebs93) (#414) (#415).

## v6.0.0-beta.16
* FIX: Now accepts more watchable file extensions.  Thanks for the PR, first time contributor, [@LibanHassan](https://github.com/LibanHassan) (#404) Issue not found? Not after Liban fixed it, anyway :-)
* FIX: When using `baseDir` task option, will no longer include `.baseDir.ts` file in the compilation context.  Thanks for the PR, first time contributor [@nobuoka](https://github.com/nobuoka) (#380).  Sorry it took so long to review this PR!!!
* FIX: When using `rootDir` with `outDir`, will no longer create a `.baseDir.ts` file.  (Requires TypeScript 1.5 or higher).
* FIX: When using `outDir` without `rootDir`, will issue a warning.  (If using TypeScript 1.5 or higher).
* DOCS: Indicated that `baseDir` is now deprecated.  Use `rootDir` instead, and upgrade to TypeScript 1.5 or higher already, geez... ;-)
* FEAT: Now respects existing tsconfig.json line endings and indentation when updating.  Thanks for the PR, first time contributor, [RyanThomas73](https://github.com/RyanThomas73)

## v6.0.0-beta.15
* TODO: Update getting started documentation for TypeScript 2.0+ and npm 3+.
* FIX: Made typeRoots relative to the tsconfig.json file.  Thanks for the report and PR, [@beuted](https://github.com/beuted) (#399)
* FIX: Fixed "Must have TypeScript 1.8+" warning when using outFile and a custom compiler.  Thanks for the report, [@blendsdk](https://github.com/blendsdk) (#395)
* FEAT: Full support for TypeScript 2.2 including "extends" in tsconfig.json.
* FIX: Now minifies `tsconfig.json` content prior to parsing, so will no longer fail in the presence of comments.
* FIX: Now still honors Gruntfile.js exclude globs when using `tsconfig`.  Thank you for the report and assistance with troubleshooting, [@metamaker](https://github.com/metamaker) (#394 and #392)

## v6.0.0-beta.3
* CHORE: Update definition files used inside grunt-ts.  Thanks @vvakame!
* CHORE: Move `typescript` to a peer dependency.
* FIX: Loosened warnings on bad config that isn't actually bad config.  Thanks for the report, @0815fox (#364)!
* FEAT: Support added for testing Node 4, 5, and 6 in the Travis.yml.  Also upgraded Chokidar to 1.6 - thanks for the PR, @franleplant (#370)
* FIX: Added "none" as valid option for `module` setting.  Thanks for the PR, @kodypeterson (#371)
* DOCS: Fixed up docs for `module` setting - thanks for the PR, @zzsanduo (#362)

## v5.5.1
* CHORE: Internal grunt-ts compiler now upgraded to v5.5.0 / TypeScript 1.8.9.
* CHORE: Grunt-ts itself now compiles cleanly with `--forceConsistentCasingInFileNames`, `--noFallthroughCasesInSwitch`, and `--noImplicitReturns` enabled.
* DOCS: Completed documentation for new v5.5 (TypeScript 1.8) features.

## v5.5.0
* FEAT: Support TypeScript 1.8+
* FIX: "Visual Studio config issue: {} when src contains nested arrays".  Thanks very much to first-time contributor @davidparsson for the PR! (#353)
* DOCS: Moved contributing guide out to its own document: CONTRIBUTING.md

## v5.4.0 (2016-03-22)
* FIX: amdloader will now work for [`.tsx` extension as well](https://github.com/TypeStrong/grunt-ts/pull/274) [reapplied](https://github.com/TypeStrong/grunt-ts/pull/314)
* FIX: tsconfig.json exclude support for files (not just directories).  Thanks very much to first-time contributor @errorx666 for the PR!  Includes PR #337 which keeps exclude performance fast.  (#285, #336)
* DOCS: Update to `--moduleResolution` README section to show fluctuating default behaviour - by @thull
* FIX: the HTML feature now supports file names with dashes - they will be converted to the underscore character.  Many thanks to first-time contributor @xenit-raven for the PR!  (#324)
* FIX: Updated to `csproj2ts` v0.0.7 which supports Visual Studio 2015 projects (Thanks for the report and PR from first-time contributor @OClement ) .  Also now supports compiling on Mac which I'm sort of shocked it didn't but that's why we test things, isn't it?  Thanks for the report and PR (to `csproj2ts`) from first-time contributor @manfield ! (#345)

## v5.3.2 (2016-01-15)
* FIX: Should not crash in presence of target named "src" (#321) - thanks for the report @ravishivt and @riggerthegeek.

## v5.3.1 (2016-01-15)
* FIX: Will now properly add default tsconfig.json path if omitted when using object style (#302) - thanks for the report @nsgundy.

## v5.3.0 (2016-01-15)
* FEAT: Updated to natively support and include TypeScript 1.7.
* FEAT: Added support for `--noLib`, `--emitBOM`, `--locale`, `--suppressExcessPropertyErrors`, `--stripInternal`, and `--allowSyntheticDefaultImports`.
* FEAT: Added support for `es6` and `es2015` as module options.
* FIX: Revised all integration test "expected" artifacts to account for TypeScript 1.7 behavior (generally, the change to how `removeComments` works with /// references).
* FIX: Will now resolve templates prior to updating the globs in a tsconfig.json file (#303) - thanks for the report @nsgundy.
* FIX: Will now provide a warning when a grunt-ts task-level keyword (such as "watch") is used as a target name (#319) - thanks for the report @jounii.
* FIX: Transformed HTML files will be automatically added to the compilation context if they match a glob (#255).
* FIX: Use of `outDir` in the Gruntfile now works when otherwise getting the configuration from tsconfig.json. (Thanks, @gilamran (#312)).
* FIX: Certain conditions (such as the specified tsconfig.json not found or VS project resolution errors) caused grunt-ts to hard-quit during options resolution.  These are now properly surfaced as errors, and the main quit path will be followed.
* FIX: Improved detection of if newLine parameter is redundant for TSC.  This should make the functionality work more consistently if `grunt.util.linefeed` is used.  Thanks to @Maks3w for the report.

## v5.2.0 (2015-11-21)
* FIX: Grunt pipeline will once again halt by default in the presence of type errors.  This was a regression in 5.0.0.  Thanks to @mironx, @niondir, and @johnman for the report and assistance.  We've added assertions for the count of failed build events in the grunt-ts `release` test cycle, so a regression like this should hopefully not happen again.
* FEAT: Added new option `emitGruntEvents`.  In the event of a build failure, grunt-ts will now raise an event `grunt-ts.failure` if `emitGruntEvents` is `true`.  See the [docs](README.md#emitgruntevents) for more detail and an example.  This defaults to `false`, so it's opt-in and there is no change to the existing grunt-ts default behavior.

## v5.1.1 (2015-11-17)
* FIX: Fixes to htmlOutputTemplate.  Thanks so much to @rolego, @sethx, and @johnman for the help.
* DOCS: tweak to html2ts docs to clarify and perhaps fix old merge conflict.
* FIX: Resolve inappropriate warning if target is called `src` and uses `files` (Thanks, @vilmosioo (#305)).

## v5.1.0 (2015-10-14)
* FEAT: Upgraded to TypeScript 1.6.2 (thanks to @vp2177 and @JoshuaKGoldberg for sending early PRs, and for @awjreynolds, @Zjaaspoer, @DrColossos, @ravishivt, @logankd, and @Gouigouix for early encouragement.)
  * Added support for `--moduleResolution`, `--jsx`, `--experimentalAsyncFunctions`, `--suppressExcessPropertyErrors`, `--rootDir`.
  * Added `outFile` support to `tsconfig.json` (same function as `out`, but always relative to `tsconfig.json` file.)
  * Support all TypeScript 1.6 features from Visual Studio/MSBuild (via upgrade to csproj2ts v0.0.6).
* FIX: Fixed bug where `outDir` in `tsconfig.json` was not treated as being relative to the `tsconfig.json` file.
* FIX: New tests for "HTML" features (Thanks again, @rolego (#297)).
* FIX: Blank `tsconfig.json` should not be an error according to the spec, so this was changed to be same as `{}`.
* DOCS: New documentation for several "HTML" features - `htmlOutDir` and `htmlOutDirFlatten`.

## v5.0.1 (2015-10-08)
* FIX: 'htmlOutputTemplate' was not handled.  Thanks for the PR, @rolego (#291).

## v5.0.0 (2015-10-07)
Version 5 of grunt-ts represents a major overhaul of the options resolution system.  More than 100 new tests have been added, so this should be the highest quality version of grunt-ts yet.  Also, many integration tests have been rewritten as "heavy unit tests" (meaning they call into grunt-ts from grunt, but don't actually call `tsc`, so they run in ~0.02 sec).  This allows validation of grunt-ts warnings, and assertion of exact command line parameters.  Even though testing quality has gone up *significantly*, the overall time to run `grunt release` on grunt-ts itself has dropped from 184 seconds to 112 seconds - a 64% improvement.
* FIX: amdloader will now work for [`.tsx` extension as well](https://github.com/TypeStrong/grunt-ts/pull/274)
* FEAT: Added support for `tsconfig.json` [#202](https://github.com/TypeStrong/grunt-ts/issues/202).  Supports maintenance of `files` property and optional TypeStrong custom `filesGlob` extension.
* NOTE: Upgrade to TypeScript 1.6 was out of scope for version 5.0 - that will be part of version 5.1 which should be available soon.
* NOTE: Significant use of ES6 features throughout - let & const, ES6 imports, destructuring, etc.
* CHORE: Upgraded to tslint v2.4.0.
* CHORE: Upgraded to csproj2ts v0.0.4.
* NOTE: Added dependency on strip-bom npm package.
* CHORE: Updated several definition files including nodeunit, NodeJS, and es6-promises.
* CHORE: 'use strict' throughout.
* CHORE: Upgraded to csproj2ts v0.0.4.
* FIX: Will now provide warning if `sourcemap` is used; should be `sourceMap`.  This issue will be auto-resolved.
* FIX: Templates in grunt targets should always be resolved consistently now [#273](https://github.com/TypeStrong/grunt-ts/issues/273).  Thanks for the report, @bjorm.
* FIX: html2ts should now honor the `outdir` setting [#271](https://github.com/TypeStrong/grunt-ts/issues/271).  Thanks for the report, @hoeni.
* FIX: Target options should always work properly in conjunction with the `vs` option [#264](https://github.com/TypeStrong/grunt-ts/issues/264).  Thanks for the report, @vtkalek.
* FIX: Task and target-level options should always override consistently now [#248](https://github.com/TypeStrong/grunt-ts/issues/248).
* FIX: out and outDir in VS projects will now work consistently between grunt-ts and Visual Studio; the paths will resolve to be relative to the gruntfile even if the VS project is not in the same folder.
* If `vs` is used with `files`, there will still be a warning, but grunt-ts will now append the files from the Visual Studio project to the result of each files glob.  Previously it would compile the Visual Studio project files only (once per files entry).
* Fixed several broken warnings such as using an array for `dest` with `files`.


## v4.2.0 (2015-07-21)
* FEAT: TypeScript 1.5.3 support (TypeScript 1.5 "RTM").
  * While still compatible with older versions, grunt-ts now depends on TypeScript 1.5.3 by default (via package.json).
  * In addition to features added in 4.2.0-beta.1, added experimentalDecorators flag.
  * If emitDecoratorMetadata is specified, experimentalDecorators will now be enabled automatically.
  * If both inlineSources and inlineSourceMap are specified, sourceMap will now be disabled automatically.  Thanks @bryanforbes for notifying us of the change between TypeScript 1.5-alpha and 1.5-beta.
* DOCS: Updated for the above.  Thanks to @hdeshev for the PR.

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
