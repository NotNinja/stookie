/*
 * Copyright (C) 2018 Alasdair Mercer
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

/* eslint-disable no-array-constructor, no-new-func, no-new-object, no-new-wrappers, no-void */

const assert = require('assert');

const checkType = require('../../src/util/check-type');

describe('util/check-type', () => {
  function describeCheckTypeMethod(methodName, type, passValues, failValues) {
    const method = checkType[methodName];

    describe(`.${methodName}`, () => {
      context(`when value is ${type}`, () => {
        it('should return true', () => {
          passValues.forEach((value, index) => {
            assert.strictEqual(method(value), true, `Returns true for value at index: ${index}`);
          });
        });
      });

      context(`when value is not ${type}`, () => {
        it('should return false', () => {
          failValues.forEach((value, index) => {
            assert.strictEqual(method(value), false, `Returns false for value at index: ${index}`);
          });
        });
      });
    });
  }

  describeCheckTypeMethod(
    'isArray',
    'array',
    [
      [ 'foo', 'bar' ],
      new Array()
    ],
    [
      null,
      void 0,
      true,
      function() {},
      {},
      /foo/,
      'foo',
      123,
      Infinity,
      NaN,
      Symbol('foo'),
      new Date(),
      new Error()
    ]
  );

  describeCheckTypeMethod(
    'isBoolean',
    'boolean',
    [
      false,
      true,
      new Boolean(0),
      new Boolean(1)
    ],
    [
      null,
      void 0,
      function() {},
      {},
      [],
      /foo/,
      'foo',
      123,
      Infinity,
      NaN,
      Symbol('foo'),
      new Date(),
      new Error()
    ]
  );

  describeCheckTypeMethod(
    'isError',
    'error',
    [
      new Error(),
      new TypeError()
    ],
    [
      null,
      void 0,
      true,
      function() {},
      {},
      [],
      /foo/,
      'foo',
      123,
      Infinity,
      NaN,
      Symbol('foo'),
      new Date()
    ]
  );

  describeCheckTypeMethod(
    'isFunction',
    'function',
    [
      function() {},
      () => {},
      new Function(),
      class {}
    ],
    [
      null,
      void 0,
      true,
      {},
      [],
      /foo/,
      'foo',
      123,
      Infinity,
      NaN,
      Symbol('foo'),
      new Date(),
      new Error()
    ]
  );

  describeCheckTypeMethod(
    'isObject',
    'object',
    [
      {},
      { foo: 'bar' },
      Object.create({ fu: 'baz' }),
      new Object(),
      new class {}(),
      [],
      new Array(),
      new Error(),
      /fizz/,
      new Date()
    ],
    [
      null,
      void 0,
      true,
      function() {},
      'foo',
      123,
      Infinity,
      NaN,
      Symbol('foo')
    ]
  );

  describeCheckTypeMethod(
    'isRegExp',
    'regular expression',
    [
      /foo/,
      new RegExp('bar')
    ],
    [
      null,
      void 0,
      true,
      function() {},
      {},
      [],
      'foo',
      123,
      Infinity,
      NaN,
      Symbol('foo'),
      new Date(),
      new Error()
    ]
  );

  describeCheckTypeMethod(
    'isString',
    'string',
    [
      'foo',
      new String('bar'),
      `fu ${'baz'}`
    ],
    [
      null,
      void 0,
      true,
      function() {},
      {},
      [],
      /foo/,
      123,
      Infinity,
      NaN,
      Symbol('foo'),
      new Date(),
      new Error()
    ]
  );

  describeCheckTypeMethod(
    'isUndefined',
    'undefined',
    [
      void 0
    ],
    [
      null,
      true,
      function() {},
      {},
      [],
      /foo/,
      'foo',
      123,
      Infinity,
      NaN,
      Symbol('foo'),
      new Date(),
      new Error()
    ]
  );
});
