var ApiMethod = require('../../../lib').ApiMethod;

module.exports = new ApiMethod('deprecated')
    .setDescription('This method uses deprecated ApiMethod interface')
    .addParam({
        name: 'name',
        type: 'String'
    })
    .setAction(function () {});
