var Api = require('../../lib/api');
var ApiMethod = require('../../lib/api-method');
var ApiError = require('../../lib/api-error');
var should = require('chai').should();

describe('api', function () {
    it('should return a method', function (done) {
        var api = new Api(__dirname + '/../../examples/api/**/*.api.js');
        api.getMethod('hello')
            .then(function (method) {
                method.should.be.instanceof(ApiMethod);
                done();
            })
            .done();
    });

    it('should reject promise if no api method is found', function (done) {
        var api = new Api('/some-non-existent-path/api/**/*.api.js');
        api.getMethod('hello')
            .fail(function (error) {
                error.type.should.be.equal(ApiError.INTERNAL_ERROR);
                error.should.be.instanceOf(ApiError);
                done();
            })
            .done();
    });

    it('should reject promise for non-existent api method', function (done) {
        var api = new Api(__dirname + '/../../examples/api/**/*.api.js');
        api.getMethod('non-existent-method')
            .fail(function (error) {
                error.type.should.be.equal(ApiError.NOT_FOUND);
                error.should.be.instanceOf(ApiError);
                done();
            })
            .done();
    });

    it('should reject promise for missed api method', function (done) {
        var api = new Api(__dirname + '/../../examples/api/**/*.api.js');
        api.getMethod()
            .fail(function (error) {
                error.type.should.be.equal(ApiError.BAD_REQUEST);
                error.should.be.instanceOf(ApiError);
                done();
            })
            .done();
    });

    it('should execute a method', function (done) {
        var api = new Api(__dirname + '/../../examples/api/**/*.api.js');
        api.exec('hello', {name: 'Alexander'})
            .then(function (response) {
                response.should.be.equal('Hello, Alexander');
                done();
            })
            .done();
    });

    it('should reject promise if required param is missed', function (done) {
        var api = new Api(__dirname + '/../../examples/api/**/*.api.js');
        api.exec('hello')
            .fail(function (error) {
                error.type.should.be.equal(ApiError.BAD_REQUEST);
                error.should.be.instanceOf(ApiError);
                done();
            })
            .done();
    });

    it('should generate a help documentation', function (done) {
        var api = new Api(__dirname + '/../../examples/api/**/*.api.js');
        api.generateHelp()
            .then(function (help) {
                help.should.be.a('string');
                done();
            })
            .done();
    });

    it('shouldn\'t show hidden methods on the documentation page', function (done) {
        var api = new Api(__dirname + '/../../examples/api/**/*.api.js');
        api.generateHelp()
            .then(function (help) {
                help.should.not.contain('get-kittens');
                done();
            })
            .done();
    });
});
