import {AnyCallable, MethodKey} from './types.js';

/**
 * Информация о единичном вызове
 * отслеживаемой функции.
 *
 * @template Args
 * @template Return
 */
export interface CallInfo<Args extends any[] = any[], Return = any> {
  /**
   * Аргументы, с которыми был вызван шпион.
   */
  readonly args: Args;

  /**
   * Контекст this, с которым был вызван шпион.
   */
  readonly thisArg: any;

  /**
   * Значение, возвращенное шпионом.
   * (undefined, если шпион выбросил ошибку)
   */
  readonly returnValue: Return | undefined;

  /**
   * Ошибка, выброшенная шпионом.
   * (undefined, если шпион не выбросил ошибку)
   */
  readonly error: unknown | undefined;
}

/**
 * Представляет функцию-шпиона, созданную `createSpy`.
 * Это вызываемая функция, которая также имеет свойства
 * и методы для инспекции вызовов.
 *
 * @template TFunc
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
   * Булево значение, указывающее,
   * был ли шпион вызван хотя бы один раз.
   *
   * @readonly
   */
  readonly isCalled: boolean;

  /**
   * Восстанавливает оригинальный метод,
   * если шпион был создан для метода объекта.
   * Ничего не делает, если шпион был создан
   * для отдельной функции.
   */
  restore(): void;
}

/**
 * Создает шпиона.
 */
export function createSpy(): Spy<(...args: any[]) => void>;

/**
 * Создает шпиона для отдельной функции.
 *
 * @param targetFn
 * @param customImpl
 */
export function createSpy<TFunc extends AnyCallable>(
  targetFn: TFunc,
  customImpl?: TFunc,
): Spy<TFunc>;

/**
 * Создание шпиона для метода объекта. Оригинальный метод
 * объекта будет заменен шпионом. Используйте `spy.restore()`
 * для восстановления оригинального метода.
 *
 * @param targetObject
 * @param methodName
 * @param customImpl
 */
export function createSpy<TObj extends object, K extends MethodKey<TObj>>(
  targetObject: TObj,
  methodName: K,
  customImpl?: TObj[K],
): Spy<Extract<TObj[K], AnyCallable>>;
