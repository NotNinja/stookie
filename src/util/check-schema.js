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

/**
 * Ensures that the specified <code>value</code> is a stookie schema and throws an error if it's not.
 *
 * Optionally, <code>key</code> can be provided to enhance any error messages that may be thrown.
 *
 * @param {*} value - the value to be checked
 * @param {string} [key] - the key associated with <code>value</code>, where applicable
 * @return {*} A reference to <code>value</code>.
 * @throws {Error} If <code>value</code> is <code>null</code> or not a stookie schema.
 * @public
 */
function checkSchema(value, key) {
  if (value == null) {
    throw new Error(`schema is required${(key ? `at "${key}"` : '')}`);
  } else if (!value.isStookieSchema) {
    throw new Error(`schema is invalid${(key ? `at "${key}"` : '')}`);
  }

  return value;
}

module.exports = checkSchema;
