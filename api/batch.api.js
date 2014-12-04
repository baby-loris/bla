var vow = require('vow');

var bla = require('../lib');

/**
 * @typedef {Object} BatchApiMethod
 * @property {String} method Method name.
 * @property {Object} params Method params.
 *
 * @example
 * {
 *      method: 'hello',
 *      params: {name: 'Master'}
 * }
 */

module.exports = new bla.ApiMethod({
    name: 'batch',
    description: 'Executes a set of methods',
    options: {
        allowUndeclaredParams: true,
        paramsValidation: 'normalize',
        showOnDocPage: false
    },
    params: {
        // Methods are passed as an array of BatchApiMethod objects.
        methods: {
            description: 'Set of methods',
            type: 'Array',
            required: true
        }
    },
    action: function (params, request, api) {
        return vow.allResolved(params.methods.map(function (method) {
            return api.exec(method.method, method.params, request, api);
        })).then(function (response) {
            return response.map(function (promise) {
                var data = promise.valueOf();

                if (promise.isFulfilled()) {
                    return {
                        data: data
                    };
                }

                return {
                    error: {
                        type: data.type || bla.ApiError.INTERNAL_ERROR,
                        message: data.message
                    }
                };
            });
        });
    }
});
