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
       * ####.been
       * Assert that something has been spied on. Negation passes through.
       * ```ts
       * expect(spy).to.have.been.called();
       * spy.should.have.been.called();
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
         * Assert that a spy has been called with the given arguments.
         * ```ts
         * spy('foo', 'bar');
         * expect(spy).to.have.been.called.with('foo', 'bar');
         * ```
         */
        (...args: any[]): Chai.Assertion;
      }

      interface Always {
        with: AlwaysWith;
      }

      interface AlwaysWith {
        /**
         * ####.always.with
         * Assert that every time the spy has been called the argument list strictly matched the given arguments (order and value).
         * ```ts
         * spy('foo', 'bar');
         * spy('foo', 'bar', 'baz');
         * expect(spy).to.have.been.called.always.with('foo', 'bar');
         * ```
         */
        (...args: any[]): Chai.Assertion;
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
export declare const chaiSpies: any;