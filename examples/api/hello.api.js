var ApiMethod = require('../../lib').ApiMethod;

/**
 * Test API which can say hello to you.
 *
 * @see ../../tests/examples/api/hello.test.js Tests for the API method.
 */
module.exports = new ApiMethod({
    name: 'hello',
    description: 'Returns greeting from server',
    params: {
        name: {
            type: 'String',
            description: 'User name',
            required: true
        }
    },
    action: function (params) {
        return 'Hello, ' + params.name;
    }
});
