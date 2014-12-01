var ApiError = require('../api-error');

function throwError(name) {
    throw new ApiError(ApiError.BAD_REQUEST, 'invalid value for ' + name + ' parameter');
}

/**
 * Checks type strictly
 *
 * @param {String} value Parameter value.
 * @param {String} name Parameter name.
 * @param {Object} [declaration] Parameter declaration.
 * @param {String} [declaration.name] Parameter name.
 * @param {String} [declaration.description] Parameter description.
 * @param {String} [declaration.type] Parameter type.
 * @param {Boolean} [declaration.required] Should the parameter be made obligatory.
 * @returns {*}
 * @throws ApiError
 */
module.exports = function (value, name, declaration) {
    declaration = declaration || {};
    var type = declaration.type && declaration.type.toLowerCase();

    if (!type) {
        return value;
    }

    if (Array.isArray(value)) {
        return type === 'array' ? value : throwError(name);
    }

    if ((type === 'number' || type === 'boolean') && typeof value === 'string') {
        try {
            value = JSON.parse(value);
        } catch (e) {
            throwError(name);
        }
    }

    return typeof value === type ? value : throwError(name);
};
