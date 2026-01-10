/* eslint-disable jsdoc/require-jsdoc */
import {expect} from 'chai';
import {createSpy} from './create-spy.js';

describe('createSpy', function () {
  describe('argument validation', function () {
    it('should allow to create spy without arguments', function () {
      const spy = createSpy();
      expect(spy).to.be.a('function');
      const res = spy();
      expect(res).to.be.undefined;
      expect(spy.calls).to.have.length(1);
    });

    it('should throw when trying to spy on null', function () {
      expect(() => createSpy(null)).to.throw(
        TypeError,
        'Attempted to spy on null.',
      );
    });

    it('should throw if target is not a function and no method name is given', function () {
      expect(() => createSpy({})).to.throw(
        TypeError,
        'Attempted to spy on a non-function value. To spy on an object method, ' +
          'you must provide the method name as the second argument.',
      );
      expect(() => createSpy(123)).to.throw(
        TypeError,
        'Attempted to spy on a non-function value. To spy on an object method, ' +
          'you must provide the method name as the second argument.',
      );
    });

    it('should throw if custom implementation for a function spy is not a function', function () {
      const targetFn = () => {};
      expect(() => createSpy(targetFn, 'not a function')).to.throw(
        TypeError,
        'When spying on a function, the second argument (custom implementation) must be a function if provided.',
      );
    });

    it('should throw if trying to spy on a non-existent method', function () {
      const obj = {};
      expect(() => createSpy(obj, 'nonExistentMethod')).to.throw(
        TypeError,
        'Attempted to spy on a non-existent property: "nonExistentMethod"',
      );
    });

    it('should throw if trying to spy on a non-function property of an object', function () {
      const obj = {prop: 123};
      expect(() => createSpy(obj, 'prop')).to.throw(
        TypeError,
        'Attempted to spy on "prop" which is not a function. It is a "number".',
      );
    });

    it('should throw if custom implementation for a method spy is not a function', function () {
      const obj = {method: () => {}};
      expect(() => createSpy(obj, 'method', 'not a function')).to.throw(
        TypeError,
        'When spying on a method, the third argument (custom implementation) must be a function if provided.',
      );
    });
  });

  describe('when spying on a standalone function', function () {
    it('should return a function that is the spy', function () {
      const targetFn = () => {};
      const spy = createSpy(targetFn);
      expect(spy).to.be.a('function');
    });

    it('should not be called initially', function () {
      const spy = createSpy(function () {});
      expect(spy.isCalled).to.be.false;
      expect(spy.callCount).to.be.eq(0);
    });

    it('should track calls and arguments', function () {
      const sum = (a, b) => a + b;
      const spy = createSpy(sum);
      spy(1, 2);
      spy(3, 4);
      expect(spy.isCalled).to.be.true;
      expect(spy.callCount).to.be.eq(2);
      expect(spy.calls[0].args).to.deep.equal([1, 2]);
      expect(spy.calls[1].args).to.deep.equal([3, 4]);
    });

    it('should call the original function and return its value by default', function () {
      const originalFn = () => 'original value';
      const spy = createSpy(originalFn);
      const result = spy();
      expect(result).to.be.eq('original value');
      expect(spy.isCalled).to.be.true;
    });

    it('should use the custom implementation if provided', function () {
      const originalFn = () => 'original';
      const customImpl = () => 'custom';
      const spy = createSpy(originalFn, customImpl);
      const result = spy();
      expect(result).to.be.eq('custom');
      expect(spy.isCalled).to.be.true;
    });

    it('should preserve `this` context for the original function', function () {
      const contextObj = {val: 10};
      function originalFn() {
        return this.val;
      }
      const spy = createSpy(originalFn);
      const result = spy.call(contextObj);
      expect(result).to.be.eq(10);
      expect(spy.calls[0].thisArg).to.be.eq(contextObj);
    });

    it('should preserve `this` context for the custom implementation', function () {
      const contextObj = {val: 20};
      const originalFn = () => {};
      function customImpl() {
        return this.val;
      }
      const spy = createSpy(originalFn, customImpl);
      const result = spy.call(contextObj);
      expect(result).to.be.eq(20);
      expect(spy.calls[0].thisArg).to.be.eq(contextObj);
    });

    describe('.restore()', function () {
      it('should reset its history and not throw', function () {
        const standaloneFn = () => 'standalone result';
        const fnSpy = createSpy(standaloneFn);
        fnSpy('call standalone');
        expect(fnSpy.isCalled).to.be.true;
        expect(fnSpy.callCount).to.be.eq(1);
        expect(() => fnSpy.restore()).to.not.throw();
        expect(fnSpy.callCount).to.be.eq(0);
        expect(fnSpy.isCalled).to.be.false;
      });
    });
  });

  describe('when spying on an object method', function () {
    it('should replace the original method with the spy', function () {
      const obj = {method: () => {}};
      const spy = createSpy(obj, 'method');
      expect(obj.method).to.be.eq(spy);
      expect(obj.method).to.be.a('function');
    });

    it('should call the original method with object context and return its value', function () {
      const originalMethodImpl = function (val) {
        return `original: ${this.name} ${val}`;
      };
      const obj = {
        name: 'TestObj',
        method: originalMethodImpl,
      };
      const spy = createSpy(obj, 'method');
      const result = obj.method('arg1');
      expect(result).to.be.eq('original: TestObj arg1');
      expect(spy.callCount).to.be.eq(1);
      expect(spy.calls[0].thisArg).to.be.eq(obj);
      expect(spy.calls[0].args).to.deep.equal(['arg1']);
    });

    it('should use custom implementation with object context if provided', function () {
      const obj = {
        name: 'TestObj',
        method: () => {},
      };
      const customImpl = function (val) {
        return `custom: ${this.name} ${val}`;
      };
      const spy = createSpy(obj, 'method', customImpl);
      const result = obj.method('argCustom');
      expect(result).to.be.eq('custom: TestObj argCustom');
      expect(spy.callCount).to.be.eq(1);
      expect(spy.calls[0].thisArg).to.be.eq(obj);
    });

    describe('.restore()', function () {
      it('should put the original method back and reset spy history', function () {
        const originalMethodImpl = function (val) {
          return `original: ${this.name} ${val}`;
        };
        const obj = {
          name: 'TestObj',
          method: originalMethodImpl,
        };
        const spy = createSpy(obj, 'method');
        obj.method('call before restore');
        expect(spy.isCalled).to.be.true;
        expect(obj.method).to.be.eq(spy);
        spy.restore();
        expect(obj.method).to.be.eq(originalMethodImpl);
        const result = obj.method('call after restore');
        expect(result).to.be.eq('original: TestObj call after restore');
        expect(spy.callCount).to.be.eq(0);
        expect(spy.isCalled).to.be.false;
      });

      it('should restore an "own" property by assigning the original value back', function () {
        const obj = {
          fn: function () {
            return 'own';
          },
        };
        const spy = createSpy(obj, 'fn');
        expect(obj.fn).to.be.eq(spy);
        spy.restore();
        expect(obj.fn()).to.be.eq('own');
        expect(Object.prototype.hasOwnProperty.call(obj, 'fn')).to.be.true;
      });

      it('should restore a prototype method by deleting the spy from the instance', function () {
        class Base {
          method() {
            return 'prototype';
          }
        }
        const instance = new Base();
        expect(Object.prototype.hasOwnProperty.call(instance, 'method')).to.be
          .false;
        const spy = createSpy(instance, 'method');
        expect(Object.prototype.hasOwnProperty.call(instance, 'method')).to.be
          .true;
        expect(instance.method).to.be.eq(spy);
        spy.restore();
        expect(Object.prototype.hasOwnProperty.call(instance, 'method')).to.be
          .false;
        expect(instance.method()).to.be.eq('prototype');
      });
    });
  });

  describe('spy properties and methods', function () {
    it('should have the __isSpy property with true value', function () {
      const spy = createSpy(() => {});
      expect(spy['__isSpy']).to.be.true;
    });

    describe('.calls', function () {
      it('should return an array of CallInfo', function () {
        const targetFn = (a, b) => a + b;
        const spy = createSpy(targetFn);
        expect(spy.calls).to.be.eql([]);
        spy(1, 2);
        expect(spy.calls[0]).to.be.eql({
          args: [1, 2],
          thisArg: undefined,
          returnValue: 3,
          error: undefined,
        });
        spy(5, 3);
        expect(spy.calls[1]).to.be.eql({
          args: [5, 3],
          thisArg: undefined,
          returnValue: 8,
          error: undefined,
        });
        expect(spy.calls).to.have.length(2);
      });
    });

    describe('.callCount and .isCalled', function () {
      it('should have callCount = 0 and isCalled = false initially', function () {
        const spy = createSpy(() => {});
        expect(spy.callCount).to.be.eq(0);
        expect(spy.isCalled).to.be.false;
      });

      it('should update after calls', function () {
        const spy = createSpy(() => {});
        spy(1, 1);
        expect(spy.callCount).to.be.eq(1);
        expect(spy.isCalled).to.be.true;
        spy(2, 2);
        expect(spy.callCount).to.be.eq(2);
      });
    });
  });
});
