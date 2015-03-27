# How to disable the Visual Studio TypeScript Build
*but keep the TypeScript Project Properties Pane Working...*

If you are using Visual Studio and wish to compile your TypeScript with grunt-ts *only*, you can disable the Visual Studio TypeScript build by performing the following steps:

  * First, make sure your project has TypeScript support enabled by opening the project properties and confirming that the TypeScript Build properties pane is selectable.
  * Next, make sure your project folder has grunt-ts installed, and confirm that running grunt with the appropriate configuration will compile your project correctly.
  * Exit Visual Studio (Targets are only read once, so unloading the project is not sufficient).
  * Make sure that your project is backed-up or fully checked-in to Source Control.
  * Edit the .csproj or .vbproj file for which you wish to disable VS TypeScript building.
  * Search for the line containing the text "Microsoft.TypeScript.targets".  Delete or comment-out the entire line.
  * At that spot, add one of these lines:

**If grunt-ts is installed in node_modules under the Project folder:**
```xml
<Import Project="$(ProjectDir)\node_modules\grunt-ts\custom.TypeScript.targets" Condition="Exists('$(ProjectDir)\node_modules\grunt-ts\custom.TypeScript.targets')" />
```

**If grunt-ts is installed in node_modules under the Solution folder:**
```xml
<Import Project="$(SolutionDir)\node_modules\grunt-ts\custom.TypeScript.targets" Condition="Exists('$(SolutionDir)\node_modules\grunt-ts\custom.TypeScript.targets')" />
```

**If grunt-ts is installed elsewhere**
Modify one of the previous examples to point to the `custom.TypeScript.targets` file.

  * If you have multiple projects in your solution, you must edit each .csproj or .vbproj.
  * Reload Visual Studio and confirm that the TypeScript Build pane still appears in the project properties.
  * Then, introduce an error in a TypeScript file such as a mismatched parenthesis.
  * Finally, press Ctrl+Shift+B to initiate a build.  If the build succeeds, you've successfully disabled the TypeScript compilation in Visual Studio.  Run Grunt to build your project and it should fail.  Fix the error and Grunt should then succeed (assuming it was prior to you making these changes).
  * Note that "Compile on Save" *will still work* with the Visual Studio TypeScript Build disabled.  If you don't want Visual Studio to *ever* write TypeScript-emitted JavaScript files to disk, you will also need to disable "Compile on Save" in each project and configuration via the TypeScript Build pane.
