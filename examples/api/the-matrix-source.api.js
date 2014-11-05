var bla = require('../../lib');
var vow = require('vow');

/**
 * In The Matrix movie only Neo could enter the Source.
 * This method checks if the user can enter the Source.
 *
 * @see ../../tests/examples/api/the-matrix-source.test.js Tests for the API method.
 */
module.exports = new bla.ApiMethod({
    name: 'the-matrix-source',
    description: 'Only the One can enter to the source',
    options: {
        executeOnServerOnly: true
    },
    params: {
        name: {
            description: 'User name (only "Neo" value is allowed)',
            required: true
        }
    },
    action: function (params) {
        if (params.name !== 'Neo') {
            return vow.reject(new bla.ApiError('MATRIX_ERROR', params.name + ' was killed by Agent Smith'));
        }
        return 'Welcome to the Source, Neo!';
    }
});
