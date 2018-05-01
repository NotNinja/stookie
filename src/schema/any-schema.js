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

// TODO: Complete documentation

const createError = require('../error/create');
const checkType = require('../util/check-type');
const clone = require('../util/clone');
const constant = require('../util/constant');

/**
 * TODO: Document
 *
 * @public
 */
class AnySchema {

  constructor() {
    this._casters = [];
    this._isRequired = false;
    this._isStrict = false;
    this._validators = [];
  }

  /**
   * Creates a copy of this schema with the specified <code>casters</code> added to it.
   *
   * <code>casters</code> can be a single caster or an array of casters which are to be added to the schema.
   *
   * When a schema processes a value, after validation, each of its casters will be invoked with the value, which may
   * have already been cast by previous casters, and have the opportunity to transform the value. The casters will be
   * added after any existing casters and are invoked in insertion order.
   *
   * The concept of conditional casters is allowed as there's no obligation for a caster to return a different value.
   *
   * This method does not modify this schema.
   *
   * @param {AnySchema~caster|Array.<AnySchema~caster>} casters - the casters to be added
   * @return {AnySchema} A copy of this schema that includes <code>casters</code>.
   * @throws {Error} If <code>casters</code> or any element contained within (if an array) is invalid.
   * @public
   */
  cast(casters) {
    if (!checkType.isUndefined(casters)) {
      casters = checkType.isArray(casters) ? casters : [ casters ];
    }

    const that = this.clone();

    casters.forEach((caster, index) => {
      if (checkType.isFunction(caster)) {
        that._casters.push(caster);
      } else {
        throw new Error(`Invalid caster at index: ${index}`);
      }
    });

    return that;
  }

  /**
   * Returns a clone of this schema.
   *
   * @return {AnySchema} A copy of this schema.
   * @public
   */
  clone() {
    const that = Object.create(Object.getPrototypeOf(this));
    that._casters = clone(this._casters);
    that._isRequired = this._isRequired;
    that._isStrict = this._isStrict;
    that._validators = clone(this._validators);

    return that;
  }

  /**
   * Creates a copy of this schema with the specified default <code>value</code>.
   *
   * When a schema processes a value, the first thing that's checked is whether the value is <code>undefined</code>. If
   * it is, the default value will be used instead. That is; unless the schema is required, in which case an error will
   * be thrown.
   *
   * This method does not modify this schema.
   *
   * @param {*} value - the default value to be used
   * @return {AnySchema} A copy of this schema that includes the default <code>value</code>.
   * @public
   */
  default(value) {
    return this.defaultSupplier(constant(value));
  }

  /**
   * Creates a copy of this schema with the specified default value <code>supplier</code>.
   *
   * <code>supplier</code> is a function which, when invoked, returns the default value to be used.
   *
   * When a schema processes a value, the first thing that's checked is whether the value is <code>undefined</code>. If
   * it is, the supplied default value will be used instead. That is; unless the schema is required, in which case an
   * error will be thrown.
   *
   * This method does not modify this schema.
   *
   * @param {AnySchema~defaultSupplier} supplier - a function which supplies the default value to be used
   * @return {AnySchema} A copy of this schema that includes the default value <code>supplier</code>.
   * @public
   */
  defaultSupplier(supplier) {
    const that = this.clone();

    that._defaultSupplier = supplier;

    return that;
  }

