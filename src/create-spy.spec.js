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
      // проверка генерации ошибки при попытке
      // шпионить за значением null
      expect(() => createSpy(null)).to.throw(
        TypeError,
        'Attempted to spy on null.',
      );
    });

    it('should throw if target is not a function and no method name is given', function () {
      // проверка генерации ошибки для не-функции
      // без указания имени метода
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
      // проверка генерации ошибки, если кастомная
      // реализация для шпиона функции не является функцией
      const targetFn = () => {};
      expect(() => createSpy(targetFn, 'not a function')).to.throw(
        TypeError,
        'When spying on a function, the second argument (custom implementation) must be a function if provided.',
      );
    });

    it('should throw if trying to spy on a non-existent method', function () {
      // проверка генерации ошибки при попытке
      // шпионить за несуществующим методом объекта
      const obj = {};
      expect(() => createSpy(obj, 'nonExistentMethod')).to.throw(
        TypeError,
        'Attempted to spy on a non-existent property: "nonExistentMethod"',
      );
    });

    it('should throw if trying to spy on a non-function property of an object', function () {
      // проверка генерации ошибки при попытке
      // шпионить за свойством объекта, не являющимся функцией
      const obj = {prop: 123};
      expect(() => createSpy(obj, 'prop')).to.throw(
        TypeError,
        'Attempted to spy on "prop" which is not a function. It is a "number".',
      );
    });

    it('should throw if custom implementation for a method spy is not a function', function () {
      // проверка генерации ошибки, если кастомная реализация
      // для шпиона метода не является функцией
      const obj = {method: () => {}};
      expect(() => createSpy(obj, 'method', 'not a function')).to.throw(
        TypeError,
        'When spying on a method, the third argument (custom implementation) must be a function if provided.',
      );
    });
  });

  describe('when spying on a standalone function', function () {
    it('should return a function that is the spy', function () {
      // создание шпиона для пустой функции
      const targetFn = () => {};
      const spy = createSpy(targetFn);
      // проверка того, что шпион
      // является функцией
      expect(spy).to.be.a('function');
    });

    it('should not be called initially', function () {
      // создание шпиона
      const spy = createSpy(function () {});
      // первоначальное состояние свойства isCalled
      expect(spy.isCalled).to.be.false;
      // первоначальное значение счетчика вызовов
      expect(spy.callCount).to.equal(0);
    });

    it('should track calls and arguments', function () {
      // создание шпиона для функции,
      // возвращающей сумму аргументов
      const sum = (a, b) => a + b;
      const spy = createSpy(sum);
      // первый вызов шпиона
      spy(1, 2);
      // второй вызов шпиона
      spy(3, 4);

      // состояние свойства isCalled
      // после вызовов
      expect(spy.isCalled).to.be.true;
      // значение счетчика вызовов
      expect(spy.callCount).to.equal(2);

      // проверка аргументов первого вызова
      expect(spy.calls[0].args).to.deep.equal([1, 2]);
      // проверка аргументов второго вызова
      expect(spy.calls[1].args).to.deep.equal([3, 4]);
    });

    it('should call the original function and return its value by default', function () {
      // создание функции, возвращающей
      // определенное значение
      const originalFn = () => 'original value';
      const spy = createSpy(originalFn);
      // вызов шпиона и сохранение результата
      const result = spy();

      // проверка возвращенного значения
      expect(result).to.equal('original value');
      // проверка того, что шпион был вызван
      expect(spy.isCalled).to.be.true;
    });

    it('should use the custom implementation if provided', function () {
      // создание оригинальной функции и
      // пользовательской реализации
      const originalFn = () => 'original';
      const customImpl = () => 'custom';
      const spy = createSpy(originalFn, customImpl);
      // вызов шпиона и сохранение результата
      const result = spy();

      // проверка того, что возвращено значение
      // из пользовательской реализации
      expect(result).to.equal('custom');
      // проверка свойства isCalled
      expect(spy.isCalled).to.be.true;
    });

    it('should preserve `this` context for the original function', function () {
      // определение объекта с методом, который
      // будет использоваться как target функция
      const contextObj = {val: 10};
      function originalFn() {
        return this.val;
      }
      const spy = createSpy(originalFn);
      // вызов шпиона с привязкой контекста
      const result = spy.call(contextObj);

      // проверка возвращенного значения, которое
      // зависит от контекста this
      expect(result).to.equal(10);
      // проверка сохраненного контекста
      // в информации о вызове
      expect(spy.calls[0].thisArg).to.equal(contextObj);
    });

    it('should preserve `this` context for the custom implementation', function () {
      // определение объекта и пользовательской реализации,
      // использующей контекст this
      const contextObj = {val: 20};
      const originalFn = () => {};
      function customImpl() {
        return this.val;
      }
      const spy = createSpy(originalFn, customImpl);
      // вызов шпиона с привязкой контекста
      const result = spy.call(contextObj);

      // проверка возвращенного значения из
      // пользовательской реализации
      expect(result).to.equal(20);
      // проверка сохраненного контекста
      expect(spy.calls[0].thisArg).to.equal(contextObj);
    });

    it('restore() on a function spy should reset its history and not throw', function () {
      const standaloneFn = () => 'standalone result';
      const fnSpy = createSpy(standaloneFn);
      // вызов шпиона, чтобы у него была история
      fnSpy('call standalone');
      expect(fnSpy.isCalled).to.be.true;
      expect(fnSpy.callCount).to.equal(1);
      expect(fnSpy.calls[0].args).to.deep.equal(['call standalone']);
      // проверка, что вызов restore не вызывает ошибок
      expect(() => fnSpy.restore()).to.not.throw();
      // проверки сброса истории
      expect(fnSpy.callCount).to.equal(0);
      expect(fnSpy.isCalled).to.be.false;
    });
  });

  describe('when spying on an object method', function () {
    // определение объекта и его метода
    // для каждого теста в этом блоке
    let obj;
    let originalMethodImpl; // для проверки восстановления

    beforeEach(function () {
      // это функция, которая будет телом
      // beforeEach, поэтому комментарии здесь уместны
      // инициализация объекта с методом
      // перед каждым тестом
      originalMethodImpl = function (val) {
        return `original: ${this.name} ${val}`;
      };
      obj = {
        name: 'TestObj',
        method: originalMethodImpl,
      };
    });

    it('should replace the original method with the spy', function () {
      // создание шпиона для метода объекта
      const spy = createSpy(obj, 'method');
      // проверка того, что свойство объекта
      // теперь является шпионом
      expect(obj.method).to.equal(spy);
      // проверка того, что шпион является функцией
      expect(obj.method).to.be.a('function');
    });

    it('should call the original method with object context and return its value', function () {
      // создание шпиона для метода
      const spy = createSpy(obj, 'method');
      // вызов подмененного метода
      const result = obj.method('arg1');

      // проверка возвращенного значения
      // от оригинального метода
      expect(result).to.equal('original: TestObj arg1');
      // проверка счетчика вызовов
      expect(spy.callCount).to.equal(1);
      // проверка сохраненного контекста
      expect(spy.calls[0].thisArg).to.equal(obj);
      // проверка сохраненных аргументов
      expect(spy.calls[0].args).to.deep.equal(['arg1']);
    });

    it('should use custom implementation with object context if provided', function () {
      // определение пользовательской реализации
      const customImpl = function (val) {
        return `custom: ${this.name} ${val}`;
      };
      // создание шпиона с пользовательской реализацией
      const spy = createSpy(obj, 'method', customImpl);
      // вызов подмененного метода
      const result = obj.method('argCustom');

      // проверка возвращенного значения
      // от пользовательской реализации
      expect(result).to.equal('custom: TestObj argCustom');
      // проверка счетчика вызовов
      expect(spy.callCount).to.equal(1);
      // проверка сохраненного контекста
      expect(spy.calls[0].thisArg).to.equal(obj);
    });

    it('restore() should put the original method back and reset spy history', function () {
      // создание шпиона для метода
      const spy = createSpy(obj, 'method');
      // вызов шпиона, чтобы у него была история
      obj.method('call before restore');
      expect(spy.isCalled).to.be.true;
      expect(spy.callCount).to.equal(1);
      expect(obj.method).to.equal(spy);
      // вызов метода restore на шпионе
      spy.restore();
      // проверка, что оригинальный метод восстановлен
      expect(obj.method).to.equal(originalMethodImpl);
      // вызов восстановленного метода
      // для проверки его работоспособности
      const result = obj.method('call after restore');
      // проверка результата вызова оригинального метода
      expect(result).to.equal('original: TestObj call after restore');
      // проверки сброса истории
      expect(spy.callCount).to.equal(0);
      expect(spy.isCalled).to.be.false;
    });

    // Этот тест стал частью теста для standalone функции, но если хочешь оставить его здесь для ясности
    // относительно влияния на `obj` (из beforeEach), то можно.
    // Я бы его убрал, т.к. его суть (restore на fnSpy не трогает obj.method)
    // покрывается тем, что fnSpy.restore() вообще не должен иметь дела с obj.
    // Для чистоты, я перенес логику проверки истории в тест для standalone шпиона выше.
    // it('restore() on a function spy should not throw and do nothing to objects', function () {
    //   const fnSpy = createSpy(function () {});
    //   expect(() => fnSpy.restore()).to.not.throw();
    //   expect(obj.method).to.equal(originalMethodImpl); // obj из beforeEach
    // });
  });

  describe('spy properties and methods', function () {
    // объявление шпиона для использования в тестах
    let spy;
    // определение функции, которая
    // будет объектом шпионажа
    const targetFn = (a, b) => {
      if (a === 0) throw new Error('zero error');
      return a + b;
    };

    beforeEach(function () {
      // это функция, которая будет телом
      // beforeEach, поэтому комментарии здесь уместны
      // создание нового шпиона перед
      // каждым тестом в этом блоке
      spy = createSpy(targetFn);
    });

    describe('.calls', function () {
      it('should return an array of CallInfo', function () {
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
        // начальное состояние счетчика вызовов
        expect(spy.callCount).to.equal(0);
        // начальное состояние флага isCalled
        expect(spy.isCalled).to.be.false;
      });

      it('should update after calls', function () {
        // первый вызов шпиона
        spy(1, 1);
        // состояние после первого вызова
        expect(spy.callCount).to.equal(1);
        expect(spy.isCalled).to.be.true;
        // второй вызов шпиона
        spy(2, 2);
        // состояние после второго вызова
        expect(spy.callCount).to.equal(2);
      });
    });
  });
});
