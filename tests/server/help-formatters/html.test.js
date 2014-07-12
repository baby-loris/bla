var htmlFormatter = require('../../../lib/help-formatters/html');
var HelloApiMethod = require('../../../examples/api/hello.api.js');
var should = require('chai').should();

describe('html formatter', function () {
    it('should return a html string', function (done) {
        htmlFormatter({}).then(function (result) {
            result.should.be.a('string');
            done();
        });
    });

    it('should generate a documentation for a API method', function (done) {
        var methods = {
            hello: HelloApiMethod
        };
        htmlFormatter(methods)
            .then(function (result) {
                result.should.contain('Returns greeting from server');
                result.should.contain('User name');
                done();
            })
            .done();
    });
});
