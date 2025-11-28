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
function _parseSpyArgs(target, methodNameOrImpl, customImplForMethod) {
  let originalFn;
  let customImplementation;
  let isMethodSpy = false;
  let objToSpyOn;
  let methodName;
  let hasOwnMethod = false;
  const isLikelyFunctionSpy = typeof target === "function" && customImplForMethod === void 0;
  const isLikelyMethodSpy = typeof target === "object" && target !== null && typeof methodNameOrImpl === "string";
  if (isLikelyFunctionSpy) {
    originalFn = target;
    if (methodNameOrImpl !== void 0) {
      if (typeof methodNameOrImpl !== "function") {
        throw new TypeError(
          "When spying on a function, the second argument (custom implementation) must be a function if provided."
        );
      }
      customImplementation = methodNameOrImpl;
    }
  } else if (isLikelyMethodSpy) {
    methodName = methodNameOrImpl;
    objToSpyOn = target;
    isMethodSpy = true;
    hasOwnMethod = Object.prototype.hasOwnProperty.call(objToSpyOn, methodName);
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
    if (customImplForMethod !== void 0) {
      if (typeof customImplForMethod !== "function") {
        throw new TypeError(
          "When spying on a method, the third argument (custom implementation) must be a function if provided."
        );
      }
      customImplementation = customImplForMethod;
    }
  } else {
    if (target === null && methodNameOrImpl === void 0 && customImplForMethod === void 0) {
      throw new TypeError("Attempted to spy on null.");
    }
    if (methodNameOrImpl === void 0 && typeof target !== "function") {
      throw new TypeError(
        "Attempted to spy on a non-function value. To spy on an object method, you must provide the method name as the second argument."
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
    methodName,
    hasOwnMethod
  };
}
__name(_parseSpyArgs, "_parseSpyArgs");
function createSpy(target = void 0, methodNameOrImpl = void 0, customImplForMethod = void 0) {
  if (typeof target === "undefined" && typeof methodNameOrImpl === "undefined" && typeof customImplForMethod === "undefined") {
    target = /* @__PURE__ */ __name(function() {
    }, "target");
  }
  const {
    originalFn,
    fnToExecute,
    isMethodSpy,
    objToSpyOn,
    methodName,
    hasOwnMethod
  } = _parseSpyArgs(target, methodNameOrImpl, customImplForMethod);
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
  Object.defineProperty(spy, "calls", {
    get: /* @__PURE__ */ __name(() => callLog.calls, "get"),
    enumerable: true,
    configurable: false
  });
  Object.defineProperty(spy, "callCount", {
    get: /* @__PURE__ */ __name(() => callLog.count, "get"),
    enumerable: true,
    configurable: false
  });
  Object.defineProperty(spy, "isCalled", {
    get: /* @__PURE__ */ __name(() => callLog.count > 0, "get"),
    enumerable: true,
    configurable: false
  });
  spy.restore = () => {
    if (isMethodSpy && objToSpyOn) {
      if (originalFn !== void 0) {
        if (hasOwnMethod) {
          objToSpyOn[methodName] = originalFn;
        } else {
          delete objToSpyOn[methodName];
        }
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
var SpiesGroup = class {
  static {
    __name(this, "SpiesGroup");
  }
  /**
   * Spies.
   */
  spies = [];
  /**
   * Создает шпиона для отдельной функции
   * или метода объекта и добавляет его в группу.
   *
   * @param target
   * @param methodNameOrImpl
   * @param customImplForMethod
   */
  on(target, methodNameOrImpl, customImplForMethod) {
    const spy = createSpy(target, methodNameOrImpl, customImplForMethod);
    this.spies.push(spy);
    return spy;
  }
  /**
   * Восстановление всех оригинальных методов объектов,
   * для которых были созданы шпионы в этой группе,
   * и сброс истории вызовов для всех шпионов в группе.
   * Очищает внутренний список шпионов.
   */
  restore() {
    this.spies.forEach((spy) => spy.restore());
    this.spies = [];
    return this;
  }
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
