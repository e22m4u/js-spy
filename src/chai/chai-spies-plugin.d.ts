
declare global {
  namespace Chai {
    interface LanguageChains {
      on: Assertion;
    }
    interface Assertion {
      /**
       * ####.spy
       * Asserts that object is a spy.
       * ```ts
       * expect(spy).to.be.spy;
       * spy.should.be.spy;
       * ```
       */
      spy: Assertion;

      /**
       * ####.called
       * Assert that a spy has been called. Negation passes through.
       * ```ts
       * expect(spy).to.have.been.called();
       * spy.should.have.been.called();
       * ```
       * Note that ```called``` can be used as a chainable method.
       */
      called: ChaiSpies.Called;

      /**
       *  * ####.been
       * * Assert that something has been spied on. Negation passes through.
       * * ```ts
       * * expect(spy).to.have.been.called();
       * * spy.should.have.been.called();
       * ```
       * Note that ```been``` can be used as a chainable method.
       */
      been: ChaiSpies.Been;

      /**
       *  * ####.nth (function)
       * * Assert that something has been spied on on a certain index. Negation passes through.
       * * ```ts
       * * expect(spy).on.nth(5).be.called.with('foobar');
       * * spy.should.on.nth(5).be.called.with('foobar');
       * ```
       * Note that ```nth``` can be used as a chainable method.
       */
      nth(index: number): Assertion;
    }

    namespace ChaiSpies {
      interface Called {
        (): Chai.Assertion;
        with: With;
        always: Always;

        /**
         * ####.once
         * Assert that a spy has been called exactly once.
         * ```ts
         * expect(spy).to.have.been.called.once;
         * expect(spy).to.not.have.been.called.once;
         * spy.should.have.been.called.once;
         * spy.should.not.have.been.called.once;
         * ```
         */
        once: Chai.Assertion;

        /**
         * ####.twice
         * Assert that a spy has been called exactly twice.
         * ```ts
         * expect(spy).to.have.been.called.twice;
         * expect(spy).to.not.have.been.called.twice;
         * spy.should.have.been.called.twice;
         * spy.should.not.have.been.called.twice;
         * ```
         */
        twice: Chai.Assertion;

        /**
         * ####.exactly(n)
         * Assert that a spy has been called exactly ```n``` times.
         * ```ts
         * expect(spy).to.have.been.called.exactly(3);
         * expect(spy).to.not.have.been.called.exactly(3);
         * spy.should.have.been.called.exactly(3);
         * spy.should.not.have.been.called.exactly(3);
         * ```
         */
        exactly(n: number): Chai.Assertion;

        /**
         * ####.min(n) / .at.least(n)
         * Assert that a spy has been called minimum of ```n``` times.
         * ```ts
         * expect(spy).to.have.been.called.min(3);
         * expect(spy).to.not.have.been.called.at.least(3);
         * spy.should.have.been.called.at.least(3);
         * spy.should.not.have.been.called.min(3);
         * ```
         */
        min(n: number): Chai.Assertion;

        /**
         * ####.max(n) / .at.most(n)
         * Assert that a spy has been called maximum of ```n``` times.
         * ```ts
         * expect(spy).to.have.been.called.max(3);
         * expect(spy).to.not.have.been.called.at.most(3);
         * spy.should.have.been.called.at.most(3);
         * spy.should.not.have.been.called.max(3);
         * ```
         */
        max(n: number): Chai.Assertion;

        at: At;
        /**
         * ####.above(n) / .gt(n)
         * Assert that a spy has been called more than ```n``` times.
         * ```ts
         * expect(spy).to.have.been.called.above(3);
         * spy.should.not.have.been.called.above(3);
         * ```
         */
        above(n: number): Chai.Assertion;

        /**
         * ####.above(n) / .gt(n)
         * Assert that a spy has been called more than ```n``` times.
         * ```ts
         * expect(spy).to.have.been.called.gt(3);
         * spy.should.not.have.been.called.gt(3);
         * ```
         */
        gt(n: number): Chai.Assertion;

        /**
         * ####.below(n) / .lt(n)
         * Assert that a spy has been called fewer than ```n``` times.
         * ```ts
         * expect(spy).to.have.been.called.below(3);
         * spy.should.not.have.been.called.below(3);
         * ```
         */
        below(n: number): Chai.Assertion;

        /**
         * ####.below(n) / .lt(n)
         * Assert that a spy has been called fewer than ```n``` times.
         * ```ts
         * expect(spy).to.have.been.called.lt(3);
         * spy.should.not.have.been.called.lt(3);
         * ```
         */
        lt(n: number): Chai.Assertion;
      }

      interface Been extends Chai.Assertion {
        (): Chai.Assertion;
        called: Called;

        /**
         * ####.first
         * Assert that a spy has been called first.
         * ```ts
         * expect(spy).to.have.been.called.first;
         * expect(spy).to.not.have.been.called.first;
         * spy.should.have.been.called.first;
         * spy.should.not.have.been.called.first;
         * ```
         */
        first: Chai.Assertion;

        /**
         * ####.second
         * Assert that a spy has been called second.
         * ```ts
         * expect(spy).to.have.been.called.second;
         * expect(spy).to.not.have.been.called.second;
         * spy.should.have.been.called.second;
         * spy.should.not.have.been.called.second;
         * ```
         */
        second: Chai.Assertion;

        /**
         * ####.third
         * Assert that a spy has been called third.
         * ```ts
         * expect(spy).to.have.been.called.third;
         * expect(spy).to.not.have.been.called.third;
         * spy.should.have.been.called.third;
         * spy.should.not.have.been.called.third;
         * ```
         */
        third: Chai.Assertion;
      }

      interface With {
        /**
         * ####.with
         * Assert that a spy has been called with a given argument at least once, even if more arguments were provided.
         * ```ts
         * spy('foo');
         * expect(spy).to.have.been.called.with('foo');
         * spy.should.have.been.called.with('foo');
         * ```
         * Will also pass for ```spy('foo', 'bar')``` and ```spy(); spy('foo')```.
         * If used with multiple arguments, assert that a spy has been called with all the given arguments at least once.
         * ```ts
         * spy('foo', 'bar', 1);
         * expect(spy).to.have.been.called.with('bar', 'foo');
         * spy.should.have.been.called.with('bar', 'foo');
         * ```
         */
        (
          a: any,
          b?: any,
          c?: any,
          d?: any,
          e?: any,
          f?: any,
          g?: any,
          h?: any,
          i?: any,
          j?: any,
        ): Chai.Assertion;

        /**
         * ####.with.exactly
         * Similar to .with, but will pass only if the list of arguments is exactly the same as the one provided.
         * ```ts
         * spy();
         * spy('foo', 'bar');
         * expect(spy).to.have.been.called.with.exactly('foo', 'bar');
         * spy.should.have.been.called.with.exactly('foo', 'bar');
         * ```
         * Will not pass for ```spy('foo')```, ```spy('bar')```, ```spy('bar'); spy('foo')```, ```spy('foo'); spy('bar')```, ```spy('bar', 'foo')``` or ```spy('foo', 'bar', 1)```.
         * Can be used for calls with a single argument too.
         */

        exactly(
          a?: any,
          b?: any,
          c?: any,
          d?: any,
          e?: any,
          f?: any,
          g?: any,
          h?: any,
          i?: any,
          j?: any,
        ): Chai.Assertion;
      }

      interface Always {
        with: AlwaysWith;
      }

      interface AlwaysWith {
        /**
         * ####.always.with
         * Assert that every time the spy has been called the argument list contained the given arguments.
         * ```ts
         * spy('foo');
         * spy('foo', 'bar');
         * spy(1, 2, 'foo');
         * expect(spy).to.have.been.called.always.with('foo');
         * spy.should.have.been.called.always.with('foo');
         * ```
         */
        (
          a: any,
          b?: any,
          c?: any,
          d?: any,
          e?: any,
          f?: any,
          g?: any,
          h?: any,
          i?: any,
          j?: any,
        ): Chai.Assertion;

        /**
         * ####.always.with.exactly
         * Assert that the spy has never been called with a different list of arguments than the one provided.
         * ```ts
         * spy('foo');
         * spy('foo');
         * expect(spy).to.have.been.called.always.with.exactly('foo');
         * spy.should.have.been.called.always.with.exactly('foo');
         * ```
         */
        exactly(
          a?: any,
          b?: any,
          c?: any,
          d?: any,
          e?: any,
          f?: any,
          g?: any,
          h?: any,
          i?: any,
          j?: any,
        ): Chai.Assertion;
      }

      interface At {
        /**
         * ####.min(n) / .at.least(n)
         * Assert that a spy has been called minimum of ```n``` times.
         * ```ts
         * expect(spy).to.have.been.called.min(3);
         * expect(spy).to.not.have.been.called.at.least(3);
         * spy.should.have.been.called.at.least(3);
         * spy.should.not.have.been.called.min(3);
         * ```
         */
        least(n: number): Chai.Assertion;

        /**
         * ####.max(n) / .at.most(n)
         * Assert that a spy has been called maximum of ```n``` times.
         * ```ts
         * expect(spy).to.have.been.called.max(3);
         * expect(spy).to.not.have.been.called.at.most(3);
         * spy.should.have.been.called.at.most(3);
         * spy.should.not.have.been.called.max(3);
         * ```
         */
        most(n: number): Chai.Assertion;
      }
    }
  }
}

/**
 * Chai spies plugin.
 */
export declare const chaiSpiesPlugin: any;
