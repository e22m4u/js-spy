import {createSpy} from './create-spy.js';

/**
 * Группа позволяет создавать шпионов и управлять ими как одним.
 *
 * @constructor
 */
export function SpiesGroup() {
  this.spies = [];
}

SpiesGroup.prototype.on = function (
  target,
  methodNameOrImpl,
  customImplForMethod,
) {
  const spy = createSpy(target, methodNameOrImpl, customImplForMethod);
  this.spies.push(spy);
  return spy;
};

SpiesGroup.prototype.restore = function () {
  this.spies.forEach(spy => spy.restore());
  this.spies = [];
  return this;
};

/**
 * Создание группы шпионов.
 *
 * @returns {SpiesGroup}
 */
export function createSpiesGroup() {
  return new SpiesGroup();
}
