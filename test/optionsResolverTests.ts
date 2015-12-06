/// <reference path="../defs/tsd.d.ts" />

import * as nodeunit from 'nodeunit';
import * as fs from 'fs';
import * as path from 'path';
import * as or from '../tasks/modules/optionsResolver';
import * as tsconfig from '../tasks/modules/tsconfig';
import * as utils from '../tasks/modules/utils';


let grunt: IGrunt = require('grunt');

const config : {[name: string]: IGruntTargetOptions} = {
  "minimalist": <any>{
    src: ["**/*.ts", "!node_modules/**/*.ts"]
  },
  "has ES3 and sourceMap": <any>{
    options: {
      target: 'es3',
      sourceMap: true
    }
  },
  "bad sourceMap capitalization": <any>{
    options: {
      target: 'es3',
      sourcemap: true
    }
  },
  "sourceMap in wrong place": <any>{
    options: {
      target: 'es3'
    },
    sourceMap: true
  },
  "tsconfig in wrong place": <any>{
    options: {
      tsconfig: true
    }
  },
  "tsconfig in wrong place and wrong case": <any>{
    options: {
      TSConfig: true
    }
  },
  "bad sourceMap capitalization in wrong place": <any>{
    options: {
      target: 'es3'
    },
    sourcemap: true
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
  },
  "files minimalist": <any>{
    files: [{
      src: "source/**/*.ts",
      dest: "build"
    }]
  },
  "vs minimalist": <any>{
    vs: "test/vsproj/testproject.csproj"
  },
  "vs ignoreSettings Release": <any>{
    vs: {
      project: "test/vsproj/testproject.csproj",
      config: "Release",
      ignoreSettings: true
    }
  },
  "vs Release": <any>{
    vs: {
      project: "test/vsproj/testproject.csproj",
      config: "Release",
    }
  },
  "vs TestOutFile": <any>{
    vs: {
      project: "test/vsproj/testproject.csproj",
      config: "TestOutFile",
    }
  },
  "tsconfig has true": <any>{
    tsconfig: true
  },
  "tsconfig has specific file": <any>{
    tsconfig: 'test/tsconfig/test_simple_tsconfig.json'
  },
  "tsconfig test exclude": <any>{
    tsconfig: 'test/tsconfig/test_exclude_tsconfig.json'
  },
  "zoo": <any>{
    src: ["test/simple/ts/**/*.ts"]
  },
  "use html templates": <any>{
      options: {
        htmlVarTemplate: 'markup',
        htmlModuleTemplate: 'html',
        htmlOutputTemplate: '/* tslint:disable:max-line-length */ \n\
          export module <%= modulename %> {\n\
              export var <%= varname %> = \'<%= content %>\';\n\
          }\n',
        htmlOutDir: 'html/generated',
        htmlOutDirFlatten: true
      }
  }
};

function getConfig(name: string, asCopy = false) : IGruntTargetOptions {
  if (asCopy) {
    // JSON serialize/deserialize is an easy way to copy rather than reference, but it will
    // omit undefined properties.
    return JSON.parse(JSON.stringify(config[name]));
  }
  return config[name];
}

