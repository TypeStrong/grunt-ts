# Contributing to grunt-ts

Thank you for your interest in contributing!

This project is in a mature maintenance phase.  This means that the grunt-ts maintainers are focused on the following:

  * Compatibility with the latest stable version of TypeScript (native support for new switches, etc.)
  * Reliability enhancements such as bug fixes with tests

New features and performance improvements will be considered if they are of broad benefit and well documented/covered with adequate tests.  Before you start coding, please open an issue to discuss your idea!


## Steps To Update grunt-ts to a New Version of TypeScript

  * Set up a new branch in your fork of the repository.
  * Update the dependencies section of `package.json` to the new TypeScript version and run `npm install`.
  * Run `grunt release` and see if there are any errors.
  * Fix the errors.
    * Very commonly there will be "diff" errors.  Grunt-ts will generate `kdiff3` commands for all "diff" errors.  In cases where the difference is due to how the new version of TypeScript emits the JS code, simply update the expected version to match by merging the changes inside `kdiff3` and choosing `A` for all the changes.
  * Once `grunt release` compiles cleanly, check everything in.
  * Now, it's necessary to update grunt-ts to support the new TypeScript version's switches.  Open `tasks/modules/optionsResolver.ts`.  Early in that file is a link to the TypeScript wiki where the compiler options are documented.  Compare that list to the switches in `propertiesFromTarget` and `propertiesFromTargetOptions`.  Add any new switches to `propertiesFromTargetOptions` unless there is an overwhelmingly strong reason to add it to the target itself.
  * Once that is done, add code to accept each of those switches to `ITaskOptions` in `tasks/modules/interfaces.d.ts`.  Provide some JSDoc if possible.
  * Next, update `tasks/modules/defaults.ts`.  First, update the `TypeScriptDefaults` variable to set the new switches to whatever tsc will do - generally `false` for booleans and `null` for everything else (essentially falsy values).  Then, if necessary, modify the function `applyGruntTSDefaults` to apply what grunt-ts should do that is different than what `tsc` does by default (this is unlikely for new TypeScript features).
  * Then update `tasks/modules/compile.ts` to pass the new switches.  Mostly this will be checking for the presence of the option and pushing to the args variable inside `compileAllFiles()`.
  * Add a test for the new switches inside the `Gruntfile.js`.  A good example is `new_TypeScript_1_8_Features`.  The important thing is the `testExecute` property.  Add a new function in commandLineAssertions.ts with the same name as the one you specified in testExecute.
  * Update tsconfig support - Edit the `sameNameInTSConfigAndGruntTS` variable in the `tsconfig.ts` file with all of the grunt-ts options that are the same as the new option names in the tsconfig.json file (should generally be all of them).  Any parameters that don't have the same name in grunt-ts as in tsconfig.json will require more coding in the `applyCompilerOptions` function.  Then edit the test/tsconfig_artifact/full_valid_tsconfig.json file to add at least one of the new parameters.  Then test for it to be passed in the "config entries come through appropriately" test in `optionsResolverTests.ts`.
  * Update VS support - The csproj2ts project needs to be updated.  Then update the dependency in the grunt-ts package.json file and run `npm install`. Once that is complete, update the `simpleVSSettingsToGruntTSMappings` array in `tasks/modules/visualStudioOptionsResolver.ts`.  Finally, add one or more of the new Visual Studio properties to the `test/vsproj/testproject.csproj` file and also to the "Visual Studio properties come across as expected" test in `optionsResolverTests.ts`.
  * Publish a beta.
  * Add any additional feature-specific tests that would be useful for the new TypeScript version.
  * Add documentation
  * Publish the main release (as a feature/point release unless there were major changes).
  * If very happy with the release, update the internal compiler with `grunt upgrade`.



## To Start Working On grunt-ts

With npm and grunt-cli installed, run the following from the root of the repository:

```bash
$ npm install
```
### Building the project:

To build all

```bash
$ grunt build
```
### Running the tests:

To test all

```bash
$ grunt test
```

### Before PR

```bash
$ grunt release
```

It runs `build` followed by `test`. This is also the default task. You should run this before sending a PR.

### Development

The easiest/fastest way to work on grunt-ts is to modify `tasksToTest` toward the bottom of the `gruntfile.js`.  The `grunt dev` command is set up to compile grunt-ts with your changes and then reload itself; then, your newly-compiled grunt-ts will be used to run whatever tasks are listed in the `tasksToTest` array.

Without using `tasksToTest` while working on grunt-ts, the old grunt-ts remains in memory for successive tasks on the same run.  This means you might have to run your grunt commands twice; once to compile grunt-ts and once to see how the new grunt-ts works with your code.

### Quickstart for debugging Grunt plugins with Node Inspector

Install [Node Inspector](https://github.com/node-inspector/node-inspector) via npm:

`npm install -g node-inspector`

Example command-line to debug a grunt-ts task on Windows:

`node-debug --debug-brk %appdata%\npm\node_modules\grunt-cli\bin\grunt ts:files_testFilesUsedWithDestAsAJSFile`

Example command-line to debug a particular nodeunit test on Windows:

`node-debug --debug-brk node_modules\grunt-contrib-nodeunit\node_modules\nodeunit\bin\nodeunit test\optionsResolverTests.js -t "out with spaces gets escaped with double-quotes"`


Set breakpoints in the Chrome dev tools, or use `debugger;` where needed.

### Additional commands
Update the current `grunt-ts` to be the last known good version (dogfood). Commit message should be `Update LKG`.

```bash
$ grunt upgrade
```

### Publishing Checklist

 * Run `grunt release` and ensure it comes back clean (should finish but with warnings).
 * Update the version in package.json.
 * Update CHANGELOG.md and README.md (top section referencing latest version number).
 * Commit to master.
 * Publish to npm.
 * Push version tag to GitHub.
