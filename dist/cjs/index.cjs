"use strict";
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
  chaiSpiesPlugin: () => chaiSpiesPlugin,
  createSpiesGroup: () => createSpiesGroup,
  createSpy: () => createSpy
});
module.exports = __toCommonJS(index_exports);

// src/chai/chai-spies-plugin.js
function chaiSpiesPlugin(chai, _) {
  const Assertion = chai.Assertion;
  Assertion.addProperty("spy", function() {
    this.assert(
      this._obj.__isSpy === true,
      "expected " + this._obj + " to be a spy",
      "expected " + this._obj + " to not be a spy"
    );
    return this;
  });
  function assertCalled(n) {
    new Assertion(this._obj).to.be.spy;
    const spy = this._obj;
    if (n != void 0) {
      this.assert(
        spy.calls.length === n,
        "expected " + this._obj + " to have been called #{exp} but got #{act}",
        "expected " + this._obj + " to have not been called #{exp}",
        n,
        spy.calls.length
      );
    } else {
      this.assert(
        spy.called === true,
        "expected " + this._obj + " to have been called",
        "expected " + this._obj + " to not have been called"
      );
    }
  }
  __name(assertCalled, "assertCalled");
  function assertCalledChain() {
    new Assertion(this._obj).to.be.spy;
  }
  __name(assertCalledChain, "assertCalledChain");
  Assertion.addChainableMethod("called", assertCalled, assertCalledChain);
  Assertion.addProperty("once", function() {
    new Assertion(this._obj).to.be.spy;
    this.assert(
      this._obj.calls.length === 1,
      "expected " + this._obj + " to have been called once but got #{act}",
      "expected " + this._obj + " to not have been called once",
      1,
      this._obj.calls.length
    );
  });
  Assertion.addProperty("twice", function() {
    new Assertion(this._obj).to.be.spy;
    this.assert(
      this._obj.calls.length === 2,
      "expected " + this._obj + " to have been called twice but got #{act}",
      "expected " + this._obj + " to not have been called twice",
      2,
      this._obj.calls.length
    );
  });
  function nthCallWith(spy, n, expArgs) {
    if (spy.calls.length <= n) return false;
    const actArgs = spy.calls[n].args;
    if (actArgs.length !== expArgs.length) return false;
    for (let i = 0; i < expArgs.length; i++) {
      if (!_.eql(actArgs[i], expArgs[i])) {
        return false;
      }
    }
    return true;
  }
  __name(nthCallWith, "nthCallWith");
  function numberOfCallsWith(spy, expArgs) {
    let found = 0;
    const calls = spy.calls;
    for (let i = 0; i < calls.length; i++) {
      if (nthCallWith(spy, i, expArgs)) {
        found++;
      }
    }
    return found;
  }
  __name(numberOfCallsWith, "numberOfCallsWith");
  Assertion.addProperty("first", function() {
    if (this._obj.__isSpy) {
      _.flag(this, "spy nth call with", 1);
    }
  });
  Assertion.addProperty("second", function() {
    if (this._obj.__isSpy) {
      _.flag(this, "spy nth call with", 2);
    }
  });
  Assertion.addProperty("third", function() {
    if (this._obj.__isSpy) {
      _.flag(this, "spy nth call with", 3);
    }
  });
  Assertion.addProperty("on");
  Assertion.addChainableMethod("nth", function(n) {
    if (this._obj.__isSpy) {
      _.flag(this, "spy nth call with", n);
    }
  });
  function generateOrdinalNumber(n) {
    if (n === 1) return "first";
    if (n === 2) return "second";
    if (n === 3) return "third";
    return n + "th";
  }
  __name(generateOrdinalNumber, "generateOrdinalNumber");
  function assertWith() {
    new Assertion(this._obj).to.be.spy;
    const expArgs = [].slice.call(arguments, 0), spy = this._obj, calls = spy.calls, always = _.flag(this, "spy always"), nthCall = _.flag(this, "spy nth call with");
    if (always) {
      const passed = numberOfCallsWith(spy, expArgs);
      this.assert(
        arguments.length ? calls.length && passed === calls.length : calls.length === 0,
        "expected " + this._obj + " to have been always called with #{exp} but got " + passed + " out of " + calls.length,
        "expected " + this._obj + " to have not always been called with #{exp}",
        expArgs
      );
    } else if (nthCall) {
      const ordinalNumber = generateOrdinalNumber(nthCall), actArgs = calls[nthCall - 1];
      new Assertion(this._obj).to.be.have.been.called.min(nthCall);
      this.assert(
        nthCallWith(spy, nthCall - 1, expArgs),
        "expected " + this._obj + " to have been called at the " + ordinalNumber + " time with #{exp} but got #{act}",
        "expected " + this._obj + " to have not been called at the " + ordinalNumber + " time with #{exp}",
        expArgs,
        actArgs
      );
    } else {
      const passed = numberOfCallsWith(spy, expArgs);
      this.assert(
        passed > 0,
        "expected " + this._obj + " to have been called with #{exp}",
        "expected " + this._obj + " to have not been called with #{exp} but got " + passed + " times",
        expArgs
      );
    }
  }
  __name(assertWith, "assertWith");
  function assertWithChain() {
    if (this._obj.__isSpy) {
      _.flag(this, "spy with", true);
    }
  }
  __name(assertWithChain, "assertWithChain");
  Assertion.addChainableMethod("with", assertWith, assertWithChain);
  Assertion.addProperty("always", function() {
    if (this._obj.__isSpy) {
      _.flag(this, "spy always", true);
    }
  });
  Assertion.addMethod("exactly", function() {
    new Assertion(this._obj).to.be.spy;
    const args = [].slice.call(arguments, 0);
    this.assert(
      this._obj.calls.length === args[0],
      "expected " + this._obj + " to have been called #{exp} times but got #{act}",
      "expected " + this._obj + " to not have been called #{exp} times",
      args[0],
      this._obj.calls.length
    );
  });
  function above(_super) {
    return function(n) {
      if (this._obj.__isSpy) {
        new Assertion(this._obj).to.be.spy;
        this.assert(
          this._obj.calls.length > n,
          "expected " + this._obj + " to have been called more than #{exp} times but got #{act}",
          "expected " + this._obj + " to have been called at most #{exp} times but got #{act}",
          n,
          this._obj.calls.length
        );
      } else {
        _super.apply(this, arguments);
      }
    };
  }
  __name(above, "above");
  Assertion.overwriteMethod("above", above);
  Assertion.overwriteMethod("gt", above);
  function below(_super) {
    return function(n) {
      if (this._obj.__isSpy) {
        new Assertion(this._obj).to.be.spy;
        this.assert(
          this._obj.calls.length < n,
          "expected " + this._obj + " to have been called fewer than #{exp} times but got #{act}",
          "expected " + this._obj + " to have been called at least #{exp} times but got #{act}",
          n,
          this._obj.calls.length
        );
      } else {
        _super.apply(this, arguments);
      }
    };
  }
  __name(below, "below");
  Assertion.overwriteMethod("below", below);
  Assertion.overwriteMethod("lt", below);
  function min(_super) {
    return function(n) {
      if (this._obj.__isSpy) {
        new Assertion(this._obj).to.be.spy;
        this.assert(
          this._obj.calls.length >= n,
          "expected " + this._obj + " to have been called at least #{exp} times but got #{act}",
          "expected " + this._obj + " to have been called fewer than #{exp} times but got #{act}",
          n,
          this._obj.calls.length
        );
      } else {
        _super.apply(this, arguments);
      }
    };
  }
  __name(min, "min");
  Assertion.overwriteMethod("min", min);
  Assertion.overwriteMethod("least", min);
  function max(_super) {
    return function(n) {
      if (this._obj.__isSpy) {
        new Assertion(this._obj).to.be.spy;
        this.assert(
          this._obj.calls.length <= n,
          "expected " + this._obj + " to have been called at most #{exp} times but got #{act}",
          "expected " + this._obj + " to have been called more than #{exp} times but got #{act}",
          n,
          this._obj.calls.length
        );
      } else {
        _super.apply(this, arguments);
      }
    };
  }
  __name(max, "max");
  Assertion.overwriteMethod("max", max);
  Assertion.overwriteMethod("most", max);
}
__name(chaiSpiesPlugin, "chaiSpiesPlugin");

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
  Object.defineProperty(spy, "called", {
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
  spy.__isSpy = true;
  return spy;
}
__name(createSpy, "createSpy");

// src/create-spies-group.js
var _SpiesGroup = class _SpiesGroup {
  /**
   * Constructor.
   */
  constructor() {
    this.spies = [];
  }
  /**
   * Создает шпиона для отдельной функции
   * или метода объекта и добавляет его в группу.
   *
   * @param {Function|object} [target]
   * @param {Function|string} [methodNameOrImpl]
   * @param {Function} [customImplForMethod]
   * @returns {Function}
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
   *
   * @returns {this}
   */
  restore() {
    this.spies.forEach((spy) => spy.restore());
    this.spies = [];
    return this;
  }
};
__name(_SpiesGroup, "SpiesGroup");
var SpiesGroup = _SpiesGroup;
function createSpiesGroup() {
  return new SpiesGroup();
}
__name(createSpiesGroup, "createSpiesGroup");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SpiesGroup,
  chaiSpiesPlugin,
  createSpiesGroup,
  createSpy
});
