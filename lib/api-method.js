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
     * @param {Object|Function} [method.params] Method parameters.
     * @param {Object} [method.options] Method options.
     * @param {Boolean} [method.options.showOnDocPage=true] Show API method on the documentation page.
     * @param {Boolean} [method.options.executeOnServerOnly=false] Permit to execute method only on server side.
     * @param {Boolean} [method.options.allowUndeclaredParams=false] Tolerate passing undeclared parameters.
     * @param {Boolean} [method.options.preventThrowingErrors=false] Wrap ApiMethod call in promise
     * to prevent throwing errors.
     * @param {String} [method.options.paramsValidation='normalize'] Preprocessing method parameters.
     */
    __constructor: function (method) {
        if (!method || !method.name || !method.action) {
            throw new ApiError(
                ApiError.INTERNAL_ERROR,
                'Some of the required method properties were not specified (name, action).'
            );
        }

        this._name = method.name;
        this._description = method.description;
        this._paramsDeclarations = method.params || {};
        this._action = method.action;
        this._options = {};

        var options = method.options || {};
        Object.keys(options).forEach(function (name) {
            this.setOption(name, options[name]);
        }, this);
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
     * Sets method option.
     *
     * @param {String} name Option name.
     * @param {*} value Option value.
     * @returns {this}
     */
    setOption: function (name, value) {
        if (name === 'paramsValidation' && typeof value === 'string') {
            try {
                require('./validators/' + value);
            } catch (e) {
                throw new ApiError(
                    ApiError.INTERNAL_ERROR,
                    'Parameter validator with name ' + name + ' is not found.'
                );
            }
        }

        this._options[name] = value;
        return this;
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
     * @returns {Object|Function} params Hash where each property name is a method
     * param and value has ApiMethodParam type.
     */
    getParams: function () {
        return this._paramsDeclarations;
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
            normalizedParams = typeof this._paramsDeclarations === 'function' ?
                this._paramsDeclarations(params, request, api) :
                this._normalizeParams(params, this._paramsDeclarations);
        } catch (error) {
            return vow.reject(error);
        }

        return this.getOption('preventThrowingErrors') ?
            vow.invoke(this._action.bind(this), normalizedParams, request, api) :
            vow.cast(this._action.call(this, normalizedParams, request, api));
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
        var validator = this._getValidator();

        return declaredParams.concat(passedParams)
            .filter(function (param, index, params) {
                return params.indexOf(param) === index; // unique
            })
            .reduce(function (result, key) {
                var declaration = params[key];
                var value = values.hasOwnProperty(key) ? values[key] : declaration.defaultValue;

                if (declaredParams.indexOf(key) === -1 && !this.getOption('allowUndeclaredParams')) {
                    throw new ApiError(ApiError.BAD_REQUEST, 'Unexpected ' + key + ' parameter');
                }

                if (value === undefined && declaration.required) {
                    throw new ApiError(ApiError.BAD_REQUEST, 'missing ' + key + ' parameter');
                }

                if (value !== undefined) {
                    result[key] = validator(value, key, declaration);
                }

                return result;
            }.bind(this), {});
    },

    /**
     * Returns validator function.
     *
     * @returns {Function}
     */
    _getValidator: function () {
        var validator = this.getOption('paramsValidation') || 'normalize';

        if (typeof validator === 'function') {
            deprecate('Using function as `paramsValidation` param is deprecated. Use `params` param instead.');
            return validator;
        } else {
            return require('./validators/' + validator);
        }
    }
});

module.exports = ApiMethod;
