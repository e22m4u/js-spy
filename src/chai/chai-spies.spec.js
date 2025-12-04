import {expect} from 'chai';
import {createSpy} from '../create-spy.js';
import {chaiSpies} from './chai-spies.js';

describe('chaiSpies', function () {
  it('should be a function', function () {
    expect(chaiSpies).to.be.a('function');
  });

  it('should assert that object is a spy', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.be.spy;
    expect({}).to.not.be.spy;
  });

  it('should assert that a spy has been called', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called();
    spy();
    expect(spy).to.have.been.called();
  });

  it('should assert that something has been spied on on a certain index', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    spy('foobar1');
    spy('foobar2');
    spy('foobar3');
    expect(spy).on.nth(3).be.called.with('foobar3');
  });

  it('should assert that a spy has been called exactly once', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.once;
    spy();
    expect(spy).to.have.been.called.once;
    spy();
    expect(spy).to.not.have.been.called.once;
  });

  it('should assert that a spy has been called exactly twice', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.twice;
    spy();
    expect(spy).to.not.have.been.called.twice;
    spy();
    expect(spy).to.have.been.called.twice;
    spy();
    expect(spy).to.not.have.been.called.twice;
  });

  it('should assert that a spy has been called exactly 0 times', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.have.been.called.exactly(0);
    spy();
    expect(spy).to.not.have.been.called.exactly(0);
  });

  it('should assert that a spy has been called exactly *n times', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.exactly(2);
    spy();
    expect(spy).to.not.have.been.called.exactly(2);
    spy();
    expect(spy).to.have.been.called.exactly(2);
    spy();
    expect(spy).to.not.have.been.called.exactly(2);
  });

  it('should assert that a spy has been called minimum of *n times', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.min(2);
    spy();
    expect(spy).to.not.have.been.called.min(2);
    spy();
    expect(spy).to.have.been.called.min(2);
    spy();
    expect(spy).to.have.been.called.min(2);
  });

  it('should assert that a spy has been called maximum of *n times', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.have.been.called.max(2);
    spy();
    expect(spy).to.have.been.called.max(2);
    spy();
    expect(spy).to.have.been.called.max(2);
    spy();
    expect(spy).to.not.have.been.called.max(2);
  });

  it('should assert that a spy has been called more than *n times', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.above(2);
    spy();
    expect(spy).to.not.have.been.called.above(2);
    spy();
    expect(spy).to.not.have.been.called.above(2);
    spy();
    expect(spy).to.have.been.called.above(2);
  });

  it('should assert that a spy has been called fewer than *n times', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.have.been.called.below(2);
    spy();
    expect(spy).to.have.been.called.below(2);
    spy();
    expect(spy).to.not.have.been.called.below(2);
    spy();
    expect(spy).to.not.have.been.called.below(2);
  });

  it('should assert that a spy has been called greater than *n times', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.gt(2);
    spy();
    expect(spy).to.not.have.been.called.gt(2);
    spy();
    expect(spy).to.not.have.been.called.gt(2);
    spy();
    expect(spy).to.have.been.called.gt(2);
  });

  it('should assert that a spy has been called lower than *n times', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.have.been.called.lt(2);
    spy();
    expect(spy).to.have.been.called.lt(2);
    spy();
    expect(spy).to.not.have.been.called.lt(2);
    spy();
    expect(spy).to.not.have.been.called.lt(2);
  });

  it('should assert that a spy has been called first', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.first;
    spy();
    expect(spy).to.have.been.called.first;
    spy();
    expect(spy).to.have.been.called.first;
  });

  it('should assert that a spy has been called second', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.second;
    spy();
    expect(spy).to.not.have.been.called.second;
    spy();
    expect(spy).to.have.been.called.second;
  });

  it('should assert that a spy has been called third', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.third;
    spy();
    expect(spy).to.not.have.been.called.third;
    spy();
    expect(spy).to.not.have.been.called.third;
    spy();
    expect(spy).to.have.been.called.third;
  });

  it('should assert that a spy has been called with given arguments and match its order', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.with(1);
    spy(1, 2, 3);
    expect(spy).to.not.have.been.called.with(1);
    expect(spy).to.not.have.been.called.with(1, 2);
    expect(spy).to.have.been.called.with(1, 2, 3);
    expect(spy).to.not.have.been.called.with(2, 1);
    expect(spy).to.not.have.been.called.with(1, 3);
    expect(spy).to.not.have.been.called.with(3, 2, 1);
    expect(spy).to.not.have.been.called.with(1, 2, 3, 4);
  });

  it('should assert that every time the spy has been called with given arguments', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.always.with(1, 2, 3);
    spy(1, 2, 3);
    expect(spy).to.have.been.called.always.with(1, 2, 3);
    expect(spy).to.not.have.been.called.always.with(3, 2, 1);
    expect(spy).to.not.have.been.called.always.with(1, 2);
    expect(spy).to.not.have.been.called.always.with(1);
    spy(1);
    expect(spy).to.not.have.been.called.always.with(1, 2, 3);
    expect(spy).to.not.have.been.called.always.with(1, 2);
    expect(spy).to.not.have.been.called.always.with(1);
  });

  it('should assert that a spy has been called at least *n times', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.not.have.been.called.at.least(2);
    spy();
    expect(spy).to.not.have.been.called.at.least(2);
    spy();
    expect(spy).to.have.been.called.at.least(2);
    spy();
    expect(spy).to.have.been.called.at.least(2);
  });

  it('should assert that a spy has been called at most *n times', function () {
    const fn = () => undefined;
    const spy = createSpy(fn);
    expect(spy).to.have.been.called.at.most(2);
    spy();
    expect(spy).to.have.been.called.at.most(2);
    spy();
    expect(spy).to.have.been.called.at.most(2);
    spy();
    expect(spy).to.not.have.been.called.at.most(2);
  });
});
