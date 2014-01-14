# Testing

## Patch Test

A simple suite of tests that only involves checking the output of a set of commands for errors.

1. Clean the project:

        $ grunt clean

2. Compile the project:

        $ tsc tasks/ts.ts --module commonjs --sourcemap

3. Run the standard suite:

        $ grunt ts

    Verify that you see:

    1. a warning on the "warnbothcomments" task
    2. no compile output following the "nocompile" task
    3. an error at the end on the "fail" task.
    4. no errors before the "fail" task.

## Minor Version Upgrade Test

A comprehensive suite of tests that involves glancing at the contents of files.

1-3. Run the Patch Test

4. Verify that amdloader/js/app/loader.js was created

5. Verify that amdloader/js/test/loader.js was created

TODO: Look for other test cases to document here

## Major Version Upgrade Test

TODO: Document this process
