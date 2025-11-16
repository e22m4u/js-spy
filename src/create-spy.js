/**
 * Вспомогательная функция для разбора аргументов createSpy.
 *
 * @private
 */
function _parseSpyArgs(
  target,
  methodNameOrImplFromSpy,
  customImplForMethodFromSpy,
) {
  // объявление переменных для хранения
  // состояния и результатов разбора аргументов
  let originalFn;
  let customImplementation;
  let isMethodSpy = false;
  let objToSpyOn;
  let methodName;
  // определение вероятности того, что
  // создается шпион для отдельной функции
  const isLikelyFunctionSpy =
    typeof target === 'function' && customImplForMethodFromSpy === undefined;
  // определение вероятности того, что
  // создается шпион для метода объекта
  const isLikelyMethodSpy =
    typeof target === 'object' &&
    target !== null &&
    typeof methodNameOrImplFromSpy === 'string';
  // обработка сценария шпионажа
  // за отдельной функцией
  if (isLikelyFunctionSpy) {
    // исходная функция - это первый аргумент
    originalFn = target;
    // проверка наличия второго аргумента, который
    // может быть пользовательской реализацией
    if (methodNameOrImplFromSpy !== undefined) {
      // генерация ошибки, если второй аргумент
      // (пользовательская реализация) не является функцией
      if (typeof methodNameOrImplFromSpy !== 'function') {
        throw new TypeError(
          'When spying on a function, the second argument (custom ' +
            'implementation) must be a function if provided.',
        );
      }
      // пользовательская реализация присваивается,
      // если она предоставлена и является функцией
      customImplementation = methodNameOrImplFromSpy;
    }
    // обработка сценария шпионажа
    // за методом объекта
  } else if (isLikelyMethodSpy) {
    // установка параметров для
    // шпионажа за методом
    methodName = methodNameOrImplFromSpy;
    objToSpyOn = target;
    isMethodSpy = true;
    // генерация ошибки, если метод
    // с указанным именем отсутствует на объекте
    if (!(methodName in target)) {
      throw new TypeError(
        `Attempted to spy on a non-existent property: "${methodName}"`,
      );
    }
    // получение свойства объекта,
    // за которым предполагается шпионаж
    const propertyToSpyOn = target[methodName];
    // генерация ошибки, если свойство,
    // за которым шпионят, не является функцией
    if (typeof propertyToSpyOn !== 'function') {
      throw new TypeError(
        `Attempted to spy on "${methodName}" which is not a function. ` +
          `It is a "${typeof propertyToSpyOn}".`,
      );
    }
    // исходная функция - это
    // метод объекта
    originalFn = propertyToSpyOn;
    // проверка наличия третьего аргумента, который может
    // быть пользовательской реализацией для метода
    if (customImplForMethodFromSpy !== undefined) {
      // генерация ошибки, если третья (пользовательская
      // реализация метода) не является функцией
      if (typeof customImplForMethodFromSpy !== 'function') {
        throw new TypeError(
          'When spying on a method, the third argument (custom ' +
            'implementation) must be a function if provided.',
        );
      }
      // пользовательская реализация метода присваивается,
      // если она предоставлена и является функцией
      customImplementation = customImplForMethodFromSpy;
    }
    // обработка невалидных
    // комбинаций аргументов
  } else {
    // специальная проверка и генерация ошибки
    // для попытки шпионить за null
    if (
      target === null &&
      methodNameOrImplFromSpy === undefined &&
      customImplForMethodFromSpy === undefined
    ) {
      throw new TypeError('Attempted to spy on null.');
    }
    // генерация ошибки, если target не функция
    // и имя метода не предоставлено
    if (methodNameOrImplFromSpy === undefined && typeof target !== 'function') {
      throw new TypeError(
        'Attempted to spy on a non-function value. To spy on an object method, ' +
          'you must provide the method name as the second argument.',
      );
    }
    // генерация общей ошибки для
    // остальных невалидных сигнатур вызова
    throw new Error(
      'Invalid arguments. Valid signatures:\n' +
        '  createSpy(function, [customImplementationFunction])\n' +
        '  createSpy(object, methodNameString, [customImplementationFunction])',
    );
  }
  // формирование и возврат объекта
  // с конфигурацией для создания шпиона
  return {
    originalFn,
    // определение функции для выполнения шпионом: либо
    // пользовательская реализация, либо оригинальная функция
    fnToExecute: customImplementation || originalFn,
    isMethodSpy,
    objToSpyOn,
    methodName,
  };
}

