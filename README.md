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
- [API](#api)
  - [createSpy(target, [methodNameOrImpl], [customImplForMethod])](#createspytarget-methodnameorimpl-customimplformethod)
  - [Свойства и методы шпиона](#свойства-и-методы-шпиона)
    - [spy(...args)](#spyargs)
    - [spy.calls](#spycalls)
    - [spy.isCalled](#spyiscalled)
    - [spy.callCount](#spycallcount)
    - [spy.restore()](#spyrestore)
  - [createSpiesGroup()](#createspiesgroup)
  - [Методы SpiesGroup](#методы-spiesgroup)
    - [group.on(target, [methodNameOrImpl], [customImplForMethod])](#groupon)
    - [group.restore()](#grouprestore)
- [Тесты](#тесты)
- [Лицензия](#лицензия)

## Установка

```bash
npm install @e22m4u/js-spy
```

Поддержка ESM и CommonJS стандартов.

*ESM*
```js
import {createSpy, createSpiesGroup} from '@e22m4u/js-spy';
```

*CommonJS*
```js
const {createSpy, createSpiesGroup} = require('@e22m4u/js-spy');
```

## Использование

### Отслеживание вызова функции

```js
import {createSpy} from '@e22m4u/js-spy';

function greet(name) {
  return `Hello, ${name}!`;
}

const greetSpy = createSpy(greet);

greetSpy('World');
greetSpy('JavaScript');

console.log(greetSpy.isCalled);  // true
console.log(greetSpy.callCount); // 2

console.log(greetSpy.calls[0].args[0]); // "World"
console.log(greetSpy.calls[0].returnValue); // "Hello, World!"

console.log(greetSpy.calls[1].args[0]); // "JavaScript"
console.log(greetSpy.calls[1].returnValue); // "Hello, JavaScript!"

console.log(greetSpy.calls.length); // 2
console.log(greetSpy.calls[0]);
// {
//   args: ['World'],
//   thisArg: undefined,
//   returnValue: 'Hello, World!',
//   error: undefined
// }
```

### Отслеживание вызова метода

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

console.log(addSpy.isCalled);  // true
console.log(addSpy.callCount); // 2

console.log(addSpy.calls[0].args[0]); // 5
console.log(addSpy.calls[0].args[1]); // 3
console.log(addSpy.calls[0].returnValue); // 8

console.log(addSpy.calls[1].args[0]); // 2
console.log(addSpy.calls[1].args[1]); // 1
console.log(addSpy.calls[1].returnValue); // 3

console.log(addSpy.calls.length); // 2
console.log(addSpy.calls[0]);
// {
//   args: [5, 3],
//   thisArg: calculator, // ссылка на объект calculator
//   returnValue: 8,
//   error: undefined
// }

// восстановление оригинального метода
addSpy.restore();
// calculator.add теперь снова оригинальный метод
```

### Управление группой шпионов

Группа шпионов позволяет управлять несколькими шпионами одновременно,
например, восстановить их все разом.

```js
import {createSpiesGroup} from '@e22m4u/js-spy';

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

// создание группы
const group = createSpiesGroup();

// добавление шпионов в группу:
//   метод group.on() работает аналогично createSpy(),
//   но добавляет шпиона в группу и возвращает созданного
//   шпиона
const fetchDataSpy = group.on(service, 'fetchData');
const processItemSpy = group.on(service, 'processItem');
const loggerSpy = group.on(standaloneLogger);

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

// восстановление всех шпионов в группе:
//   - оригинальные методы service.fetchData
//     и service.processItem будут восстановлены
//   - история вызовов (callCount, isCalled, calls и т.д.)
//     для fetchDataSpy, processItemSpy и loggerSpy
//     будет сброшена
//   - внутренний список шпионов в группе будет очищен
group.restore();

console.log(service.fetchData === fetchDataSpy);
// false (оригинальный метод восстановлен)
console.log(fetchDataSpy.callCount);
// 0 (история сброшена)
console.log(loggerSpy.isCalled);
// false (история сброшена)
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

Каждая функция-шпион, возвращаемая `createSpy` (или `group.on`), обладает
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

- **Тип:** `CallInfo[]` (только для чтения)
- **Описание:** Возвращает массив вызовов.

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

- **Тип:** `boolean` (только для чтения)
- **Описание:** Указывает, был ли шпион вызван хотя бы один раз.

```js
const spy = createSpy();
console.log(spy.isCalled); // false
spy();
console.log(spy.isCalled); // true
```

#### spy.callCount

- **Тип:** `number` (только для чтения)
- **Описание:** Количество раз, которое шпион был вызван.

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

### createSpiesGroup()

Фабричная функция для создания экземпляра `SpiesGroup`.

Возвращает:

- Новый экземпляр `SpiesGroup`.

```js
import {createSpiesGroup} from '@e22m4u/js-spy';

const group = createSpiesGroup();
```

### Методы SpiesGroup

Экземпляр `SpiesGroup` имеет следующие методы:

#### group.on(target, [methodNameOrImpl], [customImplForMethod])

Создает шпиона (используя `createSpy` с теми же аргументами) и добавляет
его в группу.

Сигнатуры вызова и аргументы идентичны `createSpy`:

1. `group.on(targetFn, [customImplementation])`
2. `group.on(targetObject, methodName, [customImplementation])`

Возвращает:

- Созданную функцию-шпион (такую же, как вернул бы `createSpy`).

Пример:

```js
const group = createSpiesGroup();
const obj = {greet: () => 'Hello'};

const greetSpy = group.on(obj, 'greet');
// obj.greet теперь шпион, и greetSpy добавлен в группу
obj.greet();
console.log(greetSpy.isCalled); // true
```

#### group.restore()

Вызывает метод `restore()` для каждого шпиона, содержащегося в группе.
Это означает, что:

- Все оригинальные методы объектов, для которых были созданы шпионы
  в этой группе, будут восстановлены.
- История вызовов всех шпионов в группе будет сброшена.
- Внутренний список шпионов в самой группе будет очищен, делая группу
  готовой к повторному использованию (если необходимо).

Возвращает:

- `this` (экземпляр `SpiesGroup`) для возможной цепочки вызовов.

Пример:

```js
const group = createSpiesGroup();

// объект с методом для отслеживания
const service = {
  process() { /* ... */ }
};

// одиночная функция для отслеживания
function utilFn() { /* ... */ }

// создание шпионов
const processSpy = group.on(service, 'process');
const utilSpy = group.on(utilFn);

// вызов отслеживаемого метода
// и шпиона одиночной функции
service.process();
utilSpy();

// проверка количества вызовов
console.log(processSpy.callCount); // 1
console.log(utilSpy.callCount);    // 1

// восстановление шпионов
// и сброс истории
group.restore();

// service.process теперь оригинальный метод
console.log(processSpy.callCount); // 0
console.log(utilSpy.callCount);    // 0
console.log(group.spies.length);   // 0
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
