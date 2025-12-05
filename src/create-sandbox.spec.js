import {expect} from 'chai';
import {Sandbox, createSandbox} from './create-sandbox.js';

describe('Sandbox', function () {
  describe('createSandbox factory', function () {
    it('should return an instance of Sandbox', function () {
      const sandbox = createSandbox();
      expect(sandbox).to.be.instanceOf(Sandbox);
    });

    it('should initialize with an empty spies array', function () {
      const sandbox = createSandbox();
      expect(sandbox.spies).to.be.an('array').that.is.empty;
    });
  });

  describe('Sandbox instance', function () {
    describe('.on(target, methodNameOrImpl, customImplForMethod)', function () {
      it('should create a spy for a standalone function', function () {
        const sandbox = createSandbox();
        const targetFn = () => {};
        const fnSpy = sandbox.on(targetFn);
        expect(fnSpy).to.be.a('function');
        expect(fnSpy.callCount).to.equal(0);
        expect(fnSpy).to.have.property('calls');
      });

      it('should create a spy for a standalone function with a custom implementation', function () {
        const sandbox = createSandbox();
        const targetFn = () => {};
        const customImpl = () => 'custom result';
        const fnSpy = sandbox.on(targetFn, customImpl);
        fnSpy();
        expect(fnSpy.calls[0].returnValue).to.equal('custom result');
      });

      it('should create a spy for an object method and replace the original method', function () {
        const sandbox = createSandbox();
        const obj = {method: () => 'original method'};
        const methodSpy = sandbox.on(obj, 'method');
        expect(obj.method).to.equal(methodSpy);
        expect(methodSpy).to.be.a('function');
      });

      it('should create a spy for an object method with a custom implementation', function () {
        const sandbox = createSandbox();
        const obj = {method: () => 'original method'};
        const customImpl = () => 'custom method';
        sandbox.on(obj, 'method', customImpl);
        expect(obj.method()).to.equal('custom method');
      });

      it('should add the created spy to the internal spies array', function () {
        const sandbox = createSandbox();
        const targetFn1 = () => {};
        const targetFn2 = () => {};
        const spy1 = sandbox.on(targetFn1);
        expect(sandbox.spies).to.have.lengthOf(1);
        expect(sandbox.spies[0]).to.equal(spy1);
        const spy2 = sandbox.on(targetFn2);
        expect(sandbox.spies).to.have.lengthOf(2);
        expect(sandbox.spies[1]).to.equal(spy2);
      });

      it('should return the created spy instance', function () {
        const sandbox = createSandbox();
        const targetFn = () => {};
        const returnedSpy = sandbox.on(targetFn);
        expect(returnedSpy).to.be.a('function');
        expect(sandbox.spies[0]).to.equal(returnedSpy);
      });
    });

    describe('.restore()', function () {
      it('should restore original methods on objects', function () {
        const sandbox = createSandbox();
        const originalMethod = () => 'original';
        const obj = {method: originalMethod};
        sandbox.on(obj, 'method');
        expect(obj.method).to.not.equal(originalMethod);
        sandbox.restore();
        expect(obj.method).to.equal(originalMethod);
        expect(obj.method()).to.equal('original');
      });

      it('should reset call history for all spies', function () {
        const sandbox = createSandbox();
        const fn = () => {};
        const spy = sandbox.on(fn);
        spy();
        expect(spy.called).to.be.true;
        expect(spy.callCount).to.equal(1);
        sandbox.restore();
        expect(spy.called).to.be.false;
        expect(spy.callCount).to.equal(0);
      });

      it('should clear the internal spies array', function () {
        const sandbox = createSandbox();
        sandbox.on(() => {});
        sandbox.on({m: () => {}}, 'm');
        expect(sandbox.spies).to.have.lengthOf(2);
        sandbox.restore();
        expect(sandbox.spies).to.be.an('array').that.is.empty;
      });

      it('should return the Sandbox instance for chaining', function () {
        const sandbox = createSandbox();
        const returnedValue = sandbox.restore();
        expect(returnedValue).to.equal(sandbox);
      });

      it('should be idempotent (calling restore multiple times does not throw)', function () {
        const sandbox = createSandbox();
        const obj = {method: () => {}};
        sandbox.on(obj, 'method');
        sandbox.restore();
        expect(() => sandbox.restore()).to.not.throw();
      });

      it('should handle an empty spies array gracefully', function () {
        const sandbox = createSandbox();
        expect(() => sandbox.restore()).to.not.throw();
        expect(sandbox.spies).to.be.an('array').that.is.empty;
      });
    });
  });
});
