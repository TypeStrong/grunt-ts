# v1.4.x: 
Added support for generating angularJS template cache

# v1.9.0: 
* Breaking change: `reference.ts` generation now does EOL based on the current OS. This is the only rational reasonable way to handle EOLs. 
* Breaking change: `fast:true` is now the default

# Planned v1.9.1: 
* change `'./path/to/file'` to be `'path/to/file'` when doing transforms for `///ts:import` and `///ts:export`. Functionally equivalent. But the second form looks better.
