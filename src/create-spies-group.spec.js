import {expect} from 'chai';
import {SpiesGroup, createSpiesGroup} from './create-spies-group.js';

describe('SpiesGroup', function () {
  describe('createSpiesGroup factory', function () {
    it('should return an instance of SpiesGroup', function () {
      const group = createSpiesGroup();
      expect(group).to.be.instanceOf(SpiesGroup);
    });

    it('should initialize with an empty spies array', function () {
      const group = createSpiesGroup();
      expect(group.spies).to.be.an('array').that.is.empty;
    });
  });

  describe('SpiesGroup instance', function () {
    let group;

    beforeEach(function () {
      group = createSpiesGroup();
    });

    describe('.on(target, methodNameOrImpl, customImplForMethod)', function () {
      it('should create a spy using createSpy with the given arguments', function () {
        const targetFn = () => {};
        const customImpl = () => {};
        // шпион для standalone функции
        const fnSpy = group.on(targetFn);
        expect(fnSpy).to.be.a('function');
        // проверка, что это действительно шпион
        expect(fnSpy.callCount).to.equal(0);
        // шпион для standalone функции с кастомной реализацией
        const fnSpyWithImpl = group.on(targetFn, customImpl);
        // вызов для проверки кастомной реализации
        fnSpyWithImpl();
        expect(fnSpyWithImpl.calls[0].returnValue).to.equal(customImpl());
        // шпион для метода объекта
        const obj = {method: () => 'original method'};
        const methodSpy = group.on(obj, 'method');
        // проверка замены метода
        expect(obj.method).to.equal(methodSpy);
        // шпион для метода объекта с кастомной реализацией
        const objWithCustom = {method: () => 'original method 2'};
        const customMethodImpl = () => 'custom method';
        group.on(objWithCustom, 'method', customMethodImpl);
        // проверка вызова кастомной реализации
        expect(objWithCustom.method()).to.equal('custom method');
      });

      it('should add the created spy to the internal spies array', function () {
        const targetFn1 = () => {};
        const targetFn2 = () => {};
        const spy1 = group.on(targetFn1);
        expect(group.spies).to.have.lengthOf(1);
        expect(group.spies[0]).to.equal(spy1);
        const spy2 = group.on(targetFn2);
        expect(group.spies).to.have.lengthOf(2);
        expect(group.spies[1]).to.equal(spy2);
      });

      it('should return the created spy instance', function () {
        const targetFn = () => {};
        const returnedSpy = group.on(targetFn);
        expect(returnedSpy).to.be.a('function');
        // проверка, что это тот же шпион, что и в массиве
        expect(group.spies[0]).to.equal(returnedSpy);
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

        spyObj1 = group.on(obj1, 'method');
        spyFn1 = group.on(standaloneFn1);
        spyObj2 = group.on(obj2, 'method');
        spyFn2 = group.on(standaloneFn2);

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

      it('should call restore() on all spies in the group', function () {
        group.restore();
        // проверка восстановления методов объектов
        expect(obj1.method).to.equal(originalMethod1);
        expect(obj1.method()).to.equal('original1');
        expect(obj2.method).to.equal(originalMethod2);
        expect(obj2.method()).to.equal('original2');
        // проверка сброса истории
        expect(spyObj1.callCount).to.equal(0);
        expect(spyObj1.isCalled).to.be.false;
        expect(spyFn1.callCount).to.equal(0);
        expect(spyFn1.isCalled).to.be.false;
        expect(spyObj2.callCount).to.equal(0);
        expect(spyObj2.isCalled).to.be.false;
        expect(spyFn2.callCount).to.equal(0);
        expect(spyFn2.isCalled).to.be.false;
      });

      it('should clear the internal spies array', function () {
        expect(group.spies).to.have.lengthOf(4);
        group.restore();
        expect(group.spies).to.be.an('array').that.is.empty;
      });

      it('should return the SpiesGroup instance for chaining (if other methods were added)', function () {
        const returnedValue = group.restore();
        expect(returnedValue).to.equal(group);
      });

      it('should be idempotent - calling restore multiple times should not error', function () {
        // первый вызов restore
        group.restore();
        // второй вызов restore
        expect(() => group.restore()).to.not.throw();
        // проверки состояний после второго вызова (должно быть таким же)
        expect(obj1.method).to.equal(originalMethod1);
        expect(spyObj1.callCount).to.equal(0);
        expect(group.spies).to.be.an('array').that.is.empty;
      });

      it('should handle an empty spies array gracefully', function () {
        const emptyGroup = createSpiesGroup();
        expect(() => emptyGroup.restore()).to.not.throw();
        expect(emptyGroup.spies).to.be.an('array').that.is.empty;
      });
    });
  });
});
