/// <reference path="../../defs/tsd.d.ts"/>

import _ = require('underscore');
import _str = require('underscore.string');
import path = require('path');
import fs = require('fs');

// setup from grunt-ts 
export var grunt: IGrunt;

/////////////////////////////////////////////////////////////////////
// index : used to make external modules access easier
////////////////////////////////////////////////////////////////////
export function indexDirectory(destFolder: string) {

    // create an index directory if not already there: 
    if (!fs.existsSync(path.join(destFolder, 'index'))) {
        // Create this directory 
    }
    else {
        // empty this directory
    }

}