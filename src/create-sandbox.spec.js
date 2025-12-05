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
    let sandbox;

    beforeEach(function () {
      sandbox = createSandbox();
    });

    describe('.on(target, methodNameOrImpl, customImplForMethod)', function () {
      it('should create a spy for a standalone function', function () {
        const targetFn = () => {};
        const fnSpy = sandbox.on(targetFn);
        expect(fnSpy).to.be.a('function');
        expect(fnSpy.callCount).to.equal(0);
        expect(fnSpy).to.have.property('calls');
      });

      it('should create a spy for a standalone function with a custom implementation', function () {
        const targetFn = () => {};
        const customImpl = () => 'custom result';
        const fnSpy = sandbox.on(targetFn, customImpl);
        fnSpy();
        expect(fnSpy.calls[0].returnValue).to.equal('custom result');
      });

      it('should create a spy for an object method and replace the original method', function () {
        const obj = {method: () => 'original method'};
        const methodSpy = sandbox.on(obj, 'method');
        expect(obj.method).to.equal(methodSpy);
        expect(methodSpy).to.be.a('function');
      });

      it('should create a spy for an object method with a custom implementation', function () {
        const obj = {method: () => 'original method'};
        const customImpl = () => 'custom method';
        sandbox.on(obj, 'method', customImpl);
        expect(obj.method()).to.equal('custom method');
      });

      it('should add the created spy to the internal spies array', function () {
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
        const targetFn = () => {};
        const returnedSpy = sandbox.on(targetFn);
        expect(returnedSpy).to.be.a('function');
        expect(sandbox.spies[0]).to.equal(returnedSpy);
      });
    });

    describe('.restore()', function () {
      let obj1, originalMethod1;
      let obj2, originalMethod2;
      let standaloneFn1, standaloneFn2;
      let spyObj1, spyObj2, spyFn1, spyFn2;

      beforeEach(function () {
        originalMethod1 = function () {
          return 'original1';
        };
        obj1 = {method: originalMethod1};

        originalMethod2 = function () {
          return 'original2';
        };
        obj2 = {method: originalMethod2};

        standaloneFn1 = function () {
          return 'standalone1';
        };
        standaloneFn2 = function () {
          return 'standalone2';
        };

        spyObj1 = sandbox.on(obj1, 'method');
        spyFn1 = sandbox.on(standaloneFn1);
        spyObj2 = sandbox.on(obj2, 'method');
        spyFn2 = sandbox.on(standaloneFn2);

        // вызов всех шпионов для наполнения истории
        obj1.method(); // spyObj1
        spyFn1();
        obj2.method(); // spyObj2
        spyFn2();

        expect(spyObj1.callCount).to.equal(1);
        expect(spyFn1.callCount).to.equal(1);
        expect(spyObj2.callCount).to.equal(1);
        expect(spyFn2.callCount).to.equal(1);
      });

      it('should call restore() on all spies in the sandbox', function () {
        sandbox.restore();
        // проверка восстановления методов объектов
        expect(obj1.method).to.equal(originalMethod1);
        expect(obj1.method()).to.equal('original1');
        expect(obj2.method).to.equal(originalMethod2);
        expect(obj2.method()).to.equal('original2');
        // проверка сброса истории
        expect(spyObj1.callCount).to.equal(0);
        expect(spyObj1.called).to.be.false;
        expect(spyFn1.callCount).to.equal(0);
        expect(spyFn1.called).to.be.false;
        expect(spyObj2.callCount).to.equal(0);
        expect(spyObj2.called).to.be.false;
        expect(spyFn2.callCount).to.equal(0);
        expect(spyFn2.called).to.be.false;
      });

      it('should clear the internal spies array', function () {
        expect(sandbox.spies).to.have.lengthOf(4);
        sandbox.restore();
        expect(sandbox.spies).to.be.an('array').that.is.empty;
      });

      it('should return the Sandbox instance for chaining (if other methods were added)', function () {
        const returnedValue = sandbox.restore();
        expect(returnedValue).to.equal(sandbox);
      });

      it('should be idempotent - calling restore multiple times should not error', function () {
        // первый вызов restore
        sandbox.restore();
        // второй вызов restore
        expect(() => sandbox.restore()).to.not.throw();
        // проверки состояний после второго вызова (должно быть таким же)
        expect(obj1.method).to.equal(originalMethod1);
        expect(spyObj1.callCount).to.equal(0);
        expect(sandbox.spies).to.be.an('array').that.is.empty;
      });

      it('should handle an empty spies array gracefully', function () {
        const emptySandbox = createSandbox();
        expect(() => emptySandbox.restore()).to.not.throw();
        expect(emptySandbox.spies).to.be.an('array').that.is.empty;
      });
    });
  });
});