export var tests : nodeunit.ITestGroup = {

  "Warnings and Errors Tests": {
    "Bad capitalization detected and fixed": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(null, getConfig("bad sourceMap capitalization")).then((result) => {
          let allWarnings = result.warnings.join('\n');
          test.ok(allWarnings.indexOf('Property "sourcemap" in target "" options is incorrectly cased; it should be "sourceMap"') > -1);
          test.strictEqual((<any>result).sourcemap, undefined);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Option in wrong place detected": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolveAsync(null, getConfig("sourceMap in wrong place")).then((result) => {
          let allWarnings = result.warnings.join('\n');
          test.ok(allWarnings.indexOf('Property "sourceMap" in target "" is possibly in the wrong place and will be ignored.  It is expected on the options object.') > -1);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "tsconfig in wrong place detected and warns": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(null, getConfig("tsconfig in wrong place")).then((result) => {
          let allWarnings = result.warnings.join('\n');
          test.ok(allWarnings.indexOf('Property "tsconfig" in target "" is possibly in the wrong place and will be ignored.  It is expected on the task or target, not under options.') > -1);
          test.strictEqual(allWarnings.indexOf('It is also the wrong case and should be tsconfig'),-1, 'expect to not find warning about case.');
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "tsconfig in wrong place and wrong case detected and warns": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(null, getConfig("tsconfig in wrong place and wrong case")).then((result) => {
          let allWarnings = result.warnings.join('\n');
          test.ok(allWarnings.indexOf('Property "TSConfig" in target "" is possibly in the wrong place and will be ignored.  It is expected on the task or target, not under options.') > -1);
          test.ok(allWarnings.indexOf('It is also the wrong case and should be tsconfig') > -1);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});

    },
    "Option in wrong place and wrong case detected": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(null, getConfig("bad sourceMap capitalization in wrong place")).then((result) => {
          let allWarnings = result.warnings.join('\n');
          test.ok(allWarnings.indexOf('Property "sourcemap" in target "" is possibly in the wrong place and will be ignored.  It is expected on the options object.') > -1);
          test.ok(allWarnings.indexOf('It is also the wrong case and should be sourceMap') > -1);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "No warning on target named src that uses files": (test: nodeunit.Test) => {
        test.expect(1);

        const cfg = getConfig("files minimalist", true);
        const fakeTask: any = {src: {}};
        const result = or.resolveAsync(fakeTask, cfg, "src").then((result) => {
          let allWarnings = result.warnings.join('\n');
          test.strictEqual(allWarnings.length, 0, "expected no warnings.");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    }
  },

  "Special processing Tests": {
    "path with spaces gets enclosed in double-quotes": (test: nodeunit.Test) => {
        test.expect(1);
        const result = utils.enclosePathInQuotesIfRequired("this is a path/path.txt");
        test.strictEqual(result, "\"this is a path/path.txt\"");
        test.done();
    },
    "path that is already enclosed in double-quotes is unchanged": (test: nodeunit.Test) => {
      test.expect(1);
      const result = utils.enclosePathInQuotesIfRequired("\"this is a path/path.txt\"");
      test.strictEqual(result, "\"this is a path/path.txt\"");
      test.done();
    },
    "path without spaces is unchanged": (test: nodeunit.Test) => {
      test.expect(1);
      const result = utils.enclosePathInQuotesIfRequired("thisIsAPath/path.txt");
      test.strictEqual(result, "thisIsAPath/path.txt");
      test.done();
    },
    "out with spaces gets escaped with double-quotes": (test: nodeunit.Test) => {
        test.expect(1);
        const files = [getConfig("out has spaces")];
        const result = or.resolveAsync(null, getConfig("out has spaces"), null, files).then((result) => {
          test.strictEqual(result.CompilationTasks[0].out, "\"my folder/out has spaces.js\"");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "outDir with spaces gets escaped with double-quotes": (test: nodeunit.Test) => {
        test.expect(1);
        const files = [getConfig("outDir has spaces")];
        const result = or.resolveAsync(null, getConfig("outDir has spaces"), null, files).then((result) => {
          test.strictEqual(result.CompilationTasks[0].outDir, "\"./my folder\"");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "html features are resolved correctly": (test: nodeunit.Test) => {
        test.expect(5);
        const cfg = getConfig("use html templates");
        const result = or.resolveAsync(null, cfg, null).then((result) => {
          test.strictEqual(result.htmlModuleTemplate, "html");
          test.strictEqual(result.htmlVarTemplate, "markup");
          test.ok(result.htmlOutputTemplate.indexOf('export module <%= modulename %> {\n') > -1);
          test.strictEqual(result.htmlOutDir, "html/generated");
          test.strictEqual(result.htmlOutDirFlatten, true);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
     },
    "On Windows, CRLF is redundant": (test: nodeunit.Test) => {
      test.expect(1);
      const result = utils.newLineIsRedundantForTsc("CRLF", {EOL: "\r\n"});
      test.strictEqual(result, true);
      test.done();
    },
    "On Windows, LF is NOT redundant": (test: nodeunit.Test) => {
      test.expect(1);
      const result = utils.newLineIsRedundantForTsc("LF", {EOL: "\r\n"});
      test.strictEqual(result, false);
      test.done();
    },
    "On UNIX, CRLF is NOT redundant": (test: nodeunit.Test) => {
      test.expect(1);
      const result = utils.newLineIsRedundantForTsc("CRLF", {EOL: "\n"});
      test.strictEqual(result, false);
      test.done();
    },
    "On UNIX, LF is redundant": (test: nodeunit.Test) => {
      test.expect(1);
      const result = utils.newLineIsRedundantForTsc("LF", {EOL: "\n"});
      test.strictEqual(result, true);
      test.done();
    }
  },

  "Precedence and defaults override Tests": {
    "The grunt-ts defaults come through when not specified": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(null, getConfig("minimalist")).then((result) => {
          test.strictEqual(result.target, "es5");
          test.strictEqual(result.fast, "watch");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Task properties should override grunt-ts defaults if not specified on the target": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("minimalist")).then((result) => {
          test.strictEqual(getConfig("minimalist").outDir, undefined);
          test.strictEqual(result.reference, 'ref1.ts');
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Target name is set if specified": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolveAsync(null, getConfig("minimalist"), "MyTarget").then((result) => {
          test.strictEqual(result.targetName, "MyTarget");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Target name is default if not specified": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolveAsync(null, getConfig("minimalist")).then((result) => {
          test.strictEqual(result.targetName, '');
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Task options should override grunt-ts defaults if not specified in the target options": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(getConfig("has ES6 and no sourceMap"), getConfig("minimalist")).then((result) => {
          test.strictEqual(result.target, "es6");
          test.strictEqual(result.sourceMap, false);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Properties specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("reference set to ref2.ts")).then((result) => {
          test.strictEqual(result.reference, "ref2.ts");
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Explicit null specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("reference set to null")).then((result) => {
          test.strictEqual(result.reference, null);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Explicit undefined specified on the target should override anything specified in the task and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(1);
        const files = [getConfig("has outDir set to undefined")];
        const result = or.resolveAsync(getConfig("reference set to ref1.ts"), getConfig("reference set to undefined")).then((result) => {
          test.strictEqual(result.reference, undefined);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Properties on target `options` should override the task options `options` object and the grunt-ts defaults": (test: nodeunit.Test) => {
        test.expect(2);
        const result = or.resolveAsync(getConfig("has ES6 and no sourceMap"), getConfig("has ES3 and sourceMap")).then((result) => {
          test.strictEqual(result.target, "es3");
          test.strictEqual(result.sourceMap, true);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    }
  },

  "Visual Studio `vs` Integration Tests": {
    "Visual Studio properties should override the grunt-ts defaults ONLY": (test: nodeunit.Test) => {
      test.expect(3);
      const cfg = getConfig("vs minimalist", true);
      cfg.options = <any>{sourceMap : false};
      const result = or.resolveAsync(null, cfg).then((result) => {
        test.strictEqual(result.removeComments, false);
        test.strictEqual(result.sourceMap, false);
        test.strictEqual(result.module, 'commonjs');
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    },
    "If a particular grunt-ts setting is not specified in the gruntfile, and `ignoreSettings` is true, the grunt-ts defaults should be used for that setting": (test: nodeunit.Test) => {
      test.expect(1);
      const result = or.resolveAsync(null, getConfig("vs ignoreSettings Release")).then((result) => {
        test.strictEqual(result.sourceMap, true, 'Since this csproj file\'s Release config sets sourceMap as false, if the setting is ignored, the grunt-ts default of true should come through.');
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    },
    "Any options specified on the target should override the Visual Studio settings": (test: nodeunit.Test) => {
      test.expect(1);
      const cfg = getConfig("vs Release", true);
      cfg.outDir = "this is the test outDir";
      const result = or.resolveAsync(null, cfg).then((result) => {
        test.strictEqual(result.CompilationTasks[0].outDir, "this is the test outDir");
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    },
    "Any 'options' options specified on the target should override the Visual Studio settings": (test: nodeunit.Test) => {
      test.expect(1);
      const cfg = getConfig("vs Release", true);
      cfg.options = <any>{removeComments: false};
      const result = or.resolveAsync(null, cfg).then((result) => {
        test.strictEqual(result.removeComments, false);
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    },
    "out in Visual Studio settings is converted from relative to project to relative to gruntfile.": (test: nodeunit.Test) => {
      test.expect(1);
      const result = or.resolveAsync(null, getConfig("vs TestOutFile")).then((result) => {
        test.strictEqual(result.CompilationTasks[0].out, "test/vsproj/test_out.js");
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    },
    "outDir in Visual Studio settings is converted from relative to project to relative to gruntfile.": (test: nodeunit.Test) => {
      test.expect(1);
      const result = or.resolveAsync(null, getConfig("vs minimalist")).then((result) => {
        test.strictEqual(result.CompilationTasks[0].outDir, 'test/vsproj/vsproj_test');
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    },
    "paths to TypeScript files in Visual Studio project are converted from relative to project to relative to gruntfile.": (test: nodeunit.Test) => {
      test.expect(1);
      const result = or.resolveAsync(null, getConfig("vs minimalist")).then((result) => {
        test.strictEqual(result.CompilationTasks[0].src[0], 'test/vsproj/vsprojtest1.ts');
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    }
  },

  "tsconfig.json Integration Tests": {
    setUp: (callback) => {
        let jsonFiles = fs.readdirSync('test/tsconfig_artifact');
        jsonFiles.forEach(file => {
          if (utils.endsWith(file, '.json')) {
            utils.copyFileSync(
              path.join('./test/tsconfig_artifact',file),
              path.join('./test/tsconfig',file)
            );
          };
        });
        callback();
  	},
    "Can get config from a valid file": (test: nodeunit.Test) => {
        test.expect(1);
        const cfg = getConfig("minimalist", true);
        cfg.tsconfig = './test/tsconfig/full_valid_tsconfig.json';
        const result = or.resolveAsync(null, cfg).then((result) => {
          test.ok(true);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "ignoreSettings works": (test: nodeunit.Test) => {
        test.expect(2);
        const cfg = getConfig("minimalist", true);
        cfg.tsconfig = {
          tsconfig: './test/tsconfig/test_simple_tsconfig.json',
          ignoreSettings: true
        };
        const result = or.resolveAsync(null, cfg).then((result) => {
          test.strictEqual(result.target, 'es5');
          test.strictEqual(result.module, undefined);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "Exception from invalid file": (test: nodeunit.Test) => {
        test.expect(1);
        const cfg = getConfig("minimalist", true);
        cfg.tsconfig = './test/tsconfig/invalid_tsconfig.json';
        const result = or.resolveAsync(null, cfg).then((result) => {
          test.ok(false, 'expected exception from invalid file.');
          test.done();
        }).catch((err) => {
          test.ok(err.indexOf('Error parsing') > -1);
          test.done();
        });
    },
    "No exception from blank file":  (test: nodeunit.Test) => {
      test.expect(1);
      const expectedMemo = 'expected blank file to NOT throw an exception (should be treated as contents = {}).';
      const cfg = getConfig("minimalist", true);
      cfg.tsconfig = './test/tsconfig/blank_tsconfig.json';
      const result = or.resolveAsync(null, cfg).then((result) => {
        test.ok(true, expectedMemo);
        test.done();
      }).catch((err) => {
        test.ok(false, expectedMemo);
        test.done();
      });
    },
    "No exception from file with contents {}":  (test: nodeunit.Test) => {
      test.expect(1);
      const cfg = getConfig("minimalist", true);
      cfg.tsconfig = './test/tsconfig/empty_object_literal_tsconfig.json';
      const result = or.resolveAsync(null, cfg, "", null, null, grunt.file.expand).then((result) => {
        test.ok(true);
        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    },
    "Exception from missing file": (test: nodeunit.Test) => {
        test.expect(2);
        const cfg = getConfig("minimalist", true);
        cfg.tsconfig = './test/tsconfig/does_not_exist_tsconfig.json';
        const result = or.resolveAsync(null, cfg).then((result) => {
          test.ok(false, 'expected exception from missing file.');
          test.done();
        }).catch((err) => {
          test.strictEqual(err.code, 'ENOENT');
          test.ok(err.path && err.path.indexOf('does_not_exist_tsconfig.json') > -1)
          test.done();
        });
    },
    "config entries come through appropriately": (test: nodeunit.Test) => {
        test.expect(12);
        const cfg = getConfig("minimalist", true);
        cfg.tsconfig = './test/tsconfig/full_valid_tsconfig.json';

        const result = or.resolveAsync(null, cfg).then((result) => {
          test.strictEqual(result.target, 'es5');
          test.strictEqual(result.module, 'commonjs');
          test.strictEqual(result.declaration, false);
          test.strictEqual(result.noImplicitAny, false);
          test.strictEqual(result.removeComments, false);
          test.strictEqual(result.preserveConstEnums, false);
          test.strictEqual(result.suppressImplicitAnyIndexErrors, true);
          test.strictEqual(result.sourceMap, true);
          test.strictEqual(result.emitDecoratorMetadata, undefined, 'emitDecoratorMetadata is not specified in this tsconfig.json');
          test.strictEqual(result.CompilationTasks.length, 1);
          test.strictEqual(result.CompilationTasks[0].outDir, 'test/tsconfig/files');
          test.strictEqual(result.CompilationTasks[0].out, undefined);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "out comes through with a warning and is NOT remapped relative to Gruntfile.js": (test: nodeunit.Test) => {
        test.expect(5);
        const cfg = getConfig("minimalist", true);
        cfg.tsconfig = './test/tsconfig/test_simple_with_out.json';

        const result = or.resolveAsync(null, cfg).then((result) => {
          test.strictEqual(result.CompilationTasks.length, 1);
          test.strictEqual(result.CompilationTasks[0].out, 'files/this_is_the_out_file.js');
          test.strictEqual(result.CompilationTasks[0].outDir, undefined);
          test.strictEqual(result.warnings.length, 1);
          test.ok(result.warnings[0].indexOf('Using `out` in tsconfig.json can be unreliable') > -1);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "outFile comes through appropriately and is remapped relative to Gruntfile.js": (test: nodeunit.Test) => {
        test.expect(3);
        const cfg = getConfig("minimalist", true);
        cfg.tsconfig = './test/tsconfig/test_simple_with_outFile.json';

        const result = or.resolveAsync(null, cfg).then((result) => {
          test.strictEqual(result.CompilationTasks.length, 1);
          test.strictEqual(result.CompilationTasks[0].out, 'test/tsconfig/files/this_is_the_outFile_file.js');
          test.strictEqual(result.CompilationTasks[0].outDir, undefined);
          test.done();
        }).catch((err) => {test.ifError(err); test.done();});
    },
    "most basic tsconfig with true works": (test: nodeunit.Test) => {
      test.expect(12);
      const result = or.resolveAsync(null, getConfig("tsconfig has true")).then((result) => {

        // NOTE: With tsconfig: true, this depends on the actual grunt-ts tsconfig so technically it could be wrong in the future.
        test.strictEqual((<ITSConfigSupport>result.tsconfig).tsconfig, path.join(path.resolve('.'), 'tsconfig.json'));
        test.strictEqual(result.target, 'es5');
        test.strictEqual(result.module, 'commonjs');
        test.strictEqual(result.declaration, false);
        test.strictEqual(result.noImplicitAny, false);
        test.strictEqual(result.removeComments, false);
        test.strictEqual(result.preserveConstEnums, false);
        test.strictEqual(result.suppressImplicitAnyIndexErrors, true);
        test.strictEqual(result.sourceMap, true);
        test.strictEqual(result.emitDecoratorMetadata, undefined, 'emitDecoratorMetadata is not specified in this tsconfig.json');

        test.ok(result.CompilationTasks[0].src.indexOf('tasks/ts.ts') > -1);
        test.ok(result.CompilationTasks[0].src.indexOf('tasks/modules/compile.ts') > -1);

        test.done();
      }).catch((err) => {test.ifError(err); test.done();});
    }
  },
  "simple tsconfig with file path works": (test: nodeunit.Test) => {
    test.expect(13);
    const result = or.resolveAsync(null, getConfig("tsconfig has specific file")).then((result) => {

      test.strictEqual((<ITSConfigSupport>result.tsconfig).tsconfig, 'test/tsconfig/test_simple_tsconfig.json');
      test.strictEqual(result.target, 'es6');
      test.strictEqual(result.module, 'amd');
      test.strictEqual(result.declaration, true);
      test.strictEqual(result.noImplicitAny, true);
      test.strictEqual(result.removeComments, false);
      test.strictEqual(result.preserveConstEnums, false);
      test.strictEqual(result.suppressImplicitAnyIndexErrors, true);
      test.strictEqual(result.sourceMap, false);
      test.strictEqual(result.emitDecoratorMetadata, true);
      test.strictEqual(result.experimentalDecorators, true);

      test.strictEqual(result.CompilationTasks[0].src.length, 1);
      test.ok(result.CompilationTasks[0].src.indexOf('test/tsconfig/files/validtsconfig.ts') === 0);

      test.done();
    }).catch((err) => {test.ifError(err); test.done();});
  },
  "src appends to files from tsconfig": (test: nodeunit.Test) => {
    test.expect(3);

    const cfg = getConfig("tsconfig has specific file");
    const files: IGruntTSCompilationInfo[] = [{src: ['test/simple/ts/zoo.ts']}];

    const result = or.resolveAsync(null, getConfig("tsconfig has specific file"), null, files).then((result) => {

      test.strictEqual(result.CompilationTasks[0].src.length, 2);
      test.ok(result.CompilationTasks[0].src.indexOf('test/tsconfig/files/validtsconfig.ts') > -1);
      test.ok(result.CompilationTasks[0].src.indexOf('test/simple/ts/zoo.ts') > -1);

      test.done();
    }).catch((err) => {test.ifError(err); test.done();});
  },
  "target settings override tsconfig": (test: nodeunit.Test) => {
    test.expect(2);
    let cfg = getConfig("tsconfig has specific file", true);
    cfg.options.target = 'es3';

    const result = or.resolveAsync(null, cfg).then((result) => {

      test.strictEqual(result.target, 'es3', 'this setting on the grunt-ts target options overrides the tsconfig');
      test.strictEqual(result.removeComments, false,
        'this setting is not specified in the options so tsconfig wins over grunt-ts defaults');

      test.done();
    }).catch((err) => {test.ifError(err); test.done();});
  },
  "If files and exclude, files will be used and exclude will be ignored.": (test: nodeunit.Test) => {
    test.expect(1);
    const result = or.resolveAsync(null, getConfig("tsconfig has specific file")).then((result) => {

      test.ok(result.CompilationTasks[0].src.indexOf('test/tsconfig/otherFiles/other.ts') === -1);

      test.done();
    }).catch((err) => {test.ifError(err); test.done();});
  },
  "if no files, but exclude, *.ts and *.tsx will be included except for the excluded files and folders": (test: nodeunit.Test) => {
    test.expect(3);
    const cfg = getConfig("tsconfig test exclude");
    const result = or.resolveAsync(null, cfg, "", null, null, grunt.file.expand).then((result) => {

      test.ok(result.CompilationTasks[0].src.indexOf('test/tsconfig/otherFiles/other.ts') === 0);
      test.ok(result.CompilationTasks[0].src.indexOf('test/tsconfig/files/validconfig.ts') === -1);

      const resultingTSConfig = utils.readAndParseJSONFromFileSync(<string>cfg.tsconfig);
      test.ok(!('files' in resultingTSConfig), 'expected that grunt-ts would not add a files element.');

      test.done();
    }).catch((err) => {test.ifError(err); test.done();});
  },
  "if no files and no exclude, *.ts and *.tsx will be included and files not added.": (test: nodeunit.Test) => {
    test.expect(3);
    const cfg = getConfig("minimalist", true);
    cfg.tsconfig = './test/tsconfig/empty_object_literal_tsconfig.json';
    const result = or.resolveAsync(null, cfg, "", null, null, grunt.file.expand).then((result) => {

        const resultingTSConfig = utils.readAndParseJSONFromFileSync(<string>cfg.tsconfig);

        test.ok(result.CompilationTasks[0].src.indexOf('test/tsconfig/otherFiles/other.ts') >= 0, 'expected other.ts');
        test.ok(result.CompilationTasks[0].src.indexOf('test/tsconfig/files/validtsconfig.ts') >= 0, 'expexted validconfig.ts');
        test.ok(!('files' in resultingTSConfig), 'expected that grunt-ts would not add a files element.');

        test.done();
    }).catch((err) => {test.ifError(err); test.done();});
  },
  "globs are evaluated and files maintained by default": (test: nodeunit.Test) => {
    test.expect(5);
    const cfg = getConfig("minimalist", true);
    cfg.tsconfig = './test/tsconfig/simple_filesGlob_tsconfig.json';
    const result = or.resolveAsync(null, cfg, "", null, null, grunt.file.expand).then((result) => {

        test.ok(result.CompilationTasks[0].src.indexOf('test/tsconfig/otherFiles/other.ts') >= 0);
        test.ok(result.CompilationTasks[0].src.indexOf('test/tsconfig/files/validtsconfig.ts') >= 0);

        const resultingTSConfig = utils.readAndParseJSONFromFileSync(<string>cfg.tsconfig);

        test.strictEqual(resultingTSConfig.files.length, 2, 'Expected two files.');
        test.ok(resultingTSConfig.files.indexOf('otherFiles/other.ts') >= 0);
        test.ok(resultingTSConfig.files.indexOf('files/validtsconfig.ts') >= 0);

        test.done();
    }).catch((err) => {test.ifError(err); test.done();});
  },
  "option overwriteFilesGlob updates the filesGlob and the new glob results are included": (test: nodeunit.Test) => {
    test.expect(5);
    const cfg = getConfig("zoo", true);
    cfg.tsconfig = {
      tsconfig: './test/tsconfig/simple_filesGlob_tsconfig.json',
      overwriteFilesGlob: true
    };
    const result = or.resolveAsync(null, cfg, "", null, null, grunt.file.expand).then((result) => {

        test.ok(result.CompilationTasks[0].src.indexOf('test/simple/ts/zoo.ts') >= 0, 'expected to find zoo.ts');
        test.strictEqual(result.CompilationTasks[0].src.length, 1);

        const resultingTSConfig = utils.readAndParseJSONFromFileSync((<ITSConfigSupport>cfg.tsconfig).tsconfig);

        test.strictEqual(resultingTSConfig.filesGlob[0],'../simple/ts/**/*.ts');
        test.ok(resultingTSConfig.files.indexOf('../simple/ts/zoo.ts') >= 0);
        test.strictEqual(resultingTSConfig.files.length, 1, 'expected a single item in the files array');

        test.done();
    }).catch((err) => {test.ifError(err); test.done();});
  }

};
