var ApiError = require('../api-error');

/**
 * Parses a string as a JSON.
 *
 * @param {String|Object} value Parameter value.
 * @returns {Object}
 */
function parseJson(value) {
    try {
        return typeof value  === 'string' ?
            JSON.parse(value) :
            value;
    } catch (e) {
        throw new ApiError(ApiError.BAD_REQUEST, 'Cannot parse JSON from parameter value: ' + value);
    }
}

/**
 * Normalizes value by passed type.
 *
 * @param {String} value Parameter value.
 * @param {String} [type] Parameter type.
 * @param {String} [name] Parameter name showing in a error message.
 * @returns {*}
 * @throws HTTP error
 */
module.exports = function (value, type, name) {
    name = name || '';
    type = type && type.toLowerCase();

    switch (type) {
        case 'string':
            return String(value);
        case 'number':
            var parsedValue = parseFloat(value);
            if (Number.isNaN(parsedValue)) {
                throw new ApiError(ApiError.BAD_REQUEST, 'invalid value for ' + name + ' parameter');
            }
            return parsedValue;
        case 'boolean':
            return value === 'false' ? false : Boolean(value);
        case 'array':
            return [].concat(parseJson(value));
        case 'object':
            return parseJson(value);
        default:
            return value;
    }
};
