var util = require('util');
var ApiError = require('../api-error');

/**
 * Throws error about invalid parameter type.
 *
 * @param {String} name Parameter name.
 * @param {String} type Parameter type.
 * @param {*} value Parameter value.
 * @throws ApiError
 */
module.exports = function (name, type, value) {
    var errorMessage = util.format(
        'invalid value for "%s" parameter, expected type "%s" but got %s',
        name, type, JSON.stringify(value)
    );
    throw new ApiError(ApiError.BAD_REQUEST, errorMessage);
};
