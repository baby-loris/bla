var ApiMethod = require('../../lib/api-method');

/**
 * Test API which summs two numbers.
 */
module.exports = new ApiMethod('summ')
    .setDescription('Summs two numbers.')
    .addParam({
        name: 'a',
        type: 'Number',
        description: 'First number',
        required: true
    })
    .addParam({
        name: 'b',
        type: 'Number',
        description: 'Second number',
        required: true
    })
    .setAction(function (params) {
        return params.a + params.b;
    });
