REM rmdir .tscache /S /Q
REM grunt update
tsc "./tasks/ts.ts" --sourcemap --module commonjs
REM tsc "./test/test.ts" --sourcemap --module commonjs
REM grunt ts:index
REM grunt nodeunit
REM grunt ts:fail
REM grunt ts:simple
grunt ts:transform