var ApiMethod = require('../../lib/index').ApiMethod;

/**
 * Test API which can say hello to you.
 *
 * @see ../../tests/examples/api/hello.test.js Tests for the API method.
 */
module.exports = new ApiMethod('hello')
    .setDescription('Returns greeting from server')
    .addParam({
        name: 'name',
        description: 'User name',
        required: true
    })
    .setAction(function (params) {
        return 'Hello, ' + params.name;
    });
