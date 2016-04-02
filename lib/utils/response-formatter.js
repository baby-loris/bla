var ApiError = require('../api-error');

module.exports = {
    formatResponse: function (data) {
        return {
            data: data
        };
    },

    formatError: function (error) {
        return {
            error: error.toJSON && typeof error.toJSON === 'function' ?
                error.toJSON() :
                {
                    type: error.type || ApiError.INTERNAL_ERROR,
                    message: error.message
                }
        };
    }
};
