import {Spy} from './create-spy.js';
import {MethodKey} from './create-spy.js';
import {AnyCallable} from './create-spy.js';

/**
 * Представляет группу шпионов, позволяющую
 * управлять ими коллективно.
 */
export interface SpiesGroup {
  /**
   * Внутренний массив, хранящий все шпионы, созданные в этой группе.
   * Обычно не предназначен для прямого манипулирования.
   * @readonly
   */
  readonly spies: Spy<any>[]; // массив шпионов любого типа

  /**
   * Создает шпиона для отдельной функции и добавляет его в группу.
   *
   * @template TFunc                Тип функции, для которой создается шпион.
   * @param    targetFn             Функция, для которой создается шпион.
   * @param    customImplementation Необязательно. Функция для замены поведения
   *                                оригинальной функции. Должна иметь ту же сигнатуру, что и `targetFn`.
   * @returns                       Созданная функция-шпион.
   */
  on<TFunc extends AnyCallable>(
    targetFn: TFunc,
    customImplementation?: TFunc
  ): Spy<TFunc>;

  /**
   * Создает шпиона для метода объекта, добавляет его в группу
   * и заменяет оригинальный метод объекта шпионом.
   *
   * @template TObj                 Тип объекта.
   * @template K                    Ключ метода, для которого создается шпион.
   * @param    targetObject         Объект, метод которого отслеживается.
   * @param    methodName           Имя отслеживаемого метода.
   * @param    customImplementation Необязательно. Функция для замены поведения
   *                                оригинального метода. Должна иметь ту же сигнатуру, что и оригинальный
   *                                метод `TObj[K]`.
   * @returns                       Созданная функция-шпион для метода.
   */
  on<
    TObj extends object,
    K extends MethodKey<TObj>
  >(
    targetObject: TObj,
    methodName: K,
    customImplementation?: TObj[K]
  ): Spy<Extract<TObj[K], AnyCallable>>;

  /**
   * Восстановление всех оригинальных методов объектов, для которых
   * были созданы шпионы в этой группе, и сброс истории вызовов
   * для всех шпионов в группе. Очищает внутренний список шпионов.
   *
   * @returns `this` (экземпляр `SpiesGroup`) для возможной цепочки вызовов.
   */
  restore(): this;
}

/**
 * Фабричная функция для создания нового экземпляра `SpiesGroup`.
 *
 * @returns Новый экземпляр `SpiesGroup`.
 */
export function createSpiesGroup(): SpiesGroup;
