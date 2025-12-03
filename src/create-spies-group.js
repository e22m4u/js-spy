import {createSpy} from './create-spy.js';

/**
 * Группа позволяет создавать шпионов
 * и управлять ими как одним.
 */
export class SpiesGroup {
  /**
   * Constructor.
   */
  constructor() {
    this.spies = [];
  }

  /**
   * Создает шпиона для отдельной функции
   * или метода объекта и добавляет его в группу.
   *
   * @param target
   * @param methodNameOrImpl
   * @param customImplForMethod
   */
  on(target, methodNameOrImpl, customImplForMethod) {
    const spy = createSpy(target, methodNameOrImpl, customImplForMethod);
    this.spies.push(spy);
    return spy;
  }

  /**
   * Восстановление всех оригинальных методов объектов,
   * для которых были созданы шпионы в этой группе,
   * и сброс истории вызовов для всех шпионов в группе.
   * Очищает внутренний список шпионов.
   */
  restore() {
    this.spies.forEach(spy => spy.restore());
    this.spies = [];
    return this;
  }
}

/**
 * Создание группы шпионов.
 *
 * @returns {SpiesGroup}
 */
export function createSpiesGroup() {
  return new SpiesGroup();
}
