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

export var noEmitPassed = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.noEmit === true) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected noEmit === true";
  });
};


export var noEmitNotPassed = (strings, options) => {
  return new Promise(function(resolve, reject) {
    if (options.task.noEmit === false) {
      resolve({
        code: 0,
        output: ""
      });
    }
    throw "expected noEmit === false";
  });
};
