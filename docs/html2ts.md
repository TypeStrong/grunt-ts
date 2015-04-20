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

In the task options `htmlTemplate`, `htmlModuleTemplate` and `htmlVarTemplate` you can specify Underscore templates to be used in order to generate the module and variable names for the generated TypeScript.

Those Underscore template receive the following parameters:

 * filename - The html file name without the extension ("test" if the file was named test.html)
 * ext - The html extension without the dot ("html" if the file was named test.html)

Additionally the `htmlTemplate` receives:
 * content - The html file content

The default templates are:

 * 'module <%= modulename %> { export var <%= varname %> =  \'<%= content %>\'; }'
 * "<%= filename %>" - for the module name. (This maintain existing behavior of older versions, and allow controlling the module name by simply renaming the file.)
 * "<%= ext %>" - for the variable name. (This maintain existing behavior of older versions, again allowing to control variable name by renaming the file.)

Usage example is setting the module template to "MyModule.Templates" and the variable template to "<%= filename %>" this will result for the test.html file above with the generated TypeScript
```typescript
module MyModule.Templates { export var test = '<div Some content </div>' }
```
