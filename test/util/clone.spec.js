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

/* eslint-disable no-void */

const assert = require('assert');

const clone = require('../../src/util/clone');

describe('util/clone', () => {
  context('when value is array', () => {
    it('should return shallow copy of elements within array', () => {
      const value = [
        123,
        'foo',
        { fu: 'baz' }
      ];

      const result = clone(value);

      assert.notStrictEqual(result, value, 'Does not return value');
      assert.deepStrictEqual(result, value, 'Returns copy of value');
      assert.strictEqual(result[2], value[2], 'Copy is shallow');
    });
  });

  context('when value is not array or object', () => {
    const testValues = [
      null,
      void 0,
      true,
      function() {},
      'foo',
      123,
      Symbol('foo')
    ];

    it('should return value', () => {
      testValues.forEach((value, index) => {
        assert.strictEqual(clone(value), value, `Returns value for value at index: ${index}`);
      });
    });
  });

  context('when value is object', () => {
    it('should return shallow copy of own properties within object', () => {
      class TestType {

        constructor() {
          this.foo = 'bar';
          this.fu = { bazz: true };
        }

        get fizz() {
          return 'buzz';
        }

      }

      const value = new TestType();

      const result = clone(value);

      assert.notStrictEqual(result, value, 'Does not return value');
      assert.deepStrictEqual(result, {
        foo: value.foo,
        fu: value.fu
      }, 'Returns copy of value');
      assert.strictEqual(result.fu, value.fu, 'Copy is shallow');
    });
  });
});