  /**
   * Processes the specified <code>value</code> based on this schema.
   *
   * Optionally, <code>state</code> and/or <code>options</code> can be provided for greater context or control over the
   * process. <code>state</code> is typically provided internally for nested schemas, however, is exposed for consumers
   * to use as well, if desired.
   *
   * Processing is generally very linear and starts with handling <code>undefined</code> by enforcing the required flag
   * or falling back on a default value, where available, and then executing all validators belonging to this schema
   * before finally casting the value by passing the value through all of casters that belong to this schema, where the
   * final value is then returned.
   *
   * Children of {@link AnySchema} may peform additional steps within this process but should all follow the same flow
   * (e.g. validates and casts nested values). Additionally, while the strict flag does not typically apply to
   * {@link AnySchema}, any children of {@link AnySchema} that wants to support an option to be stricter may peform
   * additional steps for this purpose, but this can mean different things for different schemas.
   *
   * Any validation failure that occurs will immediately block the process and an appropriate error will be thrown.
   *
   * @param {*} value - the value to be processed
   * @param {AnySchema~State} [state] - the process state to be used
   * @param {AnySchema~ProcessOptions} [options] - the options to be used
   * @return {*} The result of potentially validating and casting <code>value</code>.
   * @throws {Error} If <code>value</code> is invalid for this schema.
   * @public
   */
  process(value, state, options) {
    state = state || { key: '', parent: null, path: [] };
    options = options || {};

    if (checkType.isUndefined(value)) {
      if (this._isRequired) {
        // TODO
        throw createError('', state);
      } else if (checkType.isFunction(this._defaultSupplier)) {
        value = this._defaultSupplier(state, options);
      }
    }

    return this._process(value, state, options);
  }

  /**
   * Creates a copy of this schema with it flagged as required.
   *
   * Optionally, <code>isRequired</code> can be specified to explicitly flag the schema as unrequired, if needed.
   *
   * When a schema processes a value, the first thing that's checked is whether the value is <code>undefined</code>. If
   * it is, and the schema is required, an error will be thrown.
   *
   * This method does not modify this schema.
   *
   * @param {boolean} [isRequired=true] - <code>true</code> to flag as required; otherwise <code>false</code>
   * @return {AnySchema} A copy of this schema that is flagged as required based on <code>isRequired</code>.
   * @public
   */
  required(isRequired) {
    const that = this.clone();

    that._isRequired = checkType.isUndefined(isRequired) ? true : Boolean(isRequired);

    return that;
  }

  /**
   * Creates a copy of this schema with it flagged as strict.
   *
   * Optionally, <code>isStrict</code> can be specified to explicitly flag the schema as unstrict, if needed.
   *
   * The strict flag does not typically apply to {@link AnySchema} but, instead, to any implementation that wants to
   * support an option to be stricter when the schema processes a value. This can mean different things for different
   * schemas, but it should generally result a more controlled (exact) and expected output and limit any possible
   * surprises by throwing errors when something unexpected occurs.
   *
   * This method does not modify this schema.
   *
   * @param {boolean} [isStrict=true] - <code>true</code> to flag as strict; otherwise <code>false</code>
   * @return {AnySchema} A copy of this schema that is flagged as strict based on <code>isStrict</code>.
   * @public
   */
  strict(isStrict) {
    const that = this.clone();

    that._isStrict = checkType.isUndefined(isStrict) ? true : Boolean(isStrict);

    return that;
  }

  /**
   * Creates a copy of this schema with the specified <code>validators</code> added to it.
   *
   * <code>validators</code> can be a single validator or an array of validators which are to be added to the schema.
   * These are typically functions but can also be regular expressions (in string or {@link RegExp} form) which, when
   * invoked, will be tested against the value being processed.
   *
   * A validator function <b>must</b> return one of the following types:
   *
   * <ul>
   *   <li><code>boolean</code> - Simple validation indicator</li>
   *   <li><code>Error</code> - Custom validation error</li>
   *   <li><code>string</code> - Custom validation error message which can use <code>doT</code> tempating</li>
   * </ul>
   *
   * Any other type will result in an error being thrown during processing. Validation will stop and fail when any
   * validator returns a non-<code>true</code> (not <i>truthy</i>) value.
   *
   * When a schema processes a value, before casting, each of its validators will be invoked with the value, which may
   * have already been validated by previous validators, and have the opportunity to validate the value. The validators
   * will be added after any existing validators and are invoked in insertion order.
   *
   * This method does not modify this schema.
   *
   * @param {AnySchema~validator|RegExp|string|Array.<AnySchema~validator|RegExp|string>} validators - the validators to
   * be added
   * @return {AnySchema} A copy of this schema that includes <code>validators</code>.
   * @throws {Error} If <code>validators</code> or any element contained within (if an array) is invalid.
   * @public
   */
  validate(validators) {
    if (!checkType.isUndefined(validators)) {
      validators = checkType.isArray(validators) ? validators : [ validators ];
    }

    const that = this.clone();

    validators.forEach((validator, index) => {
      validator = parseValidator(validator);
      if (!checkType.isFunction(validator)) {
        throw new Error(`Invalid validator at index: ${index}`);
      }

      that._validators.push(validator);
    });

    return that;
  }

