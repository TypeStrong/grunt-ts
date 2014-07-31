# Fast compile configuration
Note : You must use *external modules* to be effective with `grunt-ts` fast compile.

Note : `watch` is a good default for `grunt-contrib-watch`. Make sure that `spawn` is false in `grunt-contrib-watch` otherwise it reloads `grunt-ts` and we clear the cache. Alternatively use `always`


Configuration is done via the `fast` *task* option. The following values are supported:

* `watch`(default) which will clear the cache of the current target the first time it is called after `grunt-ts` has loaded (basically assumming that the js might have been out of date and just regenerating it *once*).
* `always` will *never* clear the cache and it is up to the user to clear it if they purge the js. This is useful when you are using something like `webstorm` which always restarts `grunt-ts` and therefore we cannot take responsibility of clearing the cache for your.
* `never` Disables fast compile.
