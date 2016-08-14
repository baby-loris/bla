var ApiError = require('../api-error');
var extend = require('extend');

module.exports = {
    formatResponse: function (data) {
        return {
            data: data
        };
    },

    formatError: function (error, debugInfo) {
        var errorObject = error.toJSON && typeof error.toJSON === 'function' ?
            error.toJSON() :
            {
                type: error.type || ApiError.INTERNAL_ERROR,
                message: error.message
            };

        if (debugInfo) {
            extend(errorObject, debugInfo);
        }

        return {
            error: errorObject
        };
    }
};
