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
    name: 'bla-batch',
    description: 'Executes a set of methods',
    options: {
        showOnDocPage: false
    },
    params: {
        // Methods are passed as an array of BatchApiMethod objects.
        // Also it can be a string if request body is urlencoded.
        methods: {
            description: 'Set of methods',
            required: true
        }
    },
    action: function (params, request, api) {
        var methods = typeof params.methods === 'string' ? JSON.parse(params.methods) : params.methods;
        return vow.allResolved([].concat(methods).map(function (method) {
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
