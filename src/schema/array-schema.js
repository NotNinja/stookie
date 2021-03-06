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

// TODO

const AnySchema = require('./any-schema');
const createError = require('../error/create');
const { isArray, isUndefined } = require('../util/type');

class ArraySchema extends AnySchema {

  all(schema) {
    this._childSchema = ArraySchema.check(schema);

    return this;
  }

  item(index, schema) {
    if (!this._childrenSchemas) {
      this._childrenSchemas = [];
    }

    this._childrenSchemas.push(ArraySchema.check(schema, index));

    return this;
  }

  items(schemas) {
    if (!isUndefined(schemas)) {
      schemas = isArray(schemas) ? schemas : [ schemas ];
    }

    if (!this._childrenSchemas) {
      this._childrenSchemas = [];
    }

    schemas.forEach((schema, index) => {
      this._childrenSchemas.push(ArraySchema.check(schema, index));
    });

    return this;
  }

  _process(value, state, options) {
    this._validate(value, state, options);

    let childrenSchemasIndex = 0;
    const childrenSchemasLength = this._childrenSchemas ? this._childrenSchemas.length : -1;

    value = value.map((item, index) => {
      let schema;
      if (childrenSchemasLength >= index) {
        schema = this._childrenSchemas[index];
        childrenSchemasIndex++;
      } else {
        schema = this._childSchema;
      }

      if (!schema) {
        if (this._isStrict) {
          // TODO
          throw createError('', state);
        }

        return item;
      }

      const key = String(index);

      return schema.process(item, {
        key,
        parent: value,
        path: state.path.concat(key)
      }, options);
    });

    // TODO: Test thoroughly
    for (let i = childrenSchemasIndex; i < childrenSchemasLength; i++) {
      /* eslint-disable no-void */
      const item = void 0;
      /* eslint-enable no-void */
      const key = String(i);
      const schema = this._childrenSchemas[i];

      value.push(schema.process(item, {
        key,
        parent: value,
        path: state.path.concat(key)
      }, options));
    }

    return this._cast(value, state, options);
  }

  _validate(value, state, options) {
    if (!isArray(value)) {
      // TODO
      throw createError('', state);
    }

    super._validate(value, state, options);
  }

}

module.exports = ArraySchema;
