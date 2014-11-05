var inherit = require('inherit');
var vow = require('vow');

var normalize = require('./utils/normalize');
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
     */
    __constructor: function (method) {
        if (!method || !method.name || !method.action) {
            throw new ApiError(ApiError.INTERNAL_ERROR, 'Method name and method action are unspecified');
        }

        this._name = method.name;
        this._description = method.description;
        this._paramsDeclarations = method.params || {};
        this._options = method.options || {};
        this._action = method.action;
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
    getParamsDeclarations: function () {
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
            normalizedParams = this._normalizeParams(params, this._paramsDeclarations);
        } catch (error) {
            return vow.reject(error);
        }

        return vow.cast(this._action.call(this, normalizedParams, request, api));
    },

    /**
     * Normalizes params according to set params.
     *
     * @param {Object} values Params passed to the exec method.
     * @param {Object} params Params set in the API declaration.
     * @returns {Object} Normalized params.
     */
    _normalizeParams: function (values, params) {
        return Object.keys(params).reduce(function (result, key) {
            if (!values[key] && params[key].required) {
                throw new ApiError(ApiError.BAD_REQUEST, 'missing ' + key + ' parameter');
            }
            if (values[key]) {
                result[key] = normalize(values[key], params[key].type, key);
            }
            return result;
        }, {});
    }
});

module.exports = ApiMethod;
