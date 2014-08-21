var vow = require('vow');

var bla = require('../lib/index');

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

module.exports = new bla.ApiMethod('baby-loris-api-batch')
    .setDescription('Executes a set of methods')
    .setOption('hiddenOnDocPage', true)
    .addParam({
        // Methods are passed as an array of BatchApiMethod objects.
        name: 'methods',
        type: 'Array',
        description: 'Set of methods with a data',
        required: true
    })
    .setAction(function (params, api) {
        return vow.allResolved(params.methods.map(function (method) {
            return api.exec(method.method, method.params);
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
    });
