import {createSpy} from './create-spy.js';

/**
 * Песочница позволяет создавать шпионов
 * и управлять ими как единым целым.
 */
export class Sandbox {
  /**
   * Constructor.
   */
  constructor() {
    this.spies = [];
  }

  /**
   * Создает шпиона для отдельной функции
   * или метода объекта и добавляет его в песочницу.
   *
   * @param {Function|object} [target]
   * @param {Function|string} [methodNameOrImpl]
   * @param {Function} [customImplForMethod]
   * @returns {Function}
   */
  on(target, methodNameOrImpl, customImplForMethod) {
    const spy = createSpy(target, methodNameOrImpl, customImplForMethod);
    this.spies.push(spy);
    return spy;
  }

  /**
   * Восстановление всех оригинальных методов объектов,
   * для которых были созданы шпионы в данной песочнице,
   * и сброс истории вызовов.
   *
   * @returns {this}
   */
  restore() {
    this.spies.forEach(spy => spy.restore());
    this.spies = [];
    return this;
  }
}

/**
 * Создание песочницы.
 *
 * @returns {Sandbox}
 */
export function createSandbox() {
  return new Sandbox();
}
