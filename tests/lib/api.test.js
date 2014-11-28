require('chai').should();

var Api = require('../../lib/api');
var ApiMethod = require('../../lib/api-method');
var ApiError = require('../../lib/api-error');

var API_FILES_PATH = __dirname + '/../../examples/api/**/*.api.js';
var sinon = require('sinon');

describe('api', function () {
    var api;
    beforeEach(function () {
        api = new Api(API_FILES_PATH);
    });

    afterEach(function () {
        Object.keys(require.cache).forEach(function (filename) {
            if (filename.indexOf('.api.js') !== -1) {
                delete require.cache[filename];
            }
        });
    });

    it('should throw an error if no api method is found', function () {
        var fn = function () {
            var api = new Api('/some-non-existent-path/api/**/*.api.js');
        };

        fn.should.throw(ApiError);
    });

    it('should throw an error for a redeclared method', function () {
        var fn = function () {
            var api = new Api(__dirname + '/../_data/api-redeclared/**/*.api.js');
        };

        fn.should.throw(ApiError);
    });

    it('should throw error if validator is not found', function () {
        var fn = function () {
            var api = new Api(__dirname + '/../_data/api-redeclared/**/*.api.js', {
                paramsValidation: 'non-existent-validation-mode'
            });
        };
        fn.should.throw(ApiError);
    });

    describe('when an error is occured in a method', function () {
        it('should throw an error', function () {
            var fn = function () {
                api.exec('bad-method');
            };

            fn.should.throw(Error);
        });
    });

    describe('getMethod', function () {
        it('should return a method', function () {
            var method = api.getMethod('hello');
            method.should.be.instanceof(ApiMethod);
        });

        it('should throw an error for non-existent api method', function () {
            var fn = function () {
                api.getMethod('non-existent-method');
            }
            fn.should.throw(Error);
        });

        it('should throw an error for missed api method', function () {
            var fn = function () {
                api.getMethod();
            }
            fn.should.throw(Error);
        });
    });

    describe('exec', function () {
        it('should throw an error for non-existent api method', function () {
            var fn = function () {
                api.getMethod('non-existent-method');
            }
            fn.should.throw(Error);
        });

        it('should throw an error for missed api method', function () {
            var fn = function () {
                api.exec();
            }
            fn.should.throw(Error);
        });

        it('should execute a method', function () {
            return api.exec('hello', {name: 'Alexander'})
                .then(function (response) {
                    response.should.be.equal('Hello, Alexander');
                });
        });

        it('should reject promise if required param is missed', function (done) {
            api.exec('hello')
                .fail(function (error) {
                    error.type.should.be.equal(ApiError.BAD_REQUEST);
                    error.should.be.instanceOf(ApiError);
                    done();
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

    describe('when paramsValidation is specified', function () {
        var api;
        beforeEach(function () {
            api = new Api(API_FILES_PATH, {
                paramsValidation: function (value) {
                    return 'butthead';
                }
            });
        });

        it('should apply the option to a method', function () {
            return api.exec('hello', {name: 'beavis'})
                .then(function (response) {
                    response.should.be.equal('Hello, butthead');
                });
        });

        describe('and the method already has paramsValidation option', function () {
            var HelloMethod;

            beforeEach(function () {
                HelloMethod = require('../../examples/api/hello.api.js');
                HelloMethod.setOption('paramsValidation', function () {
                    return 'world';
                });
                api = new Api(API_FILES_PATH, {
                    paramsValidation: function (value) {
                        return 'butthead';
                    }
                });
            });

            it('shouldn\'t apply the option from api', function () {
                return api.exec('hello', {name: 'beavis'})
                    .then(function (response) {
                        response.should.be.equal('Hello, world');
                    });
            });
        });
    });
});
