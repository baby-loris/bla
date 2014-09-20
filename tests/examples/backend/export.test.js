require('chai').should();
var Api = require('../../../lib').Api;
var example = require('../../../examples/backend/export');

describe('backend/export.js', function () {
    it('should export Api instance', function () {
        example.should.be.an.instanceOf(Api);
    });
});
