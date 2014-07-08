var HttpError = require('./http-error');

/**
 * Normalizes value by type.
 *
 * @param {String} name Parameter name.
 * @param {String} value Parameter value.
 * @param {String} type Parameter type.
 * @returns {*}
 * @throws HTTP error
 */
module.exports = function (name, value, type) {
    switch (type) {
        case 'Number':
            var parsedValue = parseFloat(value);
            if (Number.isNaN(parsedValue)) {
                throw new HttpError(400, 'invalid value for ' + name + ' parameter');
            }
            return parsedValue;
            break;
        case 'Boolean':
            return !!value;
            break;
        default:
            return value;
    };
}
