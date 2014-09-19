var ApiMethod = require('../../lib').ApiMethod;

/**
 * The method which throws an error
 *
 * @see ../../tests/examples/api/bad-method.test.js Tests for the API method.
 */
module.exports = new ApiMethod('bad-method')
    .setDescription('Throws an error')
    .setAction(function () {
        throw new Error('Oups!');
    });
