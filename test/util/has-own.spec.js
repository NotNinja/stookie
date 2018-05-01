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

const assert = require('assert');

const hasOwn = require('../../src/util/has-own');

describe('util/has-own', () => {
  class TestType {

    constructor() {
      this.foo = 'bar';
    }

    get fu() {
      return 'baz';
    }

  }

  context('when obj has inherited property', () => {
    it('should return false', () => {
      assert.strictEqual(hasOwn(new TestType(), 'fu'), false);
    });
  });

  context('when obj has no property', () => {
    it('should return false', () => {
      assert.strictEqual(hasOwn({ foo: 'bar' }, 'fizz'), false);
      assert.strictEqual(hasOwn(new TestType(), 'fizz'), false);
    });
  });

  context('when obj has own property', () => {
    it('should return true', () => {
      assert.strictEqual(hasOwn({ foo: 'bar' }, 'foo'), true);
      assert.strictEqual(hasOwn(new TestType(), 'foo'), true);
    });
  });

  context('when obj is null', () => {
    it('should return false', () => {
      assert.strictEqual(hasOwn(null, ''), false);
    });
  });
});
