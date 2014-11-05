var ApiMethod = require('../../lib').ApiMethod;

/**
 * The method which throws an error
 */
module.exports = new ApiMethod({
    name: 'bad-method',
    description: 'Throws an error',
    action: function () {
        throw new Error('Oups!');
    }
});
