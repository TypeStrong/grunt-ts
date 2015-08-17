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
        const result = or.resolve(config["has outDir set to ./built"], config["minimalist"]);
        test.strictEqual((config["minimalist"] as any).outDir, undefined);
        test.strictEqual(result.options.outDir, './built');
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
        const result = or.resolve(config["has outDir set to ./built"], config["has outDir set to ./myOutDir"]);
        test.strictEqual(result.options.outDir, "./myOutDir");
        test.done();
    },
    "Explicit null specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolve(config["has outDir set to ./built"], config["has outDir set to null"]);
        test.strictEqual(result.options.outDir, null);
        test.done();
    },
    "Explicit undefined specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolve(config["has outDir set to ./built"], config["has outDir set to undefined"]);
        test.strictEqual(result.options.outDir, undefined);
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
