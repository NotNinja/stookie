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

const mapOwn = require('../../src/util/map-own');

describe('util/map-own', () => {
  let callback;

  beforeEach(() => {
    callback = sinon.spy((value, key) => `Updated value for "${key}" from "${value}"`);
  });

  context('when obj has inherited and own properties', () => {
    it('should only invoke callback and map each own property', () => {
      function TestType() {}
      TestType.prototype.fizz = 'buzz';

      const value = new TestType();
      value.foo = 'bar';
      value.fu = 'baz';

      const result = mapOwn(value, callback);

      assert.deepStrictEqual(result, {
        foo: 'Updated value for "foo" from "bar"',
        fu: 'Updated value for "fu" from "baz"'
      }, 'Returns object with mapped own properties');

      assert.equal(callback.callCount, 2, 'Invoked callback for each own property');
      assert.ok(callback.calledWithExactly('bar', 'foo', value), 'Invoked callback for "foo" own property');
      assert.ok(callback.calledWithExactly('baz', 'fu', value), 'Invoked callback for "fu" own property');
    });
  });

  context('when obj has no properties', () => {
    it('should never invoke callback and return empty object', () => {
      const result = mapOwn({}, callback);

      assert.deepEqual(result, {}, 'Returns empty object');

      assert.equal(callback.callCount, 0, 'Never invoked callback');
    });
  });

  context('when obj has only inherited properties', () => {
    it('should never invoke callback and return empty object', () => {
      function TestType() {}
      TestType.prototype.foo = 'bar';
      TestType.prototype.fu = 'baz';

      const value = new TestType();

      const result = mapOwn(value, callback);

      assert.deepEqual(result, {}, 'Returns empty object');

      assert.equal(callback.callCount, 0, 'Never invoked callback');
    });
  });

  context('when obj has only own properties', () => {
    it('should invoke callback and map each own property', () => {
      function TestType() {}

      const value = new TestType();
      value.foo = 'bar';
      value.fu = 'baz';

      const result = mapOwn(value, callback);

      assert.deepStrictEqual(result, {
        foo: 'Updated value for "foo" from "bar"',
        fu: 'Updated value for "fu" from "baz"'
      }, 'Returns object with mapped own properties');

      assert.equal(callback.callCount, 2, 'Invoked callback for each own property');
      assert.ok(callback.calledWithExactly('bar', 'foo', value), 'Invoked callback for "foo" own property');
      assert.ok(callback.calledWithExactly('baz', 'fu', value), 'Invoked callback for "fu" own property');
    });
  });

  context('when obj is null', () => {
    it('should never invoke callback and return empty object', () => {
      const result = mapOwn(null, callback);

      assert.deepEqual(result, {}, 'Returns empty object');

      assert.equal(callback.callCount, 0, 'Never invoked callback');
    });
  });
});
