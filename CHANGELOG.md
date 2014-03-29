# Released

## v1.9.0 
* **Breaking change**: `reference.ts` generation now does EOL based on the current OS. This is the only rational reasonable way to handle EOLs. 
* **Breaking change**: `fast:true` is now the default. This means that your project might not be build ready just because the last `ts:compile` succeeded. You should add a task to clean `.tscache` and recompile everything for that safety before you push to the build server.

## v1.9.1 
* Fix: Automatically clear the `.tscache` on loading `grunt-ts` task. https://github.com/grunt-ts/grunt-ts/issues/81

## v1.9.2
* Fix: if fast compiling and user specified an `outDir` but `baseDir` isn't specified, figure one out based on the target src glob. (https://github.com/grunt-ts/grunt-ts/issues/77#issuecomment-37714430)
* Chore: updated chokidar https://github.com/grunt-ts/grunt-ts/pull/94

## v1.9.3
* Update cache hashed filename to be more intuitive : https://github.com/grunt-ts/grunt-ts/issues/96#issuecomment-38985020
* Change `baseDir` temporary file to be less intrusive : https://github.com/grunt-ts/grunt-ts/issues/77#issuecomment-38983764

# Planned

## v1.10.0
* **Breaking Change**: updated `fast` task option to have three levels: https://github.com/grunt-ts/grunt-ts/issues/96#issuecomment-38987023 `watch` (default) | `always` | `never`. If you never specified it than you don't need to do anything as the new default `'watch'` is same as old default `true`
* use grunt-ts to smoothe grunt-ts development workflow
* Update LKG is automatic at the moment because of https://github.com/grunt-ts/grunt-ts/issues/97

## Not yet associated with a release
* change `'./path/to/file'` to be `'path/to/file'` when doing transforms for `///ts:import` and `///ts:export`. Functionally equivalent, but the second form looks better (verify that it works for requirejs as well, I know it works for nodejs)
* Add documentation for transforms 
* Make `///  ts:import` etc. work same as `///ts:import` i.e. whitespace independent. 
* Add `///ts:reference` transform. 
* Show error when `/// ts:???` is detected but no transform exists for `???`
* Update to TypeScript `0.9.7` as the default
* Add documentation for fast compile 
	* All tasks like `grunt-contrib-watch` are supported
	* will not work with `--out`
* Fast compile needs to be more granular (https://github.com/grunt-ts/grunt-ts/issues/96#issuecomment-38987023) 
