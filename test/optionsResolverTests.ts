/// <reference path="../defs/tsd.d.ts" />

import * as nodeunit from 'nodeunit';
import * as or from '../tasks/modules/optionsResolver';
let grunt: IGrunt = require('grunt');

const config : {[name: string]: grunt.task.IMultiTask<ITargetOptions>} = {
  "minimalist": <any>{
    src: ["**/*.ts", "!node_modules/**/*.ts"]
  },
  "hasES3SourceMaps": <any>{
    options: {
      target: 'es3',
      sourceMap: true
    }
  },
  "hasES6AndNoSourceMaps": <any>{
    options: {
      target: 'es6',
      sourceMap: false
    }
  },
  "has outDir set": <any>{
    outDir: './built',
    options: {
      target: 'es6',
      sourceMap: false
    }
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

  "Precedence and defaults override Tests": {
    "Minimalist config works": (test: nodeunit.Test) => {
        test.expect(2);
        let result = or.resolve(null, config["minimalist"]);
        test.strictEqual(result.options.target, "es5");
        test.strictEqual(result.options.fast, "watch");
        test.done();
    },
    "Task properties should override grunt-ts defaults if not specified on the target": (test: nodeunit.Test) => {
        test.expect(2);
        let result = or.resolve(config["has outDir set"], config["minimalist"]);
        test.strictEqual((config["minimalist"] as any).outDir, undefined);
        test.strictEqual(result.options.outDir, './built');
        test.done();
    },
    "Task options should override grunt-ts defaults if not specified in the target options": (test) => {
      test.expect(2);
      let result = or.resolve(config["hasES6AndNoSourceMaps"], config["minimalist"]);
      test.strictEqual(result.options.target, "es6");
      test.strictEqual(result.options.sourceMap, false);
      test.done();
    },
    "Properties specified on the target should override anything specified in the task and the grunt-ts defaults": (test) => {
        test.ok(false);
        test.done();
    },
    "Options target should override the task options 'options' object and the grunt-ts defaults": (test) => {
        test.ok(false);
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
