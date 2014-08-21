var bla = require('../../lib/index');

var Api = require('../../lib/api');
var ApiMethod = require('../../lib/api-method');
var ApiError = require('../../lib/api-error');
var apiMiddleware = require('../../lib/middleware');

require('chai').should();

describe('index', function () {
    it('should export Api class', function () {
        bla.Api.should.be.equal(Api);
    });

    it('should export ApiError class', function () {
        bla.ApiError.should.be.equal(ApiError);
    });

    it('should export ApiMethod class', function () {
        bla.ApiMethod.should.be.equal(ApiMethod);
    });

    it('should export express middleware', function () {
        bla.apiMiddleware.should.be.equal(apiMiddleware);
    });
});
