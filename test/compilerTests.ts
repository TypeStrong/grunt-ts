"use strict";
import * as nodeunit from 'nodeunit';
import * as compile from '../tasks/modules/compile';

export const tests : nodeunit.ITestGroup = {
  "grunt-ts `fast` compile feature": {
    "Successful compile with (fast === never) should NOT refresh fast cache": (test: nodeunit.Test) => {
      test.expect(1);
      const options: IGruntTSOptions = <any>{fast: "never"},
        compileResult: ICompileResult = <any>{code: 0},
        result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);

      test.strictEqual(result, false);
      test.done();
    },
    "Successful compile with (fast === always) should refresh fast cache": (test: nodeunit.Test) => {
      test.expect(1);
      const options: IGruntTSOptions = <any>{fast: "always"},
        compileResult: ICompileResult = <any>{code: 0},
        result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);

      test.strictEqual(result, true);
      test.done();
    },
    "Syntax error compile with (fast === never) should NOT refresh fast cache": (test: nodeunit.Test) => {
      test.expect(1);
      const options: IGruntTSOptions = <any>{fast: "never"},
        compileResult: ICompileResult = <any>{code: 1},
        result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);

      test.strictEqual(result, false);
      test.done();
    },
    "Syntax error compile with (fast === always) should NOT refresh fast cache": (test: nodeunit.Test) => {
      test.expect(1);
      const options: IGruntTSOptions = <any>{fast: "always"},
        compileResult: ICompileResult = <any>{code: 1},
        result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);

      test.strictEqual(result, false);
      test.done();
    },
    "Type error compile with (fast === always) and !failOnTypeErrors should refresh fast cache": (test: nodeunit.Test) => {
      test.expect(1);
      const options: IGruntTSOptions = <any>{fast: "always", failOnTypeErrors: false},
        compileResult: ICompileResult = <any>{code: 2},
        result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);

      test.strictEqual(result, true);
      test.done();
    },
    "Type error compile with (fast === always) and failOnTypeErrors should NOT refresh fast cache": (test: nodeunit.Test) => {
      test.expect(1);
      const options: IGruntTSOptions = <any>{fast: "always", failOnTypeErrors: true},
        compileResult: ICompileResult = <any>{code: 2},
        result = compile.compileResultMeansFastCacheShouldBeRefreshed(options, compileResult);

      test.strictEqual(result, false);
      test.done();
    }
  }
};
