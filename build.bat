tsc "./tasks/ts.ts" --sourcemap --module commonjs
REM tsc "./test/test.ts" --sourcemap --module commonjs
REM grunt ts:index
REM grunt nodeunit
grunt ts:fail
REM grunt ts:simple