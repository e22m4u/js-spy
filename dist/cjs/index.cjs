var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  SpiesGroup: () => SpiesGroup,
  createSpiesGroup: () => createSpiesGroup,
  createSpy: () => createSpy
});
module.exports = __toCommonJS(index_exports);

// src/create-spy.js
function _parseSpyArgs(target, methodNameOrImplFromSpy, customImplForMethodFromSpy) {
  let originalFn;
  let customImplementation;
  let isMethodSpy = false;
  let objToSpyOn;
  let methodName;
  const isLikelyFunctionSpy = typeof target === "function" && customImplForMethodFromSpy === void 0;
  const isLikelyMethodSpy = typeof target === "object" && target !== null && typeof methodNameOrImplFromSpy === "string";
  if (isLikelyFunctionSpy) {
    originalFn = target;
    if (methodNameOrImplFromSpy !== void 0) {
      if (typeof methodNameOrImplFromSpy !== "function") {
        throw new TypeError(
          "When spying on a function, the second argument (custom implementation) must be a function if provided."
        );
      }
      customImplementation = methodNameOrImplFromSpy;
    }
  } else if (isLikelyMethodSpy) {
    methodName = methodNameOrImplFromSpy;
    objToSpyOn = target;
    isMethodSpy = true;
    if (!(methodName in target)) {
      throw new TypeError(
        `Attempted to spy on a non-existent property: "${methodName}"`
      );
    }
    const propertyToSpyOn = target[methodName];
    if (typeof propertyToSpyOn !== "function") {
      throw new TypeError(
        `Attempted to spy on "${methodName}" which is not a function. It is a "${typeof propertyToSpyOn}".`
      );
    }
    originalFn = propertyToSpyOn;
    if (customImplForMethodFromSpy !== void 0) {
      if (typeof customImplForMethodFromSpy !== "function") {
        throw new TypeError(
          "When spying on a method, the third argument (custom implementation) must be a function if provided."
        );
      }
      customImplementation = customImplForMethodFromSpy;
    }
  } else {
    if (target === null && methodNameOrImplFromSpy === void 0 && customImplForMethodFromSpy === void 0) {
      throw new TypeError("Attempted to spy on null.");
    }
    if (methodNameOrImplFromSpy === void 0 && typeof target !== "function") {
      throw new TypeError(
        `Attempted to spy on a ${typeof target} which is not a function.`
      );
    }
    throw new Error(
      "Invalid arguments. Valid signatures:\n  createSpy(function, [customImplementationFunction])\n  createSpy(object, methodNameString, [customImplementationFunction])"
    );
  }
  return {
    originalFn,
    // определение функции для выполнения шпионом: либо
    // пользовательская реализация, либо оригинальная функция
    fnToExecute: customImplementation || originalFn,
    isMethodSpy,
    objToSpyOn,
    methodName
  };
}
__name(_parseSpyArgs, "_parseSpyArgs");
function createSpy(target, methodNameOrImpl, customImplForMethod) {
  const { originalFn, fnToExecute, isMethodSpy, objToSpyOn, methodName } = _parseSpyArgs(target, methodNameOrImpl, customImplForMethod);
  const callLog = {
    count: 0,
    calls: []
  };
  const spy = /* @__PURE__ */ __name(function(...args) {
    callLog.count++;
    const callInfo = {
      // сохранение аргументов, с которыми
      // был вызван шпион
      args: [...args],
      // сохранение контекста (this)
      // вызова шпиона
      thisArg: this,
      returnValue: void 0,
      error: void 0
    };
    try {
      callInfo.returnValue = fnToExecute.apply(this, args);
      callLog.calls.push(callInfo);
      return callInfo.returnValue;
    } catch (e) {
      callInfo.error = e;
      callLog.calls.push(callInfo);
      throw e;
    }
  }, "spy");
  Object.defineProperty(spy, "callCount", {
    get: /* @__PURE__ */ __name(() => callLog.count, "get"),
    enumerable: true,
    configurable: false
  });
  Object.defineProperty(spy, "called", {
    get: /* @__PURE__ */ __name(() => callLog.count > 0, "get"),
    enumerable: true,
    configurable: false
  });
  spy.getCall = (n) => {
    if (typeof n !== "number" || n < 0 || n >= callLog.calls.length) {
      throw new RangeError(
        `Invalid call index ${n}. Spy has ${callLog.calls.length} call(s).`
      );
    }
    return callLog.calls[n];
  };
  spy.calledWith = (...expectedArgs) => {
    return callLog.calls.some(
      (call) => call.args.length === expectedArgs.length && call.args.every((arg, i) => Object.is(arg, expectedArgs[i]))
    );
  };
  spy.nthCalledWith = (n, ...expectedArgs) => {
    const call = spy.getCall(n);
    return call.args.length === expectedArgs.length && call.args.every((arg, i) => Object.is(arg, expectedArgs[i]));
  };
  spy.nthCallReturned = (n, expectedReturnValue) => {
    const call = spy.getCall(n);
    if (call.error) return false;
    return Object.is(call.returnValue, expectedReturnValue);
  };
  spy.nthCallThrew = (n, expectedError) => {
    const call = spy.getCall(n);
    if (call.error === void 0) return false;
    if (expectedError === void 0) return true;
    if (call.error === expectedError) return true;
    if (typeof expectedError === "string") {
      return call.error && typeof call.error.message === "string" && call.error.message === expectedError;
    }
    if (typeof expectedError === "function" && call.error instanceof expectedError) {
      return true;
    }
    if (expectedError instanceof Error && call.error instanceof Error) {
      return call.error.name === expectedError.name && call.error.message === expectedError.message;
    }
    return Object.is(call.error, expectedError);
  };
  spy.restore = () => {
    if (isMethodSpy && objToSpyOn) {
      if (originalFn !== void 0) {
        objToSpyOn[methodName] = originalFn;
      }
    }
    callLog.count = 0;
    callLog.calls = [];
  };
  if (isMethodSpy && objToSpyOn) {
    objToSpyOn[methodName] = spy;
  }
  return spy;
}
__name(createSpy, "createSpy");

// src/create-spies-group.js
function SpiesGroup() {
  this.spies = [];
}
__name(SpiesGroup, "SpiesGroup");
SpiesGroup.prototype.on = function(target, methodNameOrImpl, customImplForMethod) {
  const spy = createSpy(target, methodNameOrImpl, customImplForMethod);
  this.spies.push(spy);
  return spy;
};
SpiesGroup.prototype.restore = function() {
  this.spies.forEach((spy) => spy.restore());
  this.spies = [];
  return this;
};
function createSpiesGroup() {
  return new SpiesGroup();
}
__name(createSpiesGroup, "createSpiesGroup");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SpiesGroup,
  createSpiesGroup,
  createSpy
});
