var ApiError = require('../api-error');

module.exports = {
    formatResponse: function (data) {
        return {
            data: data
        };
    },

    formatError: function (error) {
        return {
            error: error.toJson && typeof error.toJson === 'function' ?
                error.toJson() :
                {
                    type: error.type || ApiError.INTERNAL_ERROR,
                    message: error.message
                }
        };
    }
};
