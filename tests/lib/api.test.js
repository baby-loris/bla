var Api = require('../../lib/api');
var ApiMethod = require('../../lib/api-method');
var ApiError = require('../../lib/api-error');
var should = require('chai').should();

var api = new Api(__dirname + '/../../examples/api/**/*.api.js');

describe('api', function () {
    it('should throw an error if no api method is found', function () {
        var fn = function () {
            var api = new Api('/some-non-existent-path/api/**/*.api.js');
        };

        fn.should.throw(Error);
        fn.should.throw(ApiError);
    });

    describe('getMethod', function () {
        it('should return a method', function () {
            var method = api.getMethod('hello');
            method.should.be.instanceof(ApiMethod);
        });

        it('should throw an error for non-existent api method', function () {
            var fn = function () {
                api.exec('non-existent-method');
            };

            fn.should.throw(Error);
            fn.should.throw(ApiError);
        });

        it('should throw an error for missed api method', function () {
            var fn = function () {
                api.exec();
            }

            fn.should.throw(Error);
            fn.should.throw(ApiError);
        });
    });

    describe('exec', function () {
        it('should throw an error for non-existent api method', function () {
            var fn = function () {
                api.exec('non-existent-method');
            };

            fn.should.throw(Error);
            fn.should.throw(ApiError);
        });

        it('should throw an error for missed api method', function () {
            var fn = function () {
                api.exec();
            }

            fn.should.throw(Error);
            fn.should.throw(ApiError);
        });

        it('should execute a method', function () {
            return api.exec('hello', {name: 'Alexander'})
                .then(function (response) {
                    response.should.be.equal('Hello, Alexander');
                });
        });

        it('should reject promise if required param is missed', function () {
            return api.exec('hello')
                .fail(function (error) {
                    error.type.should.be.equal(ApiError.BAD_REQUEST);
                    error.should.be.instanceOf(ApiError);
                });
        });
    });

    describe('docpage', function () {
        it('should generate a help documentation', function () {
            return api.generateHelp()
                .then(function (help) {
                    help.should.be.a('string');
                });
        });

        it('shouldn\'t show hidden methods on the documentation page', function () {
            return api.generateHelp()
                .then(function (help) {
                    help.should.not.contain('get-kittens');
                });
        });
    });
});
