var ApiMethod = require('../../../lib').ApiMethod;

module.exports = new ApiMethod({
    name: 'bad-method',
    description: 'Throws an error',
    action: function () {
        throw new Error('Oups!');
    }
});
