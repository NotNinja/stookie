/*
 * Copyright (C) 2018 Alasdair Mercer, !ninja
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const assert = require('assert');
const sinon = require('sinon');

const forOwn = require('../../src/util/for-own');

describe('util/for-own', () => {
  let callback;

  beforeEach(() => {
    callback = sinon.spy();
  });

  context('when obj has inherited and own properties', () => {
    it('should only invoke callback for each own property', () => {
      class TestType {

        constructor() {
          this.foo = 'bar';
          this.fu = 'baz';
        }

        get fizz() {
          return 'buzz';
        }

      }

      const value = new TestType();

      forOwn(value, callback);

      assert.equal(callback.callCount, 2, 'Invoked callback for each own property');
      assert.ok(callback.calledWithExactly('bar', 'foo', value), 'Invoked callback for "foo" own property');
      assert.ok(callback.calledWithExactly('baz', 'fu', value), 'Invoked callback for "fu" own property');
    });
  });

  context('when obj has no properties', () => {
    it('should never invoke callback', () => {
      forOwn({}, callback);

      assert.equal(callback.callCount, 0, 'Never invoked callback');
    });
  });

  context('when obj has only inherited properties', () => {
    it('should never invoke callback', () => {
      class TestType {

        get foo() {
          return 'bar';
        }

        get fu() {
          return 'baz';
        }

      }

      forOwn(new TestType(), callback);

      assert.equal(callback.callCount, 0, 'Never invoked callback');
    });
  });

  context('when obj has only own properties', () => {
    it('should invoke callback for each own property', () => {
      class TestType {

        constructor() {
          this.foo = 'bar';
          this.fu = 'baz';
        }

      }

      const value = new TestType();

      forOwn(value, callback);

      assert.equal(callback.callCount, 2, 'Invoked callback for each own property');
      assert.ok(callback.calledWithExactly('bar', 'foo', value), 'Invoked callback for "foo" own property');
      assert.ok(callback.calledWithExactly('baz', 'fu', value), 'Invoked callback for "fu" own property');
    });
  });

  context('when obj is null', () => {
    it('should never invoke callback', () => {
      forOwn(null, callback);

      assert.equal(callback.callCount, 0, 'Never invoked callback');
    });
  });
});
