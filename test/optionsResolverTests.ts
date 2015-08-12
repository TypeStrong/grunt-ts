/// <reference path="../defs/tsd.d.ts" />

let grunt: IGrunt = require('grunt');

export var tests = {
  processesResolvedTemplates: (test) => {
      test.fail("Should process resolved templates.");
      test.done();
  },
  doesNotProcessOverriddenTemplates: (test) => {
      test.fail("Should not process overridden templates.");
      test.done();
  },
  taskOptionsShouldOverrideDefaultsIfNotSpecifiedOnTarget: (test) => {
      test.fail("Task options should override the grunt-ts defaults.");
      test.done();
  },
  taskOptionsOptionsOverrideDefaultsIfNotSpecifiedOnTargetOptions: (test) => {
      test.fail("Task options 'options' should override the grunt-ts defaults.");
      test.done();
  },
  targetPropertiesShouldOverrideTaskOptionsAndDefaults: (test) => {
      test.fail("Properties specified on the target should override anything specified in the task and the grunt-ts defaults.");
      test.done();
  },
  targetOptionsShouldOverrideTaskOptionsOptionsAndDefaults: (test) => {
      test.fail("Options target should override the task options 'options' object and the grunt-ts defaults.");
      test.done();
  },
};
