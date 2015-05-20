export var decoratorMetadataPassed = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.emitDecoratorMetadata === true) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected emitDecoratorMetadata === true";
  });
};

export var decoratorMetadataNotPassed = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.emitDecoratorMetadata === false) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected emitDecoratorMetadata === false";
  });
};
