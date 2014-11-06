var bla = require('../../../lib');
var vow = require('vow');

module.exports = new bla.ApiMethod({
    name: 'api-error',
    description: 'Throws an error',
    action: function () {
        return vow.reject(new bla.ApiError());
    }
});
