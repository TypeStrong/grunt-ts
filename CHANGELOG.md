# v1.4.x: 
Added support for generating angularJS template cache

# v1.9.0: 
* Breaking change: `reference.ts` generation now does EOL based on the current OS. This is the only rational reasonable way to handle EOLs. 
* Breaking change: `fast:true` is now the default. This means that your project might not be build ready just because the last `ts:compile` succeeded. You should add a task to clean `.tscache` and recompile everything for that safety before you push to the build server.

# Planned v1.9.1: 
* change `'./path/to/file'` to be `'path/to/file'` when doing transforms for `///ts:import` and `///ts:export`. Functionally equivalent, but the second form looks better.
* Add documentation for transforms 
* Make `///  ts:import` etc. work same as `///ts:import` i.e. whitespace independent. 
* Add `///ts:reference` transform. 
* Show error when `/// ts:???` is detected but no transform exists for `???`
