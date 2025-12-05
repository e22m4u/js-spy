import {Spy} from './create-spy.js';
import {MethodKey, AnyCallable} from './types.js';

/**
 * Песочница позволяет создавать шпионов
 * и управлять ими как единым целым.
 */
export declare class Sandbox {
  /**
   * Внутренний массив, хранящий все шпионы.
   */
  spies: Spy<any>[];

  /**
   * Создает шпиона для отдельной функции
   * и добавляет его в песочницу.
   */
  on<TFunc extends AnyCallable>(
    target: TFunc,
    customImpl?: TFunc,
  ): Spy<TFunc>;

  /**
   * Создает шпиона для метода объекта, добавляет
   * его в песочницу и заменяет оригинальный метод.
   */
  on<TObj extends object, K extends MethodKey<TObj>>(
    target: TObj,
    methodName: K,
    customImpl?: AnyCallable,
  ): Spy<Extract<TObj[K], AnyCallable>>;

  /**
   * Восстановление всех оригинальных методов объектов,
   * для которых были созданы шпионы в данной песочнице,
   * и сброс истории вызовов.
   */
  restore(): this;
}

/**
 * Создание песочницы.
 */
export function createSandbox(): Sandbox;