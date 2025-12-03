/**
 * Вспомогательная функция для разбора аргументов createSpy.
 *
 * @param {Function|object} target
 * @param {Function|string|undefined} methodNameOrImpl
 * @param {Function|undefined} customImplForMethod
 * @returns {object}
 */
function _parseSpyArgs(target, methodNameOrImpl, customImplForMethod) {
  // объявление переменных для хранения
  // состояния и результатов разбора аргументов
  let originalFn;
  let customImplementation;
  let isMethodSpy = false;
  let objToSpyOn;
  let methodName;
  let hasOwnMethod = false;
  // определение вероятности того, что
  // создается шпион для отдельной функции
  const isLikelyFunctionSpy =
    typeof target === 'function' && customImplForMethod === undefined;
  // определение вероятности того, что
  // создается шпион для метода объекта
  const isLikelyMethodSpy =
    typeof target === 'object' &&
    target !== null &&
    typeof methodNameOrImpl === 'string';
  // обработка сценария шпионажа
  // за отдельной функцией
  if (isLikelyFunctionSpy) {
    // исходная функция - это первый аргумент
    originalFn = target;
    // проверка наличия второго аргумента, который
    // может быть пользовательской реализацией
    if (methodNameOrImpl !== undefined) {
      // генерация ошибки, если второй аргумент
      // (пользовательская реализация) не является функцией
      if (typeof methodNameOrImpl !== 'function') {
        throw new TypeError(
          'When spying on a function, the second argument (custom ' +
            'implementation) must be a function if provided.',
        );
      }
      // пользовательская реализация присваивается,
      // если она предоставлена и является функцией
      customImplementation = methodNameOrImpl;
    }
    // обработка сценария шпионажа
    // за методом объекта
  } else if (isLikelyMethodSpy) {
    // установка параметров для
    // шпионажа за методом
    methodName = methodNameOrImpl;
    objToSpyOn = target;
    isMethodSpy = true;
    hasOwnMethod = Object.prototype.hasOwnProperty.call(objToSpyOn, methodName);
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
    if (customImplForMethod !== undefined) {
      // генерация ошибки, если третья (пользовательская
      // реализация метода) не является функцией
      if (typeof customImplForMethod !== 'function') {
        throw new TypeError(
          'When spying on a method, the third argument (custom ' +
            'implementation) must be a function if provided.',
        );
      }
      // пользовательская реализация метода присваивается,
      // если она предоставлена и является функцией
      customImplementation = customImplForMethod;
    }
    // обработка невалидных
    // комбинаций аргументов
  } else {
    // специальная проверка и генерация ошибки
    // для попытки шпионить за null
    if (
      target === null &&
      methodNameOrImpl === undefined &&
      customImplForMethod === undefined
    ) {
      throw new TypeError('Attempted to spy on null.');
    }
    // генерация ошибки, если target не функция
    // и имя метода не предоставлено
    if (methodNameOrImpl === undefined && typeof target !== 'function') {
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
    hasOwnMethod,
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
 * @param {Function|object|undefined} target
 * @param {Function|string|undefined} methodNameOrImpl
 * @param {Function|undefined} customImplForMethod
 * @returns {Function}
 */
export function createSpy(
  target = undefined,
  methodNameOrImpl = undefined,
  customImplForMethod = undefined,
) {
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
  const {
    originalFn,
    fnToExecute,
    isMethodSpy,
    objToSpyOn,
    methodName,
    hasOwnMethod,
  } = _parseSpyArgs(target, methodNameOrImpl, customImplForMethod);
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
  // определение свойства `isCalled` на шпионе,
  // указывающего, был ли шпион вызван
  Object.defineProperty(spy, 'isCalled', {
    get: () => callLog.count > 0,
    enumerable: true,
    configurable: false,
  });
  // определение метода `restore` для восстановления
  // оригинального метода объекта и сброса истории вызовов
  spy.restore = () => {
    // восстановление оригинального метода
    // объекта, если шпионили за ним
    if (isMethodSpy && objToSpyOn) {
      // проверка, что originalFn существует (на всякий случай,
      // хотя по логике _parseSpyArgs он должен быть)
      if (originalFn !== undefined) {
        // если метод принадлежит объекту,
        // то устанавливается предыдущее значение
        if (hasOwnMethod) {
          objToSpyOn[methodName] = originalFn;
        }
        // если оригинальный метод принадлежит прототипу,
        // то шпион удаляется из свойства, открывая метод
        // прототипа
        else {
          delete objToSpyOn[methodName];
        }
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
