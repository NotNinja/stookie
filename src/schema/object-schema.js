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
const forOwn = require('../util/for-own');
const hasOwn = require('../util/has-own');
const { isObject } = require('../util/type');
const mapOwn = require('../util/map-own');

class ObjectSchema extends AnySchema {

  all(schema) {
    this._childSchema = ObjectSchema.check(schema);

    return this;
  }

  prop(key, schema) {
    if (!this._childrenSchemas) {
      this._childrenSchemas = {};
    }

    this._childrenSchemas[key] = ObjectSchema.check(schema, key);

    return this;
  }

  props(schemas) {
    if (!this._childrenSchemas) {
      this._childrenSchemas = {};
    }

    forOwn(schemas, (schema, key) => {
      this._childrenSchemas[key] = ObjectSchema.check(schema, key);
    });

    return this;
  }

  _process(value, state, options) {
    this._validate(value, state, options);

    const schemaProps = mapOwn(this._childrenSchemas, () => false);

    value = mapOwn(value, (prop, key) => {
      let schema;
      if (hasOwn(this._childrenSchemas, key)) {
        schema = this._childrenSchemas[key];
        schemaProps[key] = true;
      } else {
        schema = this._childSchema;
      }

      if (!schema) {
        if (this._isStrict) {
          // TODO
          throw createError('', state);
        }

        return prop;
      }

      return schema.process(prop, {
        key,
        parent: value,
        path: state.path.concat(key)
      }, options);
    });

    // TODO: Test thoroughly
    forOwn(schemaProps, (used, key) => {
      if (used) {
        return;
      }

      /* eslint-disable no-void */
      const prop = void 0;
      /* eslint-enable no-void */
      const schema = this._childrenSchemas[key];

      value[key] = schema.process(prop, {
        key,
        parent: value,
        path: state.path.concat(key)
      }, options);
    });

    return this._cast(value, state, options);
  }

  _validate(value, state, options) {
    if (!isObject(value)) {
      // TODO
      throw createError('', state);
    }

    super._validate(value, state, options);
  }

}

module.exports = ObjectSchema;
