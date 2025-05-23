# @e22m4u/js-spy

Утилита слежения за вызовом функций и методов для JavaScript.

## Содержание

- [Установка](#установка)
- [Использование](#использование)
  - [Отслеживание вызова функции](#отслеживание-вызова-функции)
  - [Отслеживание вызова метода](#отслеживание-вызова-метода)
- [API](#api)
  - [createSpy(target, [methodNameOrImpl], [customImplForMethod])](#createspytarget-methodnameorimpl-customimplformethod)
  - [Свойства и методы шпиона](#свойства-и-методы-шпиона)
    - [spy(...args)](#spyargs)
    - [spy.called](#spycalled)
    - [spy.callCount](#spycallcount)
    - [spy.getCall(n)](#spygetcalln)
    - [spy.calledWith(...expectedArgs)](#spycalledwithexpectedargs)
    - [spy.nthCalledWith(n, ...expectedArgs)](#spynthcalledwithn-expectedargs)
    - [spy.nthCallReturned(n, expectedReturnValue)](#spynthcallreturnedn-expectedreturnvalue)
    - [spy.nthCallThrew(n, [expectedError])](#spynthcallthrewn-expectederror)
    - [spy.restore()](#spyrestore)
- [Тесты](#тесты)
- [Лицензия](#лицензия)

## Установка

```bash
npm install @e22m4u/js-spy
```

Поддержка ESM и CommonJS стандартов.

*ESM*
```js
import {createSpy} from '@e22m4u/js-spy';
```

*CommonJS*
```js
const {createSpy} = require('@e22m4u/js-spy');
```

## Использование

Отслеживание вызова функции.

```js
import {createSpy} from '@e22m4u/js-spy';

function greet(name) {
  return `Hello, ${name}!`;
}

const greetSpy = createSpy(greet);

greetSpy('World');
greetSpy('JavaScript');

console.log(greetSpy.called);    // true
console.log(greetSpy.callCount); // 2

// аргументы вызова
console.log(greetSpy.getCall(0).args); // ['World']
console.log(greetSpy.getCall(1).args); // ['JavaScript']

// возвращаемое значение
console.log(greetSpy.getCall(0).returnValue); // 'Hello, World!'
console.log(greetSpy.getCall(1).returnValue); // 'Hello, JavaScript!'

// тест аргументов
console.log(greetSpy.calledWith('World'));      // true
console.log(greetSpy.calledWith('JavaScript')); // true
console.log(greetSpy.calledWith('FooBar'));     // false

// тест аргументов определенного вызова
console.log(greetSpy.nthCalledWith(0, 'World'));      // true
console.log(greetSpy.nthCalledWith(1, 'JavaScript')); // true
console.log(greetSpy.nthCalledWith(1, 'FooBar'));     // false

// тест возвращаемого значения
console.log(greetSpy.nthCallReturned(0, 'Hello, World'));      // true
console.log(greetSpy.nthCallReturned(1, 'Hello, JavaScript')); // true

try {
  greetSpy.getCall(5); // Попытка получить несуществующий вызов
} catch (e) {
  // Ожидаемая ошибка, например:
  // "Invalid call index 5. Spy has 2 call(s)."
  console.error(e.message);
}
```

Отслеживание вызова метода.

```js
import {createSpy} from '@e22m4u/js-spy';

const calculator = {
  value: 0,
  add(a, b) {
    this.value = a + b;
    return this.value;
  },
};

const addSpy = createSpy(calculator, 'add');

calculator.add(5, 3);
console.log(calculator.value); // 8

calculator.add(2, 1);
console.log(calculator.value); // 3

console.log(addSpy.called);    // true
console.log(addSpy.callCount); // 2

// аргументы вызова
console.log(addSpy.getCall(0).args); // [5, 3]
console.log(addSpy.getCall(1).args); // [2, 1]

// возвращаемое значение
console.log(addSpy.getCall(0).returnValue); // 8
console.log(addSpy.getCall(1).returnValue); // 3

// контекст вызова
console.log(addSpy.getCall(0).thisArg === calculator); // true
console.log(addSpy.getCall(1).thisArg === calculator); // true

// тест аргументов
console.log(addSpy.calledWith(5, 3));  // true
console.log(addSpy.calledWith(2, 1));  // true
console.log(addSpy.calledWith('foo')); // false

// тест аргументов определенного вызова
console.log(addSpy.nthCalledWith(0, 5, 3));  // true
console.log(addSpy.nthCalledWith(1, 2, 1));  // true
console.log(addSpy.nthCalledWith(1, 'foo')); // false

// тест возвращаемого значения
console.log(addSpy.nthCallReturned(0, 8)); // true
console.log(addSpy.nthCallReturned(1, 3)); // true

// восстановление оригинального метода
addSpy.restore();
// calculator.add теперь снова оригинальный метод
```

## API

### createSpy(target, [methodNameOrImpl], [customImplForMethod])

Основная функция для создания шпиона.

Сигнатуры вызова и аргументы:

1. Отслеживание отдельной функции:  
    `createSpy(targetFn, [customImplementation])`
    - `targetFn`: Функция, которую требуется отслеживать.
    - `customImplementation` (необязательно): Пользовательская функция,
      которая будет вызываться вместо `targetFn`. Должна иметь ту же
      сигнатуру.
  
  
2. Отслеживание метода объекта:  
    `createSpy(targetObject, methodName, [customImplementation])`
    - `targetObject`: Объект, метод которого будет отслеживаться.
    - `methodName`: Имя метода в `targetObject`, который требуется
      отслеживать.
    - `customImplementation` (необязательно): Пользовательская функция,
      которая будет вызываться вместо оригинального метода. Должна
      иметь ту же сигнатуру.

Возвращает:

- Функция-шпион с дополнительными свойствами и методами для инспекции.

### Свойства и методы шпиона

Каждая функция-шпион, возвращаемая `createSpy`, обладает следующими
свойствами и методами:

#### spy(...args)

Сам шпион является функцией. При вызове он выполняет либо оригинальную
функцию/метод (или пользовательскую реализацию, если предоставлена),
записывает информацию о вызове и возвращает результат (или пробрасывает
ошибку).

```javascript
const fn = (x) => x * 2;
const spy = createSpy(fn);

const result = spy(5);      // result будет 10
console.log(spy.callCount); // 1
```

#### spy.called

- **Тип:** `boolean` (только для чтения)
- **Описание:** Указывает, был ли шпион вызван хотя бы один раз.

```javascript
const spy = createSpy(() => {});
console.log(spy.called); // false
spy();
console.log(spy.called); // true
```

#### spy.callCount

- **Тип:** `number` (только для чтения)
- **Описание:** Количество раз, которое шпион был вызван.

```javascript
const spy = createSpy(() => {});
console.log(spy.callCount); // 0
spy();
spy();
console.log(spy.callCount); // 2
```

#### spy.getCall(n)

Аргументы:
- `n`: Число, индекс вызова (начиная с 0).

Возвращает: Объект `CallInfo` со свойствами:

- `args`: Массив аргументов, с которыми был совершен вызов.
- `thisArg`: Контекст `this` вызова.
- `returnValue`: Значение, возвращенное функцией (или `undefined`,
  если функция бросила ошибку).
- `error`: Ошибка, выброшенная функцией (или `undefined`, если ошибки
  не было).

Выбрасывает:

- `RangeError`: Если `n` не является допустимым индексом вызова.

Пример:

```javascript
const spy = createSpy((a, b) => a + b);
spy.call({ id: 1 }, 10, 20); // 0-й вызов

const firstCall = spy.getCall(0);
console.log(firstCall.args); // [10, 20]

try {
  spy.getCall(1); // Попытка получить несуществующий вызов
} catch (e) {
  // Ожидаемая ошибка, например:
  // "Invalid call index 1. Spy has 1 call(s)."
  console.error(e.message);
}
```

#### spy.calledWith(...expectedArgs)

Аргументы:

- `...expectedArgs`: Аргументы, с которыми, как ожидается, был вызван
    шпион.

Возвращает: `boolean`
- `true`, если шпион был хотя бы раз вызван с точно таким же набором
  аргументов (сравнение с использованием `Object.is`).
- `false` в противном случае.

Пример:

```javascript
const spy = createSpy(() => {});
spy(1, 'a', true);
spy(2, 'b');

console.log(spy.calledWith(1, 'a', true)); // true
console.log(spy.calledWith(1, 'a'));       // false
console.log(spy.calledWith(2, 'c'));       // false
```

#### spy.nthCalledWith(n, ...expectedArgs)

Аргументы:

- `n`: Число, индекс вызова (начиная с 0).
- `...expectedArgs`: Аргументы, с которыми, как ожидается, был
  совершен n-ый вызов.

Возвращает: `boolean`

- `true`, если n-ый вызов шпиона был совершен с точно таким же набором
  аргументов.
- `false` в противном случае.

Выбрасывает:

- `RangeError`: Если `n` не является допустимым индексом вызова
  (унаследовано от `getCall`).

Пример:

```javascript
const spy = createSpy(() => {});
spy('first call');
spy('second call', 123);

console.log(spy.nthCalledWith(0, 'first call'));       // true
console.log(spy.nthCalledWith(1, 'second call', 123)); // true
console.log(spy.nthCalledWith(0, 'another'));          // false

try {
  spy.nthCalledWith(2, 'anything'); // Несуществующий вызов
} catch (e) {
  // Ожидаемая ошибка, например:
  // "Invalid call index 2. Spy has 2 call(s)."
  console.error(e.message);
}
```

#### spy.nthCallReturned(n, expectedReturnValue)

Аргументы:

- `n`: Число, индекс вызова (начиная с 0).
- `expectedReturnValue`: Ожидаемое возвращаемое значение для n-го
  вызова.

Возвращает: `boolean`
- `true`, если n-ый вызов шпиона вернул `expectedReturnValue` (сравнение
  с помощью `Object.is`).
- `false`, если значение не совпало или вызов выбросил ошибку.

Выбрасывает:

- `RangeError`: Если `n` не является допустимым индексом вызова
  (унаследовано от `getCall`).

Пример:

```javascript
const spy = createSpy(val => {
  if (val === 0) throw new Error('zero');
  return val * 10;
});
spy(5); // 0-й вызов, возвращает 50
try { spy(0); } catch(e) {} // 1-й вызов, бросает ошибку
spy(2); // 2-й вызов, возвращает 20

console.log(spy.nthCallReturned(0, 50)); // true
console.log(spy.nthCallReturned(1, 10)); // false (вызов 1 бросил ошибку)
console.log(spy.nthCallReturned(2, 20)); // true

try {
  spy.nthCallReturned(3, 30); // Несуществующий вызов
} catch (e) {
  // Ожидаемая ошибка, например:
  // "Invalid call index 3. Spy has 3 call(s)."
  console.error(e.message);
}
```

#### spy.nthCallThrew(n, [expectedError])

Аргументы:

- `n`: Число, индекс вызова (начиная с 0).
- `expectedError` (необязательно): Матчер для ошибки. Возможные
  варианты:
  - `undefined`: Проверяет, что n-ый вызов просто выбросил любую
    ошибку.
  - Строка: Проверяет, что сообщение выброшенной ошибки
    (`error.message`) совпадает со строкой.
  - Конструктор ошибки (например, `Error`, `TypeError`): Проверяет,
    что выброшенная ошибка является экземпляром (`instanceof`) этого
    конструктора.
  - Экземпляр ошибки: Проверяет, что имя (`error.name`) и сообщение
    (`error.message`) выброшенной ошибки совпадают с полями
    `expectedError`.
  - Любое другое значение: Проверяется прямое совпадение выброшенной
    ошибки с `expectedError` через `Object.is`.

Возвращает: `boolean`

- `true`, если n-ый вызов шпиона выбросил ошибку
  или ошибка соответствует `expectedError`.
- `false`, если вызов не выбросил ошибку (или выбросил не ту ошибку).

Выбрасывает:
- `RangeError`: Если `n` не является допустимым индексом вызова
  (унаследовано от `getCall`).

Пример:

```javascript
const mightThrow = (val) => {
  if (val === 0) throw new TypeError('Zero is not allowed');
  if (val < 0) throw new Error('Negative value');
  return val;
};
const spy = createSpy(mightThrow);

try { spy(0); } catch (e) {}  // 0-й вызов
try { spy(-5); } catch (e) {} // 1-й вызов
spy(10);                      // 2-й вызов

console.log(spy.nthCallThrew(0));                        // true
console.log(spy.nthCallThrew(0, 'Zero is not allowed')); // true
console.log(spy.nthCallThrew(2));                        // false (2-й вызов не бросил ошибку)

try {
  spy.nthCallThrew(3); // Несуществующий вызов
} catch (e) {
  // Ожидаемая ошибка, например:
  // "Invalid call index 3. Spy has 3 call(s)."
  console.error(e.message);
}
```

#### spy.restore()

Описание:

- Если шпион был создан для метода объекта, этот метод
  восстанавливает оригинальный метод на объекте.
- Если шпион был создан для отдельной функции, вызов этого метода
  ничего не делает.

```javascript
const myObject = {
  doSomething() {
    return 'original';
  }
};

const spy = createSpy(myObject, 'doSomething');
// myObject.doSomething(); // может быть вызван шпион

spy.restore();
console.log(myObject.doSomething()); // 'original'
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
