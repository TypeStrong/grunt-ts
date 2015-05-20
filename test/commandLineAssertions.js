exports.decoratorMetadataPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.emitDecoratorMetadata === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected emitDecoratorMetadata === true";
    });
};
exports.decoratorMetadataNotPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.emitDecoratorMetadata === false) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected emitDecoratorMetadata === false";
    });
};
exports.noEmitPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.noEmit === true) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected noEmit === true";
    });
};
exports.noEmitNotPassed = function (strings, options) {
    return new Promise(function (resolve, reject) {
        if (options.task.noEmit === false) {
            resolve({
                code: 0,
                output: ""
            });
        }
        throw "expected noEmit === false";
    });
};
