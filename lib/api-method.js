var inherit = require('inherit');
var vow = require('vow');
var deprecate = require('depd')('BLA');

var ApiError = require('./api-error');

/**
 * Api method param.
 * @typedef {Object} ApiMethodParam
 * @property {String} param.name Param name.
 * @property {String} [param.description] Param description.
 * @property {String} [param.type] Param type (String, Number, Boolean, and etc.)
 * @property {Boolean} [param.required] Required param. Should be set before method execution.
 */

/**
 * API method.
 */
var ApiMethod = inherit({
    /**
     * @param {Object} method Method data.
     * @param {String} method.name Method name.
     * @param {Function} method.action Method action which be executed.
     * @param {String} [method.description] Method description.
     * @param {Object} [method.params] Method parameters.
     * @param {Object} [method.options] Method options.
     * @param {Object} [method.options] Method options.
     * @param {Boolean} [method.options.showOnDocPage=true] Show API method on the documentation page.
     * @param {Boolean} [method.options.executeOnServerOnly=false] Permit to execute method only on server side.
     * @param {String|Function} [method.options.paramsValidation=normalize] Preprocessing method parameters.
     */
    __constructor: function (method) {
        var nameInOldFormat = typeof method === 'string' && method;
        if ((!method || !method.name || !method.action) && !nameInOldFormat) {
            throw new ApiError(
                ApiError.INTERNAL_ERROR,
                'Some of the required method properties were not specified (name, action).'
            );
        }

        if (nameInOldFormat) {
            method = {
                name: nameInOldFormat
            };
        }

        this._name = method.name;
        this._description = method.description;
        this._paramsDeclarations = method.params || {};
        this._options = method.options || {};
        this._action = method.action;
        this._validator = this._getValidatorByName(this._options.paramsValidation);

        if (this._options.hasOwnProperty('hiddenOnDocPage')) {
            deprecate('`hiddenOnDocPage` option is removed. Use `showOnDocPage` option instead.');
        }
    },

    /**
     * Returns validator function.
     *
     * @param {String} [name=normalize] Validator name.
     * @returns {Function}
     */
    _getValidatorByName: function (name) {
        name = name || 'normalize';

        try {
            return typeof name === 'function' ? name : require('./validators/' + name);
        } catch (e) {
            throw new ApiError(
                ApiError.INTERNAL_ERROR,
                'Parameter validator with name ' + name + ' is not found.'
            );
        }
    },

    /**
     * Returns a method name.
     *
     * @returns {String}
     */
    getName: function () {
        return this._name;
    },

    /**
     * Returns a method description.
     *
     * @returns {String}
     */
    getDescription: function () {
        return this._description;
    },

    /**
     * Returns option value by name.
     *
     * @returns {*}
     */
    getOption: function (name) {
        return this._options[name];
    },

    /**
     * Returns declared params.
     *
     * @returns {Object} params Hash where each property name is a method param and value has ApiMethodParam type.
     */
    getParams: function () {
        return this._paramsDeclarations;
    },

    /**
     * Returns declared params.
     *
     * @deprecated
     * @returns {Object} params Hash where each property name is a method param and value has ApiMethodParam type.
     */
    getParamsDeclarations: function () {
        deprecate('getParamsDeclarations. Use `getParams` method instead.');
        return this.getParams();
    },

    /**
     * Executes API method.
     *
     * @param {Object} params
     * @param {Object} request Express request.
     * @param {Api} api API instance.
     * @returns {vow.Promise}
     */
    exec: function (params, request, api) {
        params = params || {};

        var normalizedParams;
        try {
            normalizedParams = this._normalizeParams(params, this._paramsDeclarations);
        } catch (error) {
            return vow.reject(error);
        }

        return vow.cast(this._action.call(this, normalizedParams, request, api));
    },

    /**
     * Normalizes params according to set params.
     *
     * Note: this method can be overriden to perform any actions on the request parameters before they are passed
     * to the `action` declared for the ApiMethod.
     * For example, common validation can be skipped or custom validation can be added whenever necessary.
     * In the following example `inherit` library is used to create a subclass.
     *
     * @example
     * var CustomMethod = inherit(ApiMethod, {
     *      _normalizeParams: function (values, params) {
     *          // perform any actions
     *
     *          // call parent method if necessary
     *          return this.__base(values, params);
     *      }
     * });
     *
     * var customMethod = new CustomMethod({
     *      // method declaration
     * });
     *
     * @protected
     * @param {Object} values Params passed to the exec method.
     * @param {Object} params Params set in the API declaration.
     * @returns {Object} Normalized params.
     */
    _normalizeParams: function (values, params) {
        var declaredParams = Object.keys(params);
        var passedParams = Object.keys(values);

        return declaredParams.concat(passedParams)
            .filter(function (param, index, params) {
                return params.indexOf(param) === index; // unique
            })
            .reduce(function (result, key) {
                var declaration = params[key];
                var value = values.hasOwnProperty(key) ? values[key] : declaration.defaultValue;

                if (declaredParams.indexOf(key) === -1) {
                    throw new ApiError(ApiError.BAD_REQUEST, 'Unexpected ' + key + ' parameter');
                }

                if (value === undefined && declaration.required) {
                    throw new ApiError(ApiError.BAD_REQUEST, 'missing ' + key + ' parameter');
                }

                if (value !== undefined) {
                    result[key] = this._validator(value, declaration.type, key);
                }

                return result;
            }.bind(this), {});
    },

    // Deprecated methods are listed bellow and they will be pruned in next release

    /**
     * Sets a method description.
     *
     * @deprecated
     * @param {String} description
     * @returns {this}
     */
    setDescription: function (description) {
        deprecate('setDescription method');

        this._description = description;
        return this;
    },

    /**
     * Sets method option.
     *
     * @deprecated
     * @param {String} name Option name.
     * @param {*} value Option value.
     * @returns {this}
     */
    setOption: function (name, value) {
        deprecate('setOption method');

        this._options[name] = value;
        return this;
    },

    /**
     * Adds a method param.
     *
     * @deprecated
     * @param {ApiMethodParam} param
     * @returns {this}
     */
    addParam: function (param) {
        deprecate('addParam method');

        if (this._paramsDeclarations[param.name]) {
            throw new ApiError(ApiError.INTERNAL_ERROR, param.name + ' was already declared');
        }

        this._paramsDeclarations[param.name] = param;
        return this;
    },

    /**
     * Sets a callback which will be executed in exec method.
     *
     * @deprecated
     * @param {Function} action Execution callback.
     * @returns {this}
     */
    setAction: function (action) {
        deprecate('setAction method: please, use the new ApiMethod interface: ' +
        'https://github.com/baby-loris/bla/blob/master/REFERENCE.md#constructormethod');

        this._action = action;
        return this;
    }
});

module.exports = ApiMethod;
