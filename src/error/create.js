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

const doT = require('dot/doT');

/**
 * A cache containing templates compiled from error messages.
 *
 * @type {Object.<string, Function>}
 * @private
 */
const templateCache = {};

/**
 * Creates an error with the specified <code>message</code> using the <code>state</code> provided.
 *
 * <code>message</code> is treated as a <code>doT</code> template string and is compiled and rendered with
 * <code>state</code> being passed to the template via the <code>it</code> variable. <code>message</code> will only ever
 * be compiled to a template once, as the template is cached for subsequent calls.
 *
 * @param {string} message - the message for the error to be created
 * @param {AnySchema~State} state - the current state
 * @return {Error} The {@link Error} using <code>message</code> and <code>state</code>.
 * @public
 */
function create(message, state) {
  message = getTemplate(message)({
    key: state.key ? `"${state.key}"` : 'value',
    parent: state.parent,
    path: state.path.slice()
  });

  return new Error(message);
}

/**
 * Gets a previously cached <code>doT</code> template for the specified <code>message</code> or compiles and caches it
 * if one does not already exist.
 *
 * @param {string} message - the message whose template is to be returned
 * @return {Function} The compiled template for <code>message</code>.
 * @private
 */
function getTemplate(message) {
  let template = templateCache[message];
  if (!template) {
    template = doT.template(message);

    templateCache[message] = template;
  }

  return template;
}

module.exports = create;
