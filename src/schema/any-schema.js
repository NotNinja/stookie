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

const createError = require('../error/create');
const { isArray, isBoolean, isError, isFunction, isRegExp, isString, isUndefined } = require('../util/type');

class AnySchema {

  static check(value, key) {
    if (value == null) {
      throw new Error(`schema is required${(key ? `at "${key}"` : '')}`);
    } else if (!value._isStookieSchema) {
      throw new Error(`schema is invalid${(key ? `at "${key}"` : '')}`);
    }

    return value;
  }

  constructor() {
    this._casters = [];
    this._isRequired = false;
    this._isStookieSchema = true;
    this._isStrict = false;
    this._validators = [];
  }

  cast(casters) {
    if (!isUndefined(casters)) {
      casters = isArray(casters) ? casters : [ casters ];
    }

    casters.forEach((caster, index) => {
      if (isFunction(caster)) {
        this._casters.push(caster);
      } else {
        throw new Error(`Invalid caster at index: ${index}`);
      }
    });

    return this;
  }

  default(value) {
    this._defaultSupplier = () => value;

    return this;
  }

  defaultSupplier(supplier) {
    this._defaultSupplier = supplier;

    return this;
  }

  process(value, state, options) {
    state = state || { key: '', parent: null, path: [] };
    options = options || {};

    if (isUndefined(value)) {
      if (this._isRequired) {
        // TODO
        throw createError('', state);
      } else if (isFunction(this._defaultSupplier)) {
        value = this._defaultSupplier();
      }
    }

    return this._process(value, state, options);
  }

  required(isRequired) {
    this._isRequired = isUndefined(isRequired) ? true : Boolean(isRequired);

    return this;
  }

  strict(isStrict) {
    this._isStrict = isUndefined(isStrict) ? true : Boolean(isStrict);

    return this;
  }

  valid(validators) {
    if (!isUndefined(validators)) {
      validators = isArray(validators) ? validators : [ validators ];
    }

    validators.forEach((validator, index) => {
      validator = parseValidator(validator);
      if (!isFunction(validator)) {
        throw new Error(`Invalid validator at index: ${index}`);
      }

      this._validators.push(validator);
    });

    return this;
  }

  _cast(value, state, options) {
    return this._casters.reduce((acc, caster) => caster(acc, state, options), value);
  }

  _process(value, state, options) {
    this._validate(value, state, options);

    return this._cast(value, state, options);
  }

  _validate(value, state, options) {
    this._validators.forEach((validator, index) => {
      const result = validator(value, state, options);

      checkValidation(result, state, index);
    });
  }

}

function checkValidation(result, state, index) {
  if (isBoolean(result)) {
    if (!result) {
      // TODO
      throw createError('', state);
    }
  } else if (isError(result)) {
    throw result;
  } else if (isString(result)) {
    throw createError(result, state);
  } else {
    throw new Error(`Invalid validation result at index ${index}`);
  }
}

function createRegExpValidator(regex) {
  return (value) => {
    if (!isString(value)) {
      // TODO
      return '';
    }

    // TODO
    return regex.test(value) || '';
  };
}

function parseValidator(validator) {
  if (isString(validator)) {
    validator = createRegExpValidator(new RegExp(validator));
  }
  if (isRegExp(validator)) {
    validator = createRegExpValidator(validator);
  }

  return validator;
}

module.exports = AnySchema;
