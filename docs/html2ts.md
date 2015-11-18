### Html 2 TypeScript support

Grunt-ts can re-encode html files into TypeScript and make them available as a variable.

For example a file called `test.html`:
```html
<div> Some Content </div>
```

Will be compiled to a TypeScript file `test.html.ts` containing:
```typescript
module test { export var html =  '<div> Some content </div>' }
```

This will export the variable `test.html` within the TypeScript scope to get the content of test.html as a string, with the main benefit of limiting the http-requests needed to load templates in various front-end frameworks.

#### Html 2 TypeScript usage in AngularJS

This is great for putting variables in templateCache: http://docs.angularjs.org/api/ng.$templateCache or even using the html string directly by setting it to the `template` properties (directives/views) instead of `templateUrl`

#### Html 2 TypeScript usage in EmberJS

It is possible to specify this string to the template on a view: http://emberjs.com/api/classes/Ember.View.html

Specifically: http://stackoverflow.com/a/9867375/390330

#### Control generated TypeScript module and variable names

In the task options `htmlModuleTemplate` and `htmlVarTemplate` you can specify Underscore template variables to be used in order to generate the module and variable names for the generated TypeScript.

Those Underscore template receive the following parameters:

 * filename - The html file name without the extension ("test" if the file was named test.html)
 * ext - The html extension without the dot ("html" if the file was named test.html)

The default templates are:

 * "<%= filename %>" - for the module name. (This maintain existing behavior of older versions, and allow controlling the module name by simply renaming the file.)
 * "<%= ext %>" - for the variable name. (This maintain existing behavior of older versions, again allowing to control variable name by renaming the file.)

Usage example is setting the module template to "MyModule.Templates" and the variable template to "<%= filename %>" this will result for the test.html file above with the generated TypeScript
```typescript
module MyModule.Templates { export var test = '<div Some content </div>' }
```

#### Override predefined template and specify a custom output format

Using the task option `htmlOutputTemplate` you can specify Underscore template strings to be used against interpolation with three variables:

* "<%= modulename %>" - This variable will be interpolated with the value of the htmlModuleTemplate option
* "<%= varname %>" - This variable will be interpolated with the value of the htmlVarTemplate option
* "<%= content %>" - This variable will be interpolated with the content of the HTML file


For example if we would like to specify a custom template that outputs an external module, we could use:

````javascript
//Note: Outputs an external module
grunt.initConfig({
  ts: {
    default: {
      options: {
        //HTML template objects will expose their content via a property called markup.
        htmlVarTemplate: 'markup',
        htmlModuleTemplate: 'html',
		htmlOutputTemplate: '/* tslint:disable:max-line-length */ \n\
          export module <%= modulename %> {\n\
              export var <%= varname %> = \'<%= content %>\';\n\
          }\n'
      }
    }
  }
});
````

we can then do the following in our .ts file:

```typescript
//import the external module
import myTemplate = require('module');

//consume it
var templateString = myTemplate.markup.html

```


If this appears as excessive object wrapping, the simplest form for htmlOutputTemplate is likely:

```javascript
   "export var <%= modulename %>='<%= content %>';"
```

#### Going further
Primarily designed for html files, this feature can be used with any static file.

For example a file called `license.txt`:
```txt
Licensed under the MIT License.
```

Will be compiled to a TypeScript file `license.txt.ts` containing:
```typescript
module test { export var html =  'Licensed under the MIT License.' }
```
