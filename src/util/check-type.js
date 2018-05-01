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
 * A list of type names whose <code>is*</code> methods will be added to {@link checkType} automatically and will
 * use {@link Object#toString} output for comparisons.
 *
 * @type {Array.<string>}
 * @private
 */
const autoTypes = [ 'Array', 'Error', 'Function', 'RegExp', 'String' ];

/**
 * Contains methods for checking whether values are various types.
 *
 * @type {Object.<string, Function>}
 * @public
 */
const checkType = {
  isArray: Array.isArray,
  isBoolean: (value) => value === false || value === true,
  isObject: (value) => value !== null && (typeof value === 'function' || typeof value === 'object'),
  /* eslint-disable no-void */
  isUndefined: (value) => value === void 0
  /* eslint-enable no-void */
};

autoTypes.forEach((name) => {
  const methodName = `is${name}`;

  if (!checkType[methodName]) {
    checkType[methodName] = (value) => Object.prototype.toString.call(value) === `[object ${name}]`;
  }
});

module.exports = checkType;
