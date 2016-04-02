var inherit = require('inherit');
var deprecate = require('depd')('BLA');

/**
 * API error.
 *
 * @param {String} [type=ApiError.INTERNAL_ERROR] Error type.
 * @param {String} message Human-readable description of the error.
 */
var ApiError = inherit(Error, {
    __constructor: function (type, message) {
        this.type = type || ApiError.INTERNAL_ERROR;
        this.message = message;

        Error.captureStackTrace(this, this.constructor);
    },

    name: 'ApiError',

    /**
     * @returns {Object}
     */
    toJSON: function () {
        var error = this;
        return Object.keys(error).reduce(function (result, key) {
            result[key] = error[key];
            return result;
        }, {});
    },

    /**
     * @returns {Object}
     */
    toJson: function () {
        deprecate('`toJson` method is removed. Use `toJSON` method instead.');
        return this.toJSON();
    }
}, {
    /**
     * Invalid or missed parameter.
     */
    BAD_REQUEST: 'BAD_REQUEST',

    /**
     * Unspecified error or server logic error.
     */
    INTERNAL_ERROR: 'INTERNAL_ERROR',

    /**
     * API method wasn't found.
     */
    NOT_FOUND: 'NOT_FOUND'
});

module.exports = ApiError;