  /**
   * Iterates over all casters belonging to this schema for the specified <code>value</code> and returns the final cast
   * value.
   *
   * Only the first caster is guaranteed to be passed the original <code>value</code> as all subsequent casters will be
   * passed the return value of the previous caster.
   *
   * <code>value</code> will be returned if this schema has no casters.
   *
   * @param {*} value - the value to be cast
   * @param {AnySchema~State} state - the current state
   * @param {AnySchema~ProcessOptions} options - the options to be used
   * @return {*} The result of casting <code>value</code> or <code>value</code> if there are no casters.
   * @protected
   */
  _cast(value, state, options) {
    return this._casters.reduce((acc, caster) => caster(acc, state, options), value);
  }

  /**
   * Processes the specified <code>value</code> based on this schema using the <code>state</code> and
   * <code>options</code> provided.
   *
   * This method is called internally by {@link AnySchema#process} after handling default <code>value</code> (as well as
   * the required flag), <code>state</code>, and <code>options</code>. That leaves the only responsibilities for this
   * method as validator and caster execution, making it easy for {@link AnySchema} children to override this method,
   * for greater control, if needed.
   *
   * @param {*} value - the value to be processed
   * @param {AnySchema~State} state - the current state
   * @param {AnySchema~ProcessOptions} options - the options to be used
   * @return {*} The result of potentially validating and casting <code>value</code>.
   * @throws {Error} If <code>value</code> is invalid for this schema.
   * @protected
   */
  _process(value, state, options) {
    this._validate(value, state, options);

    return this._cast(value, state, options);
  }

  /**
   * Iterates over all validators belonging to this schema for the specified <code>value</code>.
   *
   * Only the first validator is guaranteed to be invoked as all subsequent validators will only be invoked should the
   * previous validator pass.
   *
   * All supported validator return types will be handled accordingly.
   *
   * @param {*} value the value to be validated
   * @param {AnySchema~State} state - the current state
   * @param {AnySchema~ProcessOptions} options - the options to be used
   * @return {void}
   * @throws {Error} If any validator returns a non-<code>true</code> value.
   * @protected
   */
  _validate(value, state, options) {
    this._validators.forEach((validator, index) => {
      const result = validator(value, state, options);

      checkValidation(result, state, index);
    });
  }

  /**
   * Returns a flag indicating that this is a stookie schema.
   *
   * @return {boolean} <code>true</code>.
   * @public
   */
  get isStookieSchema() {
    return true;
  }

}

/**
 * Checks the specified validation <code>result</code> and handles it accordingly.
 *
 * Effectively, an error (in some form or another) will be thrown if <code>result</code> is anything other than
 * <code>true</code>.
 *
 * @param {*} result - the validation result to be checked
 * @param {AnySchema~State} state - the current state
 * @param {number} index - the index of the validator whose result is to be checked
 * @return {void}
 * @throws {Error} If <code>result</code> is not <code>true</code>.
 * @private
 */
function checkValidation(result, state, index) {
  if (checkType.isBoolean(result)) {
    if (!result) {
      // TODO
      throw createError('', state);
    }
  } else if (checkType.isError(result)) {
    throw result;
  } else if (checkType.isString(result)) {
    throw createError(result, state);
  } else {
    throw new Error(`Invalid validation result at index ${index}`);
  }
}

/**
 * Creates a validator that will test the value is a matching string.
 *
 * @param {RegExp} regex - the regular expression against which the value will be tested
 * @return {AnySchema~validator} A validator for testing that the value is a string that matches <code>regex</code>.
 * @private
 */
