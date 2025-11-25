import {Spy} from './create-spy.js';
import {MethodKey, AnyCallable} from './types.js';

/**
 * Представляет группу шпионов, позволяющую
 * управлять ими коллективно.
 */
export declare class SpiesGroup {
  /**
   * Внутренний массив, хранящий все шпионы,
   * созданные в этой группе. Не предназначен
   * для прямого доступа.
   */
  readonly spies: Spy<any>[];

  /**
   * Создает шпиона для отдельной функции
   * и добавляет его в группу.
   *
   * @param target
   * @param customImplementation
   */
  on<TFunc extends AnyCallable>(
    target: TFunc,
    customImplementation?: TFunc,
  ): Spy<TFunc>;

  /**
   * Создает шпиона для метода объекта, добавляет
   * его в группу и заменяет оригинальный метод
   * объекта шпионом.
   *
   * @param target
   * @param methodNameOrImpl
   * @param customImplForMethod
   */
  on<TObj extends object, K extends MethodKey<TObj>>(
    target: TObj,
    methodName: K,
    customImplForMethod?: TObj[K],
  ): Spy<Extract<TObj[K], AnyCallable>>;

  /**
   * Восстановление всех оригинальных методов объектов,
   * для которых были созданы шпионы в этой группе,
   * и сброс истории вызовов для всех шпионов в группе.
   * Очищает внутренний список шпионов.
   */
  restore(): this;
}

/**
 * Фабричная функция для создания
 * нового экземпляра `SpiesGroup`.
 */
export function createSpiesGroup(): SpiesGroup;
