var ApiError = require('../api-error');

/**
 * Checks type strictly
 *
 * @param {String} value Parameter value.
 * @param {Object} [declaration] Parameter declaration.
 * @param {String} [declaration.name] Parameter name.
 * @param {String} [declaration.description] Parameter description.
 * @param {String} [declaration.type] Parameter type.
 * @param {Boolean} [declaration.required] Should the parameter be made obligatory.
 * @returns {*}
 * @throws ApiError
 */
module.exports = function (value, declaration) {
    declaration = declaration || {};
    var type = declaration.type && declaration.type.toLowerCase();

    if (!type) {
        return value;
    } else if (Array.isArray(value)) {
        if (type === 'array') {
            return value;
        }
    } else if (typeof value === type) {
        return value;
    }

    var name = declaration.name || '';
    throw new ApiError(ApiError.BAD_REQUEST, 'invalid value for ' + name + ' parameter');
};
