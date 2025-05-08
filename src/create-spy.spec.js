import {expect} from 'chai';
import {createSpy} from './create-spy.js';

describe('createSpy', function () {
  describe('argument validation', function () {
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
        'Attempted to spy on a object which is not a function.',
      );
      expect(() => createSpy(123)).to.throw(
        TypeError,
        'Attempted to spy on a number which is not a function.',
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
      // первоначальное состояние свойства called
      expect(spy.called).to.be.false;
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

      // состояние свойства called
      // после вызовов
      expect(spy.called).to.be.true;
      // значение счетчика вызовов
      expect(spy.callCount).to.equal(2);

      // проверка аргументов первого вызова
      expect(spy.getCall(0).args).to.deep.equal([1, 2]);
      // проверка аргументов второго вызова
      expect(spy.getCall(1).args).to.deep.equal([3, 4]);
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
      expect(spy.called).to.be.true;
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
      // проверка свойства called
      expect(spy.called).to.be.true;
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
      expect(spy.getCall(0).thisArg).to.equal(contextObj);
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
      expect(spy.getCall(0).thisArg).to.equal(contextObj);
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
      expect(spy.getCall(0).thisArg).to.equal(obj);
      // проверка сохраненных аргументов
      expect(spy.getCall(0).args).to.deep.equal(['arg1']);
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
      expect(spy.getCall(0).thisArg).to.equal(obj);
    });

    it('restore() should put the original method back', function () {
      // создание шпиона для метода
      const spy = createSpy(obj, 'method');
      // проверка, что метод заменен
      expect(obj.method).to.equal(spy);
      // вызов метода restore на шпионе
      spy.restore();
      // проверка, что оригинальный метод восстановлен
      expect(obj.method).to.equal(originalMethodImpl);
      // вызов восстановленного метода
      // для проверки его работоспособности
      const result = obj.method('after restore');
      // проверка результата вызова
      // оригинального метода
      expect(result).to.equal('original: TestObj after restore');
    });

    it('restore() on a function spy should not throw and do nothing to objects', function () {
      // создание шпиона для отдельной функции
      const fnSpy = createSpy(function () {});
      // проверка, что вызов restore
      // не вызывает ошибок
      expect(() => fnSpy.restore()).to.not.throw();
      // проверка, что метод объекта не был изменен,
      // так как шпион не был на нем установлен
      expect(obj.method).to.equal(originalMethodImpl);
    });
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

    describe('.callCount and .called', function () {
      it('should have callCount = 0 and called = false initially', function () {
        // начальное состояние счетчика вызовов
        expect(spy.callCount).to.equal(0);
        // начальное состояние флага called
        expect(spy.called).to.be.false;
      });

      it('should update after calls', function () {
        // первый вызов шпиона
        spy(1, 1);
        // состояние после первого вызова
        expect(spy.callCount).to.equal(1);
        expect(spy.called).to.be.true;
        // второй вызов шпиона
        spy(2, 2);
        // состояние после второго вызова
        expect(spy.callCount).to.equal(2);
      });
    });

    describe('.getCall(n)', function () {
      it('should throw RangeError for out-of-bounds index', function () {
        // проверка для отрицательного индекса
        expect(() => spy.getCall(-1)).to.throw(
          RangeError,
          /Invalid call index -1/,
        );
        // проверка для индекса, равного количеству вызовов (когда вызовов нет)
        expect(() => spy.getCall(0)).to.throw(
          RangeError,
          /Invalid call index 0. Spy has 0 call\(s\)\./,
        );
        spy(1, 1);
        // проверка для индекса, равного количеству вызовов (когда есть один вызов)
        expect(() => spy.getCall(1)).to.throw(
          RangeError,
          /Invalid call index 1. Spy has 1 call\(s\)\./,
        );
        // проверка для индекса, большего количества вызовов
        expect(() => spy.getCall(10)).to.throw(
          RangeError,
          /Invalid call index 10. Spy has 1 call\(s\)\./,
        );
      });

      it('should throw RangeError if index is not a number', function () {
        // проверка для нечислового индекса
        expect(() => spy.getCall('a')).to.throw(
          RangeError,
          /Invalid call index a/,
        );
        expect(() => spy.getCall(null)).to.throw(
          RangeError,
          /Invalid call index null/,
        );
        expect(() => spy.getCall(undefined)).to.throw(
          RangeError,
          /Invalid call index undefined/,
        );
      });

      it('should return call details for a valid index', function () {
        // вызов шпиона с определенными аргументами
        // и контекстом
        const context = {id: 1};
        spy.call(context, 10, 20);
        // получение информации о первом вызове (индекс 0)
        const callInfo = spy.getCall(0);
        // проверка наличия информации о вызове
        expect(callInfo).to.exist;
        // проверка аргументов вызова
        expect(callInfo.args).to.deep.equal([10, 20]);
        // проверка контекста вызова
        expect(callInfo.thisArg).to.equal(context);
        // проверка возвращенного значения
        expect(callInfo.returnValue).to.equal(30);
        // проверка отсутствия ошибки
        expect(callInfo.error).to.be.undefined;
      });

      it('should record error if thrown', function () {
        // попытка вызова, который приведет к ошибке
        try {
          spy(0, 1);
        } catch (e) {
          // ошибка ожидаема
        }
        // получение информации о вызове,
        // завершившемся ошибкой
        const callInfo = spy.getCall(0);
        // проверка наличия ошибки в информации о вызове
        expect(callInfo.error).to.be.instanceOf(Error);
        // проверка сообщения ошибки
        expect(callInfo.error.message).to.equal('zero error');
        // проверка отсутствия возвращенного значения
        expect(callInfo.returnValue).to.be.undefined;
      });
    });

    describe('.calledWith(...args)', function () {
      it('should return true if called with matching arguments (Object.is comparison)', function () {
        // вызов шпиона с разными наборами аргументов
        spy(1, 2);
        spy('a', 'b');
        const objArg = {};
        spy(objArg, null, undefined);
        // проверка совпадения аргументов
        expect(spy.calledWith(1, 2)).to.be.true;
        expect(spy.calledWith('a', 'b')).to.be.true;
        expect(spy.calledWith(objArg, null, undefined)).to.be.true;
      });

      it('should return false if not called with matching arguments', function () {
        // вызов шпиона
        spy(1, 2);
        // проверка с несовпадающими аргументами
        expect(spy.calledWith(1, 3)).to.be.false;
        expect(spy.calledWith(1)).to.be.false;
        expect(spy.calledWith()).to.be.false;
        expect(spy.calledWith(1, 2, 3)).to.be.false;
      });

      it('should return false if never called', function () {
        // проверка для шпиона,
        // который не был вызван
        expect(spy.calledWith(1, 2)).to.be.false;
      });
    });

    describe('.nthCalledWith(n, ...args)', function () {
      it('should return true if nth call had matching arguments', function () {
        // серия вызовов шпиона
        spy(1, 2); // 0-й вызов
        spy('x', 'y'); // 1-й вызов
        // проверка аргументов конкретных вызовов
        expect(spy.nthCalledWith(0, 1, 2)).to.be.true;
        expect(spy.nthCalledWith(1, 'x', 'y')).to.be.true;
      });

      it('should return false if nth call had different arguments', function () {
        // вызов шпиона
        spy(1, 2);
        // проверки для несовпадающих аргументов
        expect(spy.nthCalledWith(0, 1, 3)).to.be.false;
        expect(spy.nthCalledWith(0)).to.be.false;
      });

      it('should throw RangeError if call index is out of bounds', function () {
        spy(1, 2);
        // проверка для несуществующего вызова
        expect(() => spy.nthCalledWith(1, 1, 2)).to.throw(
          RangeError,
          /Invalid call index 1/,
        );
        expect(() => spy.nthCalledWith(-1, 1, 2)).to.throw(
          RangeError,
          /Invalid call index -1/,
        );
      });
    });

    describe('.nthCallReturned(n, returnValue)', function () {
      it('should return true if nth call returned the expected value (Object.is comparison)', function () {
        // серия вызовов
        spy(1, 2); // возвращает 3
        spy(5, 5); // возвращает 10
        const objRet = {};
        const fnWithObjRet = () => objRet;
        const spy2 = createSpy(fnWithObjRet);
        spy2();

        // проверка возвращаемых значений
        expect(spy.nthCallReturned(0, 3)).to.be.true;
        expect(spy.nthCallReturned(1, 10)).to.be.true;
        expect(spy2.nthCallReturned(0, objRet)).to.be.true;
      });

      it('should return false if nth call returned different value or threw', function () {
        // вызов, который вернет значение
        spy(1, 2); // возвращает 3 (0-й вызов)
        // вызов, который вызовет ошибку
        try {
          spy(0, 1); // 1-й вызов
        } catch (e) {
          // бросает ошибку
        }

        // проверки для различных сценариев
        expect(spy.nthCallReturned(0, 4)).to.be.false;
        expect(spy.nthCallReturned(1, undefined)).to.be.false;
      });

      it('should throw RangeError if call index is out of bounds', function () {
        spy(1, 2);
        // проверка для несуществующего вызова
        expect(() => spy.nthCallReturned(1, 3)).to.throw(
          RangeError,
          /Invalid call index 1/,
        );
      });
    });

    describe('.nthCallThrew(n, errorMatcher)', function () {
      it('should return true if nth call threw any error (no matcher)', function () {
        // вызов, приводящий к ошибке
        try {
          spy(0, 1);
        } catch (e) {
          // бросает ошибку
        }
        // проверка факта ошибки
        expect(spy.nthCallThrew(0)).to.be.true;
      });

      it('should return false if nth call did not throw', function () {
        // успешный вызов
        spy(1, 2);
        // проверки
        expect(spy.nthCallThrew(0)).to.be.false;
      });

      it('should throw RangeError if call index is out of bounds', function () {
        spy(1, 2);
        // проверка для несуществующего вызова
        expect(() => spy.nthCallThrew(1)).to.throw(
          RangeError,
          /Invalid call index 1/,
        );
      });

      it('should match error by message (string)', function () {
        // вызов, приводящий к ошибке
        try {
          spy(0, 1);
        } catch (e) {
          // бросает ошибку
        }
        // проверка по сообщению ошибки
        expect(spy.nthCallThrew(0, 'zero error')).to.be.true;
        expect(spy.nthCallThrew(0, 'other error')).to.be.false;
      });

      it('should match error by type (constructor)', function () {
        // вызов, приводящий к ошибке
        try {
          spy(0, 1);
        } catch (e) {
          // бросает ошибку
        }
        // проверка по типу ошибки
        expect(spy.nthCallThrew(0, Error)).to.be.true;
        expect(spy.nthCallThrew(0, TypeError)).to.be.false;
      });

      it('should match error by instance (name and message)', function () {
        // вызов, приводящий к ошибке
        try {
          spy(0, 1);
        } catch (e) {
          // бросает ошибку
        }
        // создание экземпляра ошибки для сравнения
        const expectedError = new Error('zero error');
        const wrongError = new Error('another error');
        const differentType = new TypeError('zero error');
        // проверки
        expect(spy.nthCallThrew(0, expectedError)).to.be.true;
        expect(spy.nthCallThrew(0, wrongError)).to.be.false;
        expect(spy.nthCallThrew(0, differentType)).to.be.false;
      });

      it('should match error by Object.is for direct error object comparison', function () {
        // создание специфической ошибки
        const specificError = new RangeError('specific');
        const fnThrowsSpecific = () => {
          throw specificError;
        };
        const specificSpy = createSpy(fnThrowsSpecific);
        try {
          specificSpy();
        } catch (e) {
          // бросает ошибку
        }
        // проверка по прямому совпадению объекта ошибки
        expect(specificSpy.nthCallThrew(0, specificError)).to.be.true;
        // новый экземпляр не тот же объект, но совпадет по name и message
        expect(specificSpy.nthCallThrew(0, new RangeError('specific'))).to.be
          .true;
      });
    });
  });
});
