var ApiError = require('../api-error');

/**
 * Normalizes value by passed type.
 *
 * @param {String} value Parameter value.
 * @param {String} type Parameter type.
 * @param {String} [name] Parameter name showing in a error message.
 * @returns {*}
 * @throws HTTP error
 */
module.exports = function (value, type, name) {
    name = name || '';
    switch (type) {
        case 'Number':
            var parsedValue = parseFloat(value);
            if (Number.isNaN(parsedValue)) {
                throw new ApiError(ApiError.BAD_REQUEST, 'invalid value for ' + name + ' parameter');
            }
            return parsedValue;
        case 'Boolean':
            return value === 'false' ? false : Boolean(value);
        case 'Array':
            return [].concat(value);
        default:
            return value;
    }
};
