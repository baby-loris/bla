var bla = require('../../lib');
var vow = require('vow');

/**
 * The method is rejected by ApiError
 */
module.exports = new bla.ApiMethod('api-error')
    .setDescription('Throws an error')
    .setAction(function () {
        return vow.reject(new bla.ApiError());
    });
