var ApiMethod = require('../../lib').ApiMethod;

/**
 * The method which throws an error
 */
module.exports = new ApiMethod('bad-method')
    .setDescription('Throws an error')
    .setAction(function () {
        throw new Error('Oups!');
    });
