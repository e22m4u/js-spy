# @e22m4u/js-spy

Утилита слежения за вызовом функций и методов для JavaScript. Позволяет
создавать "шпионов" для функций или методов объектов, отслеживать их вызовы,
аргументы, возвращаемые значения, а также управлять группой шпионов.

## Содержание

- [Установка](#установка)
- [Использование](#использование)
  - [Отслеживание вызова функции](#отслеживание-вызова-функции)
  - [Отслеживание вызова метода](#отслеживание-вызова-метода)
  - [Управление группой шпионов](#управление-группой-шпионов)
- [Плагин для Chai](#плагин-для-chai)
- [Справочник API](#справочник-api)
  - [Функция `createSpy`](#функция-createspy)
  - [Свойства и методы шпиона](#свойства-и-методы-шпиона)
    - [spy(...args)](#spyargs)
    - [spy.calls](#spycalls)
    - [spy.isCalled](#spyiscalled)
    - [spy.callCount](#spycallcount)
    - [spy.restore()](#spyrestore)
  - [Функция `createSandbox`](#функция-createsandbox)
  - [Методы песочницы](#методы-песочницы)
    - [sandbox.on(...)](#sandboxon)
    - [sandbox.restore()](#sandboxrestore)
- [Тесты](#тесты)
- [Лицензия](#лицензия)

## Установка

```bash
npm install @e22m4u/js-spy
```

Поддержка ESM и CommonJS стандартов.

*ESM*

```js
import {createSpy, createSandbox} from '@e22m4u/js-spy';
```

*CommonJS*

```js
const {createSpy, createSandbox} = require('@e22m4u/js-spy');
```

## Использование

Шпионы создаются с помощью функции `createSpy`. Данная функция оборачивает
целевую функцию или метод объекта, позволяя перехватывать вызовы, фиксировать
аргументы и возвращаемые значения.

#### Отслеживание вызова функции

```js
import {createSpy} from '@e22m4u/js-spy';

// отслеживаемая функция
function greet(name) {
  return `Hello, ${name}!`;
}

// создание шпиона
const greetSpy = createSpy(greet);

// вызовы шпиона
greetSpy('World');
greetSpy('JavaScript');

// количество вызовов
console.log(greetSpy.isCalled);  // true
console.log(greetSpy.callCount); // 2

// аргументы и возвращаемое значение первого вызова
console.log(greetSpy.calls[0].args);        // ["World"]
console.log(greetSpy.calls[0].returnValue); // "Hello, World!"

// и второго
console.log(greetSpy.calls[1].args);        // ["JavaScript"]
console.log(greetSpy.calls[1].returnValue); // "Hello, JavaScript!"

// массив вызовов
console.log(greetSpy.calls.length); // 2
console.log(greetSpy.calls);
// [
//   {
//     args: ['World'],
//     thisArg: undefined,
//     returnValue: 'Hello, World!',
//     error: undefined
//   },
//   {
//     args: ['JavaScript'],
//     thisArg: undefined,
//     returnValue: 'Hello, JavaScript!',
//     error: undefined
//   }
// ]
```

### Отслеживание вызова метода

```js
import {createSpy} from '@e22m4u/js-spy';

// объект, содержащий метод для отслеживания
const calculator = {
  value: 0,
  add(a, b) {
    this.value = a + b;
    return this.value;
  },
};

// создание шпиона и подмена метода
const addSpy = createSpy(calculator, 'add');

// первый вызов метода
calculator.add(5, 3);
console.log(calculator.value); // 8

// второй вызов метода
calculator.add(2, 1);
console.log(calculator.value); // 3

// количество вызовов
console.log(addSpy.isCalled);  // true
console.log(addSpy.callCount); // 2

// аргументы и возвращаемое значение первого вызова
console.log(addSpy.calls[0].args);        // [5, 3]
console.log(addSpy.calls[0].returnValue); // 8

// и второго
console.log(addSpy.calls[1].args);        // [2, 1]
console.log(addSpy.calls[1].returnValue); // 3

// массив вызовов
console.log(addSpy.calls.length); // 2
console.log(addSpy.calls);
// [
//   {
//     args: [5, 3],
//     thisArg: calculator, // ссылка на объект calculator
//     returnValue: 8,
//     error: undefined
//   },
//   {
//     args: [2, 1],
//     thisArg: calculator,
//     returnValue: 3,
//     error: undefined
//   }
// ]

// восстановление оригинального метода
addSpy.restore();
// calculator.add теперь снова оригинальный метод
```

### Управление группой шпионов

Песочница позволяет управлять несколькими шпионами одновременно,
например, восстановить их все разом.

```js
import {createSandbox} from '@e22m4u/js-spy';

// объект с методами для отслеживания
const service = {
  fetchData(id) {
    console.log(`Fetching data for ${id}...`);
    return {id, data: `Data for ${id}`};
  },
  processItem(item) {
    console.log(`Processing ${item.data}...`);
    return `Processed: ${item.data}`;
  }
};

// одиночная функция для отслеживания
function standaloneLogger(message) {
  console.log(`LOG: ${message}`);
}

// создание песочницы
const sandbox = createSandbox();

// добавление шпионов в песочницу:
//   метод sandbox.on() работает аналогично createSpy(),
//   но добавляет шпиона в песочницу и возвращает созданного
//   шпиона
const fetchDataSpy = sandbox.on(service, 'fetchData');
const processItemSpy = sandbox.on(service, 'processItem');
const loggerSpy = sandbox.on(standaloneLogger);

// так как методы заменяются шпионами прямо на объекте,
// допустимо вызывать непосредственно их
const data = service.fetchData(1);
service.processItem(data);

// но для одиночной функции, требуется вызывать
// созданного шпиона loggerSpy, а не оригинал
loggerSpy('All done!');

console.log(fetchDataSpy.callCount);   // 1
console.log(processItemSpy.callCount); // 1
console.log(loggerSpy.callCount);      // 1

// восстановление всех шпионов песочницы:
//   - оригинальные методы service.fetchData
//     и service.processItem будут восстановлены
//   - история вызовов (calls, callCount, isCalled и т.д.)
//     для fetchDataSpy, processItemSpy и loggerSpy
//     будет сброшена
//   - внутренний список шпионов песочницы будет очищен
sandbox.restore();

console.log(service.fetchData === fetchDataSpy);
// false (оригинальный метод восстановлен)
console.log(fetchDataSpy.callCount);
// 0 (история сброшена)
console.log(loggerSpy.isCalled);
// false (история сброшена)
```

## Плагин для Chai

Плагин интегрируется в библиотеку [chai](https://www.npmjs.com/package/chai)
и предоставляет набор утверждений для проверки состояния шпионов. Расширение
позволяет проверять факты вызова функций, количество вызовов, переданные
аргументы и порядок выполнения.

Подключение плагина выполняется через метод `use`.

```js
import chai from 'chai';
import {chaiSpies} from '@e22m4u/js-spy';

chai.use(chaiSpies);
```

Базовый пример:

```js
// проверка, является ли объект шпионом
expect(fn).to.be.spy;
expect(obj).to.not.be.spy;

// проверка, что шпион был вызван хотя бы раз
expect(spy).to.be.called();

// проверка отсутствия вызовов
expect(spy).to.not.be.called();
```

Количество вызовов проверяется с помощью специальных модификаторов.
Доступны методы для точного совпадения, а также для проверки
минимального и максимального количества раз.

Модификаторы:

- `once`: один раз;
- `twice`: два раза;
- `exactly(n)`: точно n раз;
- `min(n)` или `at.least(n)`: минимум n раз;
- `max(n)` или `at.most(n)`: максимум n раз;
- `above(n)` или `gt(n)`: больше n раз;
- `below(n)` или `lt(n)`: меньше n раз;


```js
// проверка точного количества вызовов
expect(spy).to.have.been.called.once;
expect(spy).to.have.been.called.twice;
expect(spy).to.have.been.called.exactly(3);

// проверка диапазона вызовов
expect(spy).to.have.been.called.min(1);
expect(spy).to.have.been.called.at.most(5);
expect(spy).to.have.been.called.above(0);
```

Проверка аргументов осуществляется методом `with`. Сравнение
производится строго: количество и значения аргументов должны совпадать.
Цепочка `always` позволяет утверждать, что все вызовы шпиона
соответствовали условию.

```js
// проверка, что шпион был вызван с аргументами 1 и 'foo'
expect(spy).to.have.been.called.with(1, 'foo');

// проверка, что каждый вызов содержал указанные аргументы
expect(spy).to.have.been.called.always.with(true);
```

Доступна проверка аргументов для конкретного порядкового номера вызова.
Для этого используются свойства `first`, `second`, `third` или метод
`nth(index)`.

```js
// проверка аргументов первого вызова
expect(spy).to.have.been.called.first.with('start');

// проверка аргументов второго вызова
expect(spy).to.have.been.called.second.with('process');

// проверка аргументов третьего вызова
expect(spy).to.have.been.called.third.with('end');

// проверка аргументов десятого вызова
expect(spy).on.nth(10).be.called.with('result');
```

## Справочник API

### Функция `createSpy`

Основная функция для создания шпиона.

Сигнатуры вызова:

1.  Отслеживание отдельной функции:  
    `createSpy(targetFn, [customImpl])`
    - `targetFn`: Функция, которую требуется отслеживать.
    - `customImpl` (необязательно): Пользовательская функция,
      которая будет вызываться вместо `targetFn`. Должна иметь ту же
      сигнатуру.

2.  Отслеживание метода объекта:  
    `createSpy(targetObject, methodName, [customImpl])`
    - `targetObject`: Объект, метод которого будет отслеживаться.
    - `methodName`: Имя метода в `targetObject`, который требуется
      отслеживать.
    - `customImpl` (необязательно): Пользовательская функция,
      которая будет вызываться вместо оригинального метода. Должна
      иметь ту же сигнатуру.

Возвращает:

- Функция-шпион с дополнительными свойствами и методами для инспекции.

### Свойства и методы шпиона

Каждая функция-шпион, возвращаемая `createSpy` (или `sandbox.on`), обладает
следующими свойствами и методами:

#### spy(...args)

Сам шпион является функцией. При вызове он выполняет либо оригинальную
функцию/метод (или пользовательскую реализацию, если предоставлена),
записывает информацию о вызове и возвращает результат (или пробрасывает
ошибку).

```js
const fn = (x) => x * 2;
const spy = createSpy(fn);

const result = spy(5);      // result будет 10
console.log(spy.callCount); // 1
```

#### spy.calls

- Тип: `CallInfo[]` (только для чтения)
- Описание: Возвращает массив вызовов.

```js
const fn = (a, b) => a + b;
const spy = createSpy(fn);
console.log(spy.calls); // []

spy(4, 2);
spy(5, 3);
console.log(spy.calls);
// [
//   {
//     args: [4, 2],
//     thisArg: undefined,
//     returnValue: 6,
//     error: undefined,
//   },
//   {
//     args: [5, 3],
//     thisArg: undefined,
//     returnValue: 8,
//     error: undefined,
//   }
// ]
```

#### spy.isCalled

- Тип: `boolean` (только для чтения)
- Описание: Указывает, был ли шпион вызван хотя бы один раз.

```js
const spy = createSpy();
console.log(spy.isCalled); // false
spy();
console.log(spy.isCalled); // true
```

#### spy.callCount

- Тип: `number` (только для чтения)
- Описание: Количество раз, которое шпион был вызван.

```js
const spy = createSpy();
console.log(spy.callCount); // 0
spy();
spy();
console.log(spy.callCount); // 2
```

#### spy.restore()

Описание:

- Восстанавливает оригинальный метод, если шпион был создан
  для метода объекта.
- Сбрасывает историю вызовов шпиона (`callCount` становится 0,
  `isCalled` становится `false`, и все записи о вызовах очищаются).
- Если шпион был создан для отдельной функции (а не для метода объекта),
  восстановление метода не происходит (так как нечего восстанавливать),
  но история вызовов все равно сбрасывается.

```js
// для метода объекта
const myObject = {
  doSomething() {
    return 'original';
  }
};

const methodSpy = createSpy(myObject, 'doSomething');
// вызов шпиона
myObject.doSomething();
console.log(methodSpy.callCount); // 1

// восстановление метода
methodSpy.restore();
console.log(myObject.doSomething()); // 'original' (метод восстановлен)
console.log(methodSpy.callCount);    // 0 (история сброшена)

// для отдельной функции
const fn = () => 'result';
const fnSpy = createSpy(fn);
fnSpy();
console.log(fnSpy.callCount); // 1

// сброс истории функции
fnSpy.restore();
console.log(fnSpy.callCount); // 0 (история сброшена)
```

### Функция `createSandbox`

Фабричная функция для создания экземпляра песочницы.

```js
import {createSandbox} from '@e22m4u/js-spy';

const sandbox = createSandbox();
```

### Методы песочницы

Экземпляр `Sandbox` имеет следующие методы:

#### sandbox.on(...)

Создает шпиона и добавляет его в песочницу.

Сигнатуры вызова:

1.  Отслеживание отдельной функции:  
    `sandbox.on(targetFn, [customImpl])`

2.  Отслеживание метода объекта:  
    `sandbox.on(targetObject, methodName, [customImpl])`

Возвращает:

- Созданную функцию-шпион (такую же, как вернул бы `createSpy`).

Пример:

```js
const sandbox = createSandbox();
const obj = {greet: () => 'Hello'};

const greetSpy = sandbox.on(obj, 'greet');
// obj.greet теперь шпион, и greetSpy добавлен в песочницу
obj.greet();
console.log(greetSpy.isCalled); // true
```

#### sandbox.restore()

Вызывает метод `restore()` для каждого шпиона, содержащегося в песочнице.
Это означает, что:

- Все оригинальные методы объектов, для которых были созданы шпионы
  в данной песочнице, будут восстановлены.
- История вызовов всех шпионов в песочнице будет сброшена.
- Внутренний список шпионов в песочнице будет очищен.

Возвращает:

- `this` для возможной цепочки вызовов.

Пример:

```js
const sandbox = createSandbox();

// объект с методом для отслеживания
const service = {
  process() { /* ... */ }
};

// одиночная функция для отслеживания
function utilFn() { /* ... */ }

// создание шпионов
const processSpy = sandbox.on(service, 'process');
const utilSpy = sandbox.on(utilFn);

// вызов отслеживаемого метода
// и шпиона одиночной функции
service.process();
utilSpy();

// проверка количества вызовов
console.log(processSpy.callCount); // 1
console.log(utilSpy.callCount);    // 1

// восстановление шпионов
// и сброс истории
sandbox.restore();

// service.process теперь оригинальный метод
console.log(processSpy.callCount); // 0
console.log(utilSpy.callCount);    // 0
console.log(sandbox.spies.length); // 0
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