function createRegExpValidator(regex) {
  return (value) => {
    if (!checkType.isString(value)) {
      // TODO
      return '';
    }

    // TODO
    return regex.test(value) || '';
  };
}

/**
 * Parses the specified <code>validator</code>, if needed.
 *
 * Supports special non-function types from which validator functions can be created.
 *
 * If <code>validator</code> is not one of these special types, <code>validator</code> will be returned as-is.
 *
 * @param {*} validator - the validator to be parsed
 * @return {*} The parsed <code>validator</code> if belonging to a special (supported) type, otherwise
 * <code>validator</code> itself.
 * @private
 */
function parseValidator(validator) {
  if (checkType.isString(validator)) {
    return createRegExpValidator(new RegExp(validator));
  }
  if (checkType.isRegExp(validator)) {
    return createRegExpValidator(validator);
  }

  return validator;
}

module.exports = AnySchema;

/**
 * The options that can be passed to {@link AnySchema#process}.
 *
 * @typedef {Object} AnySchema~ProcessOptions
 * @public
 */

/**
 * The state for a schema process.
 *
 * This helps generate useful error messages while also allowing for nested processing as the values may differ when
 * processing "root" (top-level) values from that used when processing nested values.
 *
 * <code>key</code> may be an empty string when processing a "root" value, but could also be a property name or an index
 * for nested values.
 *
 * <code>parent</code> may be <code>null</code> when processing a "root" value, but could also be the object or array to
 * which it belongs for nested values.
 *
 * <code>path</code> may be an empty array when processing a "root" value, but could also consistent of all keys that
 * exist in the path from the "root" value to the nested value.
 *
 * @typedef {Object} AnySchema~State
 * @property {string} key - the current key
 * @property {*} parent - the parent of the current value
 * @property {Array.<string>} path - the current path
 * @public
 */

/**
 * Transforms the specified <code>value</code> using the <code>state</code> and <code>options</code> provided only after
 * <code>value</code> has been validated.
 *
 * Optionally, <code>value</code> may only be transformed conditionally and may return <code>value</code> itself in some
 * cases.
 *
 * Since a schema may have multiple casters, only the first is guaranteed to be passed the original value, while all
 * subsequent casters will be passed the return value of the previous caster, which may or may not be the original
 * value.
 *
 * @callback AnySchema~caster
 * @param {*} value - the value to be cast
 * @param {AnySchema~State} state - the current state
 * @param {AnySchema~ProcessOptions} options - the options to be used
 * @return {*} The result of casting <code>value</code>.
 * @public
 */

/**
 * Returns the default value to be used when a schema, which is not flagged as required, is processing an
 * <code>undefined</code> value.
 *
 * @callback AnySchema~defaultSupplier
 * @param {AnySchema~State} state - the current state
 * @param {AnySchema~ProcessOptions} options - the options to be used
 * @return {*} The default value.
 * @public
 */

/**
 * Validates the specified <code>value</code> using the <code>state</code> and <code>options</code> provided before it
 * can be cast.
 *
 * A fvalidator can return any of the following types:
 *
 * <ul>
 *   <li><code>boolean</code> - Simple validation indicator</li>
 *   <li><code>Error</code> - Custom validation error</li>
 *   <li><code>string</code> - Custom validation error message which can use <code>doT</code> tempating</li>
 * </ul>
 *
 * Any other type will result in an error being thrown when the validator is processed. Validation will stop and fail
 * when if the validator returns a non-<code>true</code> (not <i>truthy</i>) value.
 *
 * Since a schema may have multiple validators, only the first is guaranteed to be invoked, while all subsequent
 * validators will only be invoked should the previously validator pass.
 *
 * @callback AnySchema~validator
 * @param {*} value - the value to be validated
 * @param {AnySchema~State} state - the current state
 * @param {AnySchema~ProcessOptions} options - the options to be used
 * @return {boolean|Error|string} The validation result.
 * @public
 */
