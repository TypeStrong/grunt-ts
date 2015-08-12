/// <reference path="../defs/tsd.d.ts" />

import * as nodeunit from 'nodeunit';

let grunt: IGrunt = require('grunt');

export var tests : nodeunit.ITestGroup = {

  "Templates Tests": {
    "Processed on Task Properties": (test) => {
        test.ok(false);
        test.done();
    },
    "Processed on Task Options": (test) => {
        test.ok(false);
        test.done();
    },
    "Processed on Target Properties": (test) => {
        test.ok(false);
        test.done();
    },
    "Processed on Target Options": (test) => {
        test.ok(false);
        test.done();
    }
  },

  "Precedence and defaults override Tests": {
    "Task properties should override grunt-ts defaults if not specified on the target": (test) => {
        test.ok(false);
        test.done();
    },
    "Task options should override grunt-ts defaults if not specified in the target options": (test) => {
        test.ok(false);
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


  "Visual Studio `vs` Integration Tests": {
    "Visual Studio properties should override the grunt-ts defaults ONLY": (test) => {
        test.ok(false);
        test.done();
    },
    "If a particular grunt-ts setting is not specified in the gruntfile, and `ignoreSettings` is active, the grunt-ts defaults should be used for that setting": (test) => {
        test.ok(false);
        test.done();
    },
    "Any options specified on the task should override the Visual Studio settings": (test) => {
        test.ok(false);
        test.done();
    },
    "Any 'options' options specified on the task should override the Visual Studio settings": (test) => {
        test.ok(false);
        test.done();
    },
    "Any properties specified on the target should override the Visual Studio settings": (test) => {
        test.ok(false);
        test.done();
    },
    "Any options specified on the target should override the Visual Studio settings": (test) => {
        test.ok(false);
        test.done();
    }
  },

  "tsconfig.json Integration Tests": {
    "todo": (test) => {
        test.ok(false);
        test.done();
    }
  }

};
