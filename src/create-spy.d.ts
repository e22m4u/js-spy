/**
 * Тип любой функции.
 */
type AnyCallable = (...args: any[]) => any;

/**
 * Конструктор любой ошибки.
 */
type AnyErrorCtor = (new (...args: any[]) => Error);

/**
 * Ключ любого метода в объекте.
 * Должен быть ключом `TObj`, значение которого является функцией.
 */
type MethodKey<TObj extends object> = {
  [P in keyof TObj]: TObj[P] extends AnyCallable ? P : never
}[keyof TObj];

/**
 * Информация о единичном вызове отслеживаемой функции.
 *
 * @template Args Кортеж, представляющий типы аргументов вызова.
 * @template Return Тип возвращаемого значения отслеживаемой функции.
 */
export interface CallInfo<Args extends any[] = any[], Return = any> {
  /**
   * Аргументы, с которыми был вызван шпион.
   */
  readonly args: Args;

  /**
   * Контекст `this`, с которым был вызван шпион.
   */
  readonly thisArg: any;

  /**
   * Значение, возвращенное шпионом.
   * (`undefined`, если шпион выбросил ошибку)
   */
  readonly returnValue: Return | undefined;

  /**
   * Ошибка, выброшенная шпионом.
   * (`undefined`, если шпион не выбросил ошибку)
   */
  readonly error: unknown | undefined;
}

/**
 * Представляет функцию-шпиона, созданную `createSpy`.
 * Это вызываемая функция, которая также имеет свойства
 * и методы для инспекции вызовов.
 *
 * @template TFunc Тип отслеживаемой функции.
 */
export interface Spy<TFunc extends AnyCallable = AnyCallable> {
  /**
   * Сама функция-шпион.
   */
  (...args: Parameters<TFunc>): ReturnType<TFunc>;

  /**
   * Вызовы шпиона.
   * 
   * @readonly
   */
  readonly calls: CallInfo[];

  /**
   * Количество вызовов шпиона.
   * 
   * @readonly
   */
  readonly callCount: number;

  /**
   * Булево значение, указывающее, был ли шпион вызван хотя бы один раз.
   *
   * @readonly
   */
  readonly isCalled: boolean;

  /**
   * Получает детали n-го вызова шпиона.
   * Если вызов с указанным индексом `n` не существует, выбрасывает `RangeError`.
   *
   * @param   n           Индекс вызова (начиная с нуля).
   * @returns             Объект `CallInfo` для n-го вызова.
   * @throws `RangeError` если индекс `n` невалиден.
   */
  getCall(n: number): CallInfo<Parameters<TFunc>, ReturnType<TFunc>>;

  /**
   * Проверяет, был ли шпион когда-либо вызван с предоставленными аргументами.
   * Использует `Object.is` для сравнения аргументов.
   *
   * @param expectedArgs Ожидаемые аргументы для проверки.
   * @returns            `true`, если шпион был вызван с совпадающими
   *                     аргументами, иначе `false`.
   */
  calledWith(...expectedArgs: Parameters<TFunc>): boolean;

  /**
   * Проверяет, был ли n-ый вызов шпиона совершен с предоставленными аргументами.
   * Использует `Object.is` для сравнения аргументов.
   * Если вызов с указанным индексом `n` не существует, выбрасывает `RangeError`.
   *
   * @param   n            Индекс вызова (начиная с нуля).
   * @param   expectedArgs Ожидаемые аргументы для проверки.
   * @returns              `true`, если n-ый вызов имел совпадающие
   *                       аргументы, иначе `false`.
   * @throws  `RangeError` если индекс `n` невалиден (унаследовано от `getCall`).
   */
  nthCalledWith(n: number, ...expectedArgs: Parameters<TFunc>): boolean;

  /**
   * Проверяет, вернул ли n-ый вызов шпиона ожидаемое значение.
   * Использует `Object.is` для сравнения значений.
   * Если вызов с указанным индексом `n` не существует, выбрасывает `RangeError`.
   *
   * @param   n                   Индекс вызова (начиная с нуля).
   * @param   expectedReturnValue Ожидаемое возвращаемое значение.
   * @returns                     `true`, если n-ый вызов вернул ожидаемое значение,
   *                              иначе `false` (включая случаи, когда он выбросил ошибку).
   * @throws  `RangeError`        если индекс `n` невалиден (унаследовано от `getCall`).
   */
  nthCallReturned(n: number, expectedReturnValue: ReturnType<TFunc>): boolean;

  /**
   * Проверяет, выбросил ли n-ый вызов шпиона ошибку.
   * Если вызов с указанным индексом `n` не существует, выбрасывает `RangeError`.
   *
   * @param n             Индекс вызова (начиная с нуля).
   * @param expectedError Необязательно.
   *                      Если предоставлено, проверяет соответствие выброшенной ошибки:
   *                        - `string`: совпадение по сообщению ошибки.
   *                        - Конструктор `Error`: совпадение через `instanceof`.
   *                        - Экземпляр `Error`: совпадение по имени и сообщению ошибки.
   *                        - Прямое сравнение объектов с использованием `Object.is`.
   * @returns             `true`, если n-ый вызов выбросил совпадающую ошибку
   *                      (или любую ошибку, если матчер не предоставлен),
   *                      иначе `false` (если вызов не бросил ошибку).
   * @throws `RangeError` если индекс `n` невалиден (унаследовано от `getCall`).
   */
  nthCallThrew(
    n: number,
    expectedError?: string | AnyErrorCtor | Error
  ): boolean;

  /**
   * Восстанавливает оригинальный метод, если шпион был создан
   * для метода объекта. Ничего не делает, если шпион был создан
   * для отдельной функции.
   */
  restore(): void;
}

/**
 * Создает шпиона.
 *
 * @template TFunc Тип функции-заглушки.
 * @returns        Функция-шпион.
 */
export function createSpy<TFunc extends AnyCallable>(): Spy<TFunc>;

/**
 * Создает шпиона для отдельной функции.
 *
 * @template TFunc                Тип функции, для которой создается шпион.
 * @param    targetFn             Функция, для которой создается шпион.
 * @param    customImplementation Необязательно. Функция для замены поведения
 *                                оригинальной функции. Должна иметь ту же
 *                                сигнатуру, что и `targetFn`.
 * @returns                       Функция-шпион.
 */
export function createSpy<TFunc extends AnyCallable>(
  targetFn: TFunc,
  customImplementation?: TFunc
): Spy<TFunc>;

/**
 * Создание шпиона для метода объекта. Оригинальный метод объекта будет заменен
 * шпионом. Используйте `spy.restore()` для восстановления оригинального метода.
 *
 * @template TObj Тип объекта.
 * @template K                    Ключ метода, для которого создается шпион.
 *                                Должен быть ключом `TObj`, значение которого
 *                                является функцией.
 * @param    targetObject         Объект, метод которого отслеживается.
 * @param    methodName           Имя отслеживаемого метода.
 * @param    customImplementation Необязательно. Функция для замены поведения
 *                                оригинального метода. Должна иметь ту же сигнатуру,
 *                                что и оригинальный метод `TObj[K]`.
 * @returns                       Функция-шпион для метода.
 */
export function createSpy<
  TObj extends object,
  K extends MethodKey<TObj>
>(
  targetObject: TObj,
  methodName: K,
  customImplementation?: TObj[K]
): Spy<Extract<TObj[K], AnyCallable>>;
