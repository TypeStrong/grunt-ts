'use strict';
var es6_promise_1 = require('es6-promise');
var fs = require('fs');
var stripBom = require('strip-bom');
function resolveAsync(projectFile) {
    return new es6_promise_1.Promise(function (resolve, reject) {
        try {
            var projectFileTextContent = fs.readFileSync(projectFile, 'utf8');
        }
        catch (ex) {
            if (ex && ex.code === 'ENOENT') {
                reject('Could not find file "' + projectFile + '".');
            }
            else if (ex && ex.errno) {
                reject('Error ' + ex.errno + ' reading "' + projectFile + '".');
            }
            else {
                reject('Error reading "' + projectFile + '": ' + JSON.stringify(ex));
            }
            reject(ex);
        }
        try {
            var projectSpec = JSON.parse(stripBom(projectFileTextContent));
        }
        catch (ex) {
            reject('Error parsing "' + projectFile + '".  It may not be valid JSON in UTF-8.');
        }
        var spec = getCompilerOptions(projectSpec);
        resolve(spec);
    });
}
exports.resolveAsync = resolveAsync;
function getCompilerOptions(projectSpec) {
    var result = {};
    var co = projectSpec.compilerOptions;
    var tsconfigMappingToGruntTSProperty = ['declaration', 'emitDecoratorMetadata',
        'experimentalDecorators', 'isolatedModules',
        'inlineSourceMap', 'inlineSources', 'mapRoot', 'module', 'newLine', 'noEmit',
        'noEmitHelpers', 'noEmitOnError', 'noImplicitAny', 'noLib', 'noResolve',
        'out', 'outDir', 'preserveConstEnums', 'removeComments', 'sourceMap',
        'sourceRoot', 'suppressImplicitAnyIndexErrors', 'target'];
    tsconfigMappingToGruntTSProperty.forEach(function (propertyName) {
        if (propertyName in co) {
            result[propertyName] = co[propertyName];
        }
    });
    return result;
}
//# sourceMappingURL=tsconfig.js.map