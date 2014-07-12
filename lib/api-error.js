var inherit = require('inherit');

/**
 * API error.
 *
 * @param {String} type Error type.
 * @param {String} message Human-readable description of the error.
 */
var ApiError = inherit(Error, {
    __constructor: function (type, message) {
        this.name = 'ApiError';
        this.type = type;
        this.message = message;

        Error.captureStackTrace(this, this.constructor);
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
