var ApiMethod = require('../../lib/api-method');
var ApiError = require('../../lib/api-error');

/**
 * In The Matrix movie only Neo could enter to the Source.
 * This method checks can the passed user enter to the Source.
 *
 * @see ../../tests/api/the-matrix-source.test.js Tests for the API method.
 */
module.exports = new ApiMethod('the-matrix-source')
    .setDescription('Only the One can enter to the source')
    .setOption('executeOnServerOnly', true)
    .addParam({
        name: 'name',
        description: 'User name (only "Neo" value is allowed)',
        required: true
    })
    .setAction(function (params) {
        if (params.name !== 'Neo') {
            throw new ApiError('MATRIX_ERROR', params.name + ' has killed by Agent Smith');
        }
        return 'Welcome to the Source, Neo!';
    });
