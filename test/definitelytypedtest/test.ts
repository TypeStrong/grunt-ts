// <reference path="d.ts\DefinitelyTyped\async\async.d.ts" />

var callback = function(){
    console.log('done');
}

async.parallel([
    function(){ console.log('hi'); },
    function(){ console.log('there'); }
], callback);

