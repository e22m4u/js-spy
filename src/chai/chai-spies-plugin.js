/* eslint-disable jsdoc/require-jsdoc */

/**
 * Chai spies plugin
 *
 * @param {*} chai
 * @param {*} _
 */
/* prettier-ignore */
export function chaiSpiesPlugin(chai, _) {
  const Assertion = chai.Assertion;

  Assertion.addProperty('spy', function () {
    this.assert(
        this._obj.__isSpy === true
      , 'expected ' + this._obj + ' to be a spy'
      , 'expected ' + this._obj + ' to not be a spy');
    return this;
  });

  function assertCalled (n) {
    new Assertion(this._obj).to.be.spy;
    var spy = this._obj;

    if (n) {
      this.assert(
          spy.calls.length === n
        , 'expected ' + this._obj + ' to have been called #{exp} but got #{act}'
        , 'expected ' + this._obj + ' to have not been called #{exp}'
        , n
        , spy.calls.length
      );
    } else {
      this.assert(
          spy.called === true
        , 'expected ' + this._obj + ' to have been called'
        , 'expected ' + this._obj + ' to not have been called'
      );
    }
  }

  function assertCalledChain () {
    new Assertion(this._obj).to.be.spy;
  }

  Assertion.addChainableMethod('called', assertCalled, assertCalledChain);

  Assertion.addProperty('once', function () {
    new Assertion(this._obj).to.be.spy;
    this.assert(
        this._obj.calls.length === 1
      , 'expected ' + this._obj + ' to have been called once but got #{act}'
      , 'expected ' + this._obj + ' to not have been called once'
      , 1
      , this._obj.calls.length );
  });

  Assertion.addProperty('twice', function () {
    new Assertion(this._obj).to.be.spy;
    this.assert(
        this._obj.calls.length === 2
      , 'expected ' + this._obj + ' to have been called twice but got #{act}'
      , 'expected ' + this._obj + ' to not have been called twice'
      , 2
      , this._obj.calls.length
    );
  });

  function nthCallWith(spy, n, expArgs) {
    if (spy.calls.length <= n) return false;

    var actArgs = spy.calls[n].args.slice()
      , passed = 0;

    expArgs.forEach(function (expArg) {
      for (var i = 0; i < actArgs.length; i++) {
        if (_.eql(actArgs[i], expArg)) {
          passed++;
          actArgs.splice(i, 1);
          break;
        }
      }
    });

    return passed === expArgs.length;
  }

  function numberOfCallsWith(spy, expArgs) {
    var found = 0
      , calls = spy.calls;

    for (var i = 0; i < calls.length; i++) {
      if (nthCallWith(spy, i, expArgs)) {
        found++;
      }
    }

    return found;
  }

  Assertion.addProperty('first', function () {
    if (this._obj.__isSpy) {
      _.flag(this, 'spy nth call with', 1);
    }
  });

  Assertion.addProperty('second', function () {
    if (this._obj.__isSpy) {
      _.flag(this, 'spy nth call with', 2);
    }
  });

  Assertion.addProperty('third', function () {
    if (this._obj.__isSpy) {
      _.flag(this, 'spy nth call with', 3);
    }
  });

  Assertion.addProperty('on');

  Assertion.addChainableMethod('nth', function (n) {
    if (this._obj.__isSpy) {
      _.flag(this, 'spy nth call with', n);
    }
  });

  function generateOrdinalNumber(n) {
    if (n === 1) return 'first';
    if (n === 2) return 'second';
    if (n === 3) return 'third';
    return n + 'th';
  }

  function assertWith() {
    new Assertion(this._obj).to.be.spy;
    var expArgs = [].slice.call(arguments, 0)
      , spy = this._obj
      , calls = spy.calls
      , always = _.flag(this, 'spy always')
      , nthCall = _.flag(this, 'spy nth call with');

    if (always) {
      var passed = numberOfCallsWith(spy, expArgs);
      this.assert(
          calls.length > 0 && passed === calls.length
        , 'expected ' + this._obj + ' to have been always called with #{exp} but got ' + passed + ' out of ' + calls.length
        , 'expected ' + this._obj + ' to have not always been called with #{exp}'
        , expArgs
      );
    } else if (nthCall) {
      var ordinalNumber = generateOrdinalNumber(nthCall),
          actArgs = calls[nthCall - 1];
      new Assertion(this._obj).to.be.have.been.called.min(nthCall);
      this.assert(
          nthCallWith(spy, nthCall - 1, expArgs)
        , 'expected ' + this._obj + ' to have been called at the ' + ordinalNumber + ' time with #{exp} but got #{act}'
        , 'expected ' + this._obj + ' to have not been called at the ' + ordinalNumber + ' time with #{exp}'
        , expArgs
        , actArgs
      );
    } else {
      const passed = numberOfCallsWith(spy, expArgs);
      this.assert(
          passed > 0
        , 'expected ' + this._obj + ' to have been called with #{exp}'
        , 'expected ' + this._obj + ' to have not been called with #{exp} but got ' + passed + ' times'
        , expArgs
      );
    }
  }

  function assertWithChain () {
    if (this._obj.__isSpy) {
      _.flag(this, 'spy with', true);
    }
  }

  Assertion.addChainableMethod('with', assertWith, assertWithChain);

  Assertion.addProperty('always', function () {
    if (this._obj.__isSpy) {
      _.flag(this, 'spy always', true);
    }
  });

  Assertion.addMethod('exactly', function () {
    new Assertion(this._obj).to.be.spy;
    var always = _.flag(this, 'spy always')
      , _with = _.flag(this, 'spy with')
      , args = [].slice.call(arguments, 0)
      , calls = this._obj.calls
      , nthCall = _.flag(this, 'spy nth call with')
      , passed;

    if (always && _with) {
      passed = 0
      calls.forEach(function (call) {
        if (call.args.length !== args.length) return;
        if (_.eql(call.args, args)) passed++;
      });

      this.assert(
          calls.length > 0 && passed === calls.length
        , 'expected ' + this._obj + ' to have been always called with exactly #{exp} but got ' + passed + ' out of ' + calls.length
        , 'expected ' + this._obj + ' to have not always been called with exactly #{exp}'
        , args
      );
    } else if(_with && nthCall) {
      var ordinalNumber = generateOrdinalNumber(nthCall),
          actArgs = calls[nthCall - 1];
      new Assertion(this._obj).to.be.have.been.called.min(nthCall);
      this.assert(
          _.eql(actArgs, args)
        , 'expected ' + this._obj + ' to have been called at the ' + ordinalNumber + ' time with exactly #{exp} but got #{act}'
        , 'expected ' + this._obj + ' to have not been called at the ' + ordinalNumber + ' time with exactly #{exp}'
        , args
        , actArgs
      );
    } else if (_with) {
      passed = 0;
      calls.forEach(function (call) {
        if (call.args.length !== args.length) return;
        if (_.eql(call.args, args)) passed++;
      });

      this.assert(
          passed > 0
        , 'expected ' + this._obj + ' to have been called with exactly #{exp}'
        , 'expected ' + this._obj + ' to not have been called with exactly #{exp} but got ' + passed + ' times'
        , args
      );
    } else {
      this.assert(
          this._obj.calls.length === args[0]
        , 'expected ' + this._obj + ' to have been called #{exp} times but got #{act}'
        , 'expected ' + this._obj + ' to not have been called #{exp} times'
        , args[0]
        , this._obj.calls.length
      );
    }
  });

  function above (_super) {
    return function (n) {
      if (this._obj.__isSpy) {
        new Assertion(this._obj).to.be.spy;

        this.assert(
            this._obj.calls.length > n
          , 'expected ' + this._obj + ' to have been called more than #{exp} times but got #{act}'
          , 'expected ' + this._obj + ' to have been called at most #{exp} times but got #{act}'
          , n
          , this._obj.calls.length
        );
      } else {
        _super.apply(this, arguments);
      }
    }
  }

  Assertion.overwriteMethod('above', above);
  Assertion.overwriteMethod('gt', above);

  function below (_super) {
    return function (n) {
      if (this._obj.__isSpy) {
        new Assertion(this._obj).to.be.spy;

        this.assert(
            this._obj.calls.length <  n
          , 'expected ' + this._obj + ' to have been called fewer than #{exp} times but got #{act}'
          , 'expected ' + this._obj + ' to have been called at least #{exp} times but got #{act}'
          , n
          , this._obj.calls.length
        );
      } else {
        _super.apply(this, arguments);
      }
    }
  }

  Assertion.overwriteMethod('below', below);
  Assertion.overwriteMethod('lt', below);

  function min (_super) {
    return function (n) {
      if (this._obj.__isSpy) {
        new Assertion(this._obj).to.be.spy;

        this.assert(
            this._obj.calls.length >= n
          , 'expected ' + this._obj + ' to have been called at least #{exp} times but got #{act}'
          , 'expected ' + this._obj + ' to have been called fewer than #{exp} times but got #{act}'
          , n
          , this._obj.calls.length
        );
      } else {
        _super.apply(this, arguments);
      }
    }
  }

  Assertion.overwriteMethod('min', min);
  Assertion.overwriteMethod('least', min);

  function max (_super) {
    return function (n) {
      if (this._obj.__isSpy) {
        new Assertion(this._obj).to.be.spy;

        this.assert(
            this._obj.calls.length <=  n
          , 'expected ' + this._obj + ' to have been called at most #{exp} times but got #{act}'
          , 'expected ' + this._obj + ' to have been called more than #{exp} times but got #{act}'
          , n
          , this._obj.calls.length
        );
      } else {
        _super.apply(this, arguments);
      }
    }
  }

  Assertion.overwriteMethod('max', max);
  Assertion.overwriteMethod('most', max);
}
