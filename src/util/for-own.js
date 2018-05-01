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

const hasOwn = require('./has-own');

/**
 * Iterates over all of the own (not inherited) properties on the specifed <code>obj</code> and invokes the
 * <code>callback</code> provided for each one.
 *
 * Nothing happens and <code>callback</code> is never called if <code>obj</code> is <code>null</code> or contains no
 * own properties.
 *
 * @param {?Object} obj - the object whose own properties are to be iterated over
 * @param {forOwn~callback} callback - the function to be called for each own property
 * @return {void}
 * @public
 */
function forOwn(obj, callback) {
  if (obj == null) {
    return;
  }

  for (const prop in obj) {
    if (hasOwn(obj, prop)) {
      callback(obj[prop], prop, obj);
    }
  }
}

module.exports = forOwn;

/**
 * A function that is passed to {@link forOwn} that is called for each own (not inherited) property on the corresponding
 * object.
 *
 * @callback forOwn~callback
 * @param {*} value - the property value
 * @param {string} key - the property key
 * @param {Object} obj - the object that was passed to {@link forOwn}
 * @return {void}
 * @public
 */
