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

const AnySchema = require('../../src/schema/any-schema');
const checkSchema = require('../../src/util/check-schema');

describe('util/check-schema', () => {
  context('when value is schema', () => {
    it('should return value', () => {
      const schema = new AnySchema();

      assert.strictEqual(checkSchema(schema), schema);
    });

    context('and key is specified', () => {
      it('should return value', () => {
        const schema = new AnySchema();

        assert.strictEqual(checkSchema(schema, 'foo'), schema);
      });
    });
  });

  context('when value is not schema', () => {
    it('should throw an error', () => {
      assert.throws(
        () => checkSchema({}),
        (err) => err instanceof Error && err.message === 'schema is invalid'
      );
    });

    context('and key is specified', () => {
      it('should throw an error including key', () => {
        assert.throws(
          () => checkSchema({}, 'foo'),
          (err) => err instanceof Error && err.message === 'schema is invalid at "foo"'
        );
      });
    });
  });

  context('when value is null', () => {
    it('should throw an error', () => {
      assert.throws(
        () => checkSchema(null),
        (err) => err instanceof Error && err.message === 'schema is required'
      );
    });

    context('and key is specified', () => {
      it('should throw an error including key', () => {
        assert.throws(
          () => checkSchema(null, 'foo'),
          (err) => err instanceof Error && err.message === 'schema is required at "foo"'
        );
      });
    });
  });
});