/**
 * Создает шпиона для функции или метода объекта,
 * с возможностью подмены реализации.
 *
 * Шпионить за отдельной функцией:
 * createSpy(targetFn, [customImplementation])
 *
 * Шпионить за методом объекта:
 * createSpy(targetObject, methodName, [customImplementation])
 *
 * @param target - Функция для шпионажа или объект, на методе которого ставится шпион.
 * @param methodNameOrImpl - Имя метода (строка) если target - объект,
 *                           или кастомная реализация (функция) если target - функция.
 * @param customImplForMethod - Кастомная реализация (функция) если target - объект и указан methodName.
 * @returns {(function(...[*]): (*|undefined))|*} Шпион-функция.
 */
export function createSpy(target, methodNameOrImpl, customImplForMethod) {
  // если аргументы не передавались,
  // то определяется функция-пустышка
  if (
    typeof target === 'undefined' &&
    typeof methodNameOrImpl === 'undefined' &&
    typeof customImplForMethod === 'undefined'
  ) {
    target = function () {};
  }
  // получение конфигурации шпиона
  // путем разбора входных аргументов
  const {originalFn, fnToExecute, isMethodSpy, objToSpyOn, methodName} =
    _parseSpyArgs(target, methodNameOrImpl, customImplForMethod);
  // инициализация объекта для хранения
  // информации о вызовах шпиона
  const callLog = {
    count: 0,
    calls: [],
  };
  // определение основной
  // функции-шпиона
  const spy = function (...args) {
    // увеличение счетчика вызовов
    // при каждом запуске шпиона
    callLog.count++;
    // создание объекта для записи
    // деталей текущего вызова
    const callInfo = {
      // сохранение аргументов, с которыми
      // был вызван шпион
      args: [...args],
      // сохранение контекста (this)
      // вызова шпиона
      thisArg: this,
      returnValue: undefined,
      error: undefined,
    };
    // попытка выполнения целевой функции
    // (оригинальной или пользовательской)
    try {
      // выполнение функции и сохранение
      // возвращенного значения
      callInfo.returnValue = fnToExecute.apply(this, args);
      // добавление информации об успешном
      // вызове в лог
      callLog.calls.push(callInfo);
      // возврат результата выполнения
      // целевой функции
      return callInfo.returnValue;
    } catch (e) {
      // обработка ошибки, если выполнение целевой
      // функции привело к исключению
      // сохранение информации
      // о произошедшей ошибке
      callInfo.error = e;
      // добавление информации о вызове
      // с ошибкой в лог
      callLog.calls.push(callInfo);
      // проброс оригинальной
      // ошибки дальше
      throw e;
    }
  };
  // определение свойства `calls` на шпионе,
  // для получения вызовов
  Object.defineProperty(spy, 'calls', {
    get: () => callLog.calls,
    enumerable: true,
    configurable: false,
  });
  // определение свойства `callCount` на шпионе
  // для получения количества вызовов
  Object.defineProperty(spy, 'callCount', {
    get: () => callLog.count,
    enumerable: true,
    configurable: false,
  });
  // определение свойства `called` на шпионе,
  // указывающего, был ли шпион вызван
  Object.defineProperty(spy, 'called', {
    get: () => callLog.count > 0,
    enumerable: true,
    configurable: false,
  });
  // определение метода `getCall` для получения
  // информации о конкретном вызове по его индексу
  spy.getCall = n => {
    // проверка корректности индекса вызова,
    // выбрасывание ошибки при выходе за границы
    if (typeof n !== 'number' || n < 0 || n >= callLog.calls.length) {
      throw new RangeError(
        `Invalid call index ${n}. Spy has ${callLog.calls.length} call(s).`,
      );
    }
    return callLog.calls[n];
  };
  // определение метода `calledWith` для проверки,
  // был ли шпион вызван с определенным набором аргументов
  spy.calledWith = (...expectedArgs) => {
    return callLog.calls.some(
      call =>
        call.args.length === expectedArgs.length &&
        call.args.every((arg, i) => Object.is(arg, expectedArgs[i])),
    );
  };
  // определение метода `nthCalledWith` для проверки
  // аргументов n-го вызова шпиона
  spy.nthCalledWith = (n, ...expectedArgs) => {
    // getCall(n) выбросит ошибку, если индекс n невалиден
    const call = spy.getCall(n);
    return (
      call.args.length === expectedArgs.length &&
      call.args.every((arg, i) => Object.is(arg, expectedArgs[i]))
    );
  };
  // определение метода `nthCallReturned` для проверки
  // значения, возвращенного n-ым вызовом шпиона
  spy.nthCallReturned = (n, expectedReturnValue) => {
    // getCall(n) выбросит ошибку, если индекс n невалиден
    const call = spy.getCall(n);
    // возврат false, если вызов завершился ошибкой
    if (call.error) return false;
    return Object.is(call.returnValue, expectedReturnValue);
  };
  // определение метода `nthCallThrew` для проверки,
  // выбросил ли n-ый вызов шпиона ошибку
  spy.nthCallThrew = (n, expectedError) => {
    // getCall(n) выбросит ошибку, если индекс n невалиден
    const call = spy.getCall(n);
    // возврат false, если вызов не выбросил ошибку
    if (call.error === undefined) return false;
    // если тип ожидаемой ошибки не указан,
    // любая ошибка считается совпадением
    if (expectedError === undefined) return true;
    // проверка строгого равенства
    // ожидаемой ошибки с выброшенной
    if (call.error === expectedError) return true;
    // проверка совпадения ошибки по сообщению,
    // если ожидаемая ошибка - строка
    if (typeof expectedError === 'string') {
      // убедимся, что call.error существует и имеет свойство message
      return (
        call.error &&
        typeof call.error.message === 'string' &&
        call.error.message === expectedError
      );
    }
    // проверка совпадения ошибки по типу (конструктору),
    // если ожидаемая ошибка - функция-конструктор
    if (
      typeof expectedError === 'function' &&
      call.error instanceof expectedError
    ) {
      return true;
    }
    // проверка совпадения ошибки по имени и сообщению,
    // если ожидаемая ошибка - экземпляр Error
    if (expectedError instanceof Error && call.error instanceof Error) {
      return (
        call.error.name === expectedError.name &&
        call.error.message === expectedError.message
      );
    }
    // прямое сравнение объектов ошибок
    // как крайний случай
    return Object.is(call.error, expectedError);
  };
  // определение метода `restore` для восстановления
  // оригинального метода объекта и сброса истории вызовов
  spy.restore = () => {
    // восстановление оригинального метода
    // объекта, если шпионили за ним
    if (isMethodSpy && objToSpyOn) {
      // проверка, что originalFn существует (на всякий случай,
      // хотя по логике _parseSpyArgs он должен быть)
      if (originalFn !== undefined) {
        objToSpyOn[methodName] = originalFn;
      }
    }
    // сброс истории вызовов
    callLog.count = 0;
    callLog.calls = [];
  };
  // если создается шпион для метода объекта,
  // оригинальный метод немедленно заменяется шпионом
  if (isMethodSpy && objToSpyOn) {
    objToSpyOn[methodName] = spy;
  }
  // возврат созданной и настроенной
  // функции-шпиона
  return spy;
}
