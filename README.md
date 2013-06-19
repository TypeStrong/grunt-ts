grunt-ts
================
A written from scratch TypeScript compiler task for GruntJS. 

It differs from grunt-typescript and grunt-type in *two key ways*: 

- This is written in TypeScript 0.9 
- It is super easy to extend and update 
 - it simply uses tsc on the commandline.
 - Super short and clear typescript code. 

Compiles all files. Stops on a compilation error reporting it on the console. Makes for easier reading. 

## Documentation
You'll need to install `grunt-ts` first:

    npm install grunt-ts

Then modify your `grunt.js` file by adding the following line:

    grunt.loadNpmTasks('grunt-ts');

Then add some configuration for the plugin like so:

    grunt.initConfig({
        ...
        ts: {
          base: {
            src: ['path/to/typescript/files/**/*.ts']            
          }
        },
        ...
    });
   
