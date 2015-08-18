/// <reference path="../defs/tsd.d.ts" />

import * as nodeunit from 'nodeunit';
import * as or from '../tasks/modules/optionsResolver';

let grunt: IGrunt = require('grunt');

const config : {[name: string]: grunt.task.IMultiTask<ITargetOptions>} = {
  "minimalist": <any>{
    src: ["**/*.ts", "!node_modules/**/*.ts"]
  },
  "has ES3 and sourceMap": <any>{
    options: {
      target: 'es3',
      sourceMap: true
    }
  },
  "has ES6 and no sourceMap": <any>{
    options: {
      target: 'es6',
      sourceMap: false
    }
  },
  "has outDir set to ./built": <any>{
    outDir: './built',
    options: {
      target: 'es6',
      sourceMap: false
    }
  },
  "has outDir set to ./myOutDir": <any>{
    outDir: './myOutDir'
  },
  "has outDir set to null": <any>{
    outDir: null
  },
  "has outDir set to undefined": <any>{
    outDir: undefined
  },
  "out has spaces": <any>{
    out: "my folder/out has spaces.js"
  },
  "outDir has spaces": <any>{
    outDir: "./my folder"
  },
  "reference set to ref1.ts": <any>{
    reference: "ref1.ts"
  },
  "reference set to ref2.ts": <any>{
    reference: "ref2.ts"
  },
  "reference set to null": <any>{
    reference: null
  },
  "reference set to undefined": <any>{
    reference: undefined
  }
};



export var tests : nodeunit.ITestGroup = {

  // "Templates Tests": {
  //   "Processed on Task Properties": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "Processed on Task Options": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "Processed on Target Properties": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "Processed on Target Options": (test) => {
  //       test.ok(false);
  //       test.done();
  //   }
  // },

  "Warnings and Errors Tests": {

  },

  "Special processing Tests": {
    "path with spaces gets enclosed in double-quotes": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.escapePathIfRequired("this is a path/path.txt");
        test.strictEqual(result, "\"this is a path/path.txt\"");
        test.done();
    },
    "path that is already enclosed in double-quotes is unchanged": (test: nodeunit.Test) => {
      test.expect(1);
      const result = or.escapePathIfRequired("\"this is a path/path.txt\"");
      test.strictEqual(result, "\"this is a path/path.txt\"");
      test.done();
    },
    "path without spaces is unchanged": (test: nodeunit.Test) => {
      test.expect(1);
      const result = or.escapePathIfRequired("thisIsAPath/path.txt");
      test.strictEqual(result, "thisIsAPath/path.txt");
      test.done();
    },
    "out with spaces gets escaped with double-quotes": (test: nodeunit.Test) => {
        test.expect(1);
        const files = [config["out has spaces"]];
        const result = or.resolve(null, config["out has spaces"], null, files);
        test.strictEqual(result.options.CompilationTasks[0].out, "\"my folder/out has spaces.js\"");
        test.done();
    },
    "outDir with spaces gets escaped with double-quotes": (test: nodeunit.Test) => {
        test.expect(1);
        const files = [config["outDir has spaces"]];
        const result = or.resolve(null, config["outDir has spaces"], null, files);
        test.strictEqual(result.options.CompilationTasks[0].outDir, "\"./my folder\"");
        test.done();
    }
  },



  "Precedence and defaults override Tests": {
    "The grunt-ts defaults come through when not specified": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolve(null, config["minimalist"]);
        test.strictEqual(result.options.target, "es5");
        test.strictEqual(result.options.fast, "watch");
        test.done();
    },
    "Task properties should override grunt-ts defaults if not specified on the target": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolve(config["reference set to ref1.ts"], config["minimalist"]);
        test.strictEqual((config["minimalist"] as any).outDir, undefined);
        test.strictEqual(result.options.reference, 'ref1.ts');
        test.done();
    },
    "Target name is set if specified": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolve(null, config["minimalist"], "MyTarget");
        test.strictEqual(result.options.targetName, "MyTarget");
        test.done();
    },
    "Target name is default if not specified": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolve(null, config["minimalist"]);
        test.strictEqual(result.options.targetName, '');
        test.done();
    },
    "Task options should override grunt-ts defaults if not specified in the target options": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolve(config["has ES6 and no sourceMap"], config["minimalist"]);
        test.strictEqual(result.options.target, "es6");
        test.strictEqual(result.options.sourceMap, false);
        test.done();
    },
    "Properties specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolve(config["reference set to ref1.ts"], config["reference set to ref2.ts"]);
        test.strictEqual(result.options.reference, "ref2.ts");
        test.done();
    },
    "Explicit null specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolve(config["reference set to ref1.ts"], config["reference set to null"], null, []);
        test.strictEqual(result.options.reference, null);
        test.done();
    },
    "Explicit undefined specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const files = [config["has outDir set to undefined"]];
        const result = or.resolve(config["reference set to ref1.ts"], config["reference set to undefined"], null, []);
        test.strictEqual(result.options.reference, undefined);
        test.done();
    },
    "Properties on target `options` should override the task options `options` object and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolve(config["has ES6 and no sourceMap"], config["has ES3 and sourceMap"]);
        test.strictEqual(result.options.target, "es3");
        test.strictEqual(result.options.sourceMap, true);
        test.done();
    }
  },


  // "Visual Studio `vs` Integration Tests": {
  //   "Visual Studio properties should override the grunt-ts defaults ONLY": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "If a particular grunt-ts setting is not specified in the gruntfile, and `ignoreSettings` is active, the grunt-ts defaults should be used for that setting": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "Any options specified on the task should override the Visual Studio settings": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "Any 'options' options specified on the task should override the Visual Studio settings": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "Any properties specified on the target should override the Visual Studio settings": (test) => {
  //       test.ok(false);
  //       test.done();
  //   },
  //   "Any options specified on the target should override the Visual Studio settings": (test) => {
  //       test.ok(false);
  //       test.done();
  //   }
  // },

  // "tsconfig.json Integration Tests": {
  //   "todo": (test) => {
  //       test.ok(false);
  //       test.done();
  //   }
  // }

};
