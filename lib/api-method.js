var inherit = require('inherit');

var normalize = require('./utils/normalize');
var HttpError = require('./utils/http-error');

/**
 * API method.
 */
module.exports = inherit({
    /**
     * @param {String} name Method name.
     */
    __constructor: function (name) {
        this._name = name;
        this._params = {};
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
     * Sets a method description.
     *
     * @param {String} description
     * @returns {this}
     */
    setDescription: function (description) {
        this._description = description;
        return this;
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
     * Adds a method param.
     *
     * @returns {Object} param Method param.
     *          {String} param.name Param name.
     *          {String} param.description Param description.
     *          {String} [param.type] Param type (String, Number, Boolean, and etc.)
     *          {Boolean} [param.required] Required param. Should be set before method execution.
     * @returns {this}
     */
    addParam: function (param) {
        this._params[param.name] = (param);
        return this;
    },

    /**
     * Returns an array of set params.
     *
     * @returns {Object[]}
     */
    getParams: function () {
        return this._params;
    },

    /**
     * Sets a callback which will be executed in exec method.
     *
     * @param {Function} action Execution callback.
     * @returns {this}
     */
    setAction: function (action) {
        this._action = action;
        return this;
    },

    /**
     * Executes API method.
     *
     * @param {Object} params
     * @returns {vow.Promise}
     */
    exec: function (params) {
        var normalizedParams = this._normalizeParams(params, this._params);
        return this._action(normalizedParams);
    },

    /**
     * Normalizes params according to set params.
     *
     * @param {Object} value Params passed to the exec method.
     * @param {Object} params Params set in the API declaration.
     * @returns {Object} Normalized params.
     */
    _normalizeParams: function (values, params) {
        return Object.keys(params).reduce(function (result, key) {
            if (!values[key] && params[key].required) {
                throw new HttpError(400, 'mising ' + key + ' parameter');
            }
            if (values[key]) {
                result[key] = normalize(key, values[key], params[key].type);
            }
            return result;
        }, {});
    }
});
