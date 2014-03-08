tsc "./tasks/ts.ts" --sourcemap --module commonjs
tsc "./test/test.ts" --module commonjs
REM grunt ts:index
grunt nodeunit
