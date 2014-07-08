var ApiMethod = require('../../lib/api-method');

/**
 * Test API which can say hello to you.
 */
module.exports = new ApiMethod('hello')
    .setDescription('Hello API method')
    .addParam({
        name: 'name',
        description: 'User name',
        required: true
    })
    .setAction(function (params) {
        return 'Hello, ' + params.name;
    });
