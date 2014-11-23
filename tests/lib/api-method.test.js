var ApiMethod = require('../../lib/api-method');
var ApiError = require('../../lib/api-error');
var sinon = require('sinon');
var inherit = require('inherit');
var should = require('chai').should();

describe('api-method', function () {
    it('should throw error if name is missed', function () {
        var fn = function () {
            var apiMethod = new ApiMethod();
        };
        fn.should.throw(ApiError);
    });

    it('should throw error if action is missed', function () {
        var fn = function () {
            var apiMethod = new ApiMethod({
                name: 'test-method'
            });
        };
        fn.should.throw(ApiError);
    });

    it('should return name', function () {
        var apiMethod = new ApiMethod({
            name: 'test-method',
            action: sinon.spy()
        });
        apiMethod.getName().should.be.equal('test-method');
    });

    it('should set and return description', function () {
        var apiMethod = new ApiMethod({
            name: 'test-method',
            description: 'Test API method',
            action: sinon.spy()
        });
        apiMethod.getDescription().should.be.equal('Test API method');
    });

    it('should add a parameter', function () {
        var paramDeclaration = {
            type: 'String',
            description: 'There is a method param'
        };
        var apiMethod = new ApiMethod({
            name: 'test',
            params: {
                testParam: paramDeclaration
            },
            action: sinon.spy()
        });

        apiMethod.getParams().testParam.should.be.eq(paramDeclaration);
        apiMethod.getParamsDeclarations().testParam.should.be.eq(paramDeclaration);
    });

    it('should use default value for parameter', function () {
        var actionStub = sinon.stub();
        var apiMethod = new ApiMethod({
            name: 'test',
            params: {
                value: {type: 'Number', defaultValue: 10}
            },
            action: actionStub
        });

        apiMethod.exec({value: 1});
        actionStub.firstCall.args[0].value.should.equal(1)

        apiMethod.exec();
        actionStub.secondCall.args[0].value.should.equal(10)
    });

    it('should run an action with normalized parameters', function () {
        var spy = sinon.spy();
        var apiMethod = new ApiMethod({
            name: 'test-method',
            params: {
                param1: {type: 'Number'},
                param2: {type: 'Boolean'},
                param3: {type: 'String'}
            },
            action: spy
        });

        return apiMethod.exec({param1: '123', param2: 'false', param3: 'Bazzinga!'})
            .then(function (response) {
                spy.alwaysCalledWith({
                    param1: 123,
                    param2: false,
                    param3: 'Bazzinga!'
                }).should.be.true;
                spy.calledOnce.should.be.true;
            });
    });

    it('should handle required parameter', function () {
        var spy = sinon.spy();
        var apiMethod = new ApiMethod({
            name: 'test-method',
            params: {
                param1: {type: 'Number', required: true},
                param2: {type: 'Boolean', required: true},
                param3: {type: 'String', required: true},
                param4: {required: true},
                param5: {type: 'Array', required: true}
            },
            action: spy
        });

        return apiMethod.exec({
            param1: 0,
            param2: false,
            param3: '',
            param4: null,
            param5: []
        });
    });

    it('should reject promise with an API error for missing required parameter', function (done) {
        var spy = sinon.spy();
        var apiMethod = new ApiMethod({
            name: 'test-method',
            params: {
                param1: {type: 'Number', required: true}
            },
            action: spy
        });

        apiMethod.exec()
            .fail(function (error) {
                error.should.be.instanceOf(ApiError);
                spy.calledOnce.should.be.false;
                done();
            });
    });

    it('should reject promise for a invalid parameter', function (done) {
        var spy = sinon.spy();
        var apiMethod = new ApiMethod({
            name: 'test-method',
            params: {
                param1: {type: 'Number'}
            },
            action: spy
        });

        apiMethod.exec({param1: 'nan'})
            .fail(function (error) {
                error.should.be.instanceOf(ApiError);
                spy.calledOnce.should.be.false;
                done();
            });
    });

    it('should reject promise for an undeclared parameter', function (done) {
        var spy = sinon.spy();
        var apiMethod = new ApiMethod({
            name: 'test-method',
            action: spy
        });

        apiMethod.exec({param1: 'test'})
            .fail(function (error) {
                error.should.be.instanceOf(ApiError);
                spy.calledOnce.should.be.false;
                done();
            });
    });

    it('should use custom validation for the param', function (done) {
        var CustomMethod = inherit(ApiMethod, {
            _normalizeParams: function (values, params) {
                values.num *= 2;
                return this.__base(values, params);
            }
        });
        var apiMethod = new CustomMethod({
            name: 'custom-method',
            params: {
                num: {type: 'Number'}
            },
            action: function (params) {
                // returned value should be multiplied by 2
                return params.num;
            }
        });

        apiMethod.exec({num: 2})
            .then(function (res) {
                res.should.equal(4);
                done();
            })
            .fail(done);
    });

    it('should set method option', function () {
        var apiMethod = new ApiMethod({
            name: 'test-method',
            options: {
                showOnDocPage: false
            },
            action: sinon.spy()
        });

        apiMethod.getOption('showOnDocPage').should.be.false;
    });

    it('should throw error if validator is not found', function () {
        var fn = function () {
            var apiMethod = new ApiMethod({
                name: 'test-method',
                options: {
                    paramsValidation: 'non-existent-validation-mode'
                }
            });
        };
        fn.should.throw(ApiError);
    });

    it('should use custom validator', function () {
        var spy = sinon.spy();
        var apiMethod = new ApiMethod({
            name: 'test-method',
            params: {
                param1: {type: 'String'}
            },
            options: {
                paramsValidation: function (paramValue, paramType, paramName) {
                    return 'baking bread';
                }
            },
            action: spy
        });

        return apiMethod.exec({param1: 'breaking bad'})
            .then(function (response) {
                spy.alwaysCalledWith({
                    param1: 'baking bread'
                }).should.be.true;
                spy.calledOnce.should.be.true;
            });
    });

    describe('tests for deprecated methods', function () {

        it('should return name', function () {
            var apiMethod = new ApiMethod('test-method');
            apiMethod.getName().should.be.equal('test-method');
        });

        it('should set and return description', function () {
            var apiMethod = new ApiMethod('test-method');
            apiMethod.setDescription('Test API method');
            apiMethod.getDescription().should.be.equal('Test API method');
        });

        it('should add a parameter', function () {
            var apiMethod = new ApiMethod('test-method');
            var paramDeclaration = {
                name: 'testParam',
                description: 'There is a method param'
            };

            apiMethod.getParams().should.be.empty;
            apiMethod.getParamsDeclarations().should.be.empty;
            apiMethod.addParam(paramDeclaration);
            apiMethod.getParams()[paramDeclaration.name].should.be.eq(paramDeclaration);
            apiMethod.getParamsDeclarations()[paramDeclaration.name].should.be.eq(paramDeclaration);
        });

        it('should throw an error for redefining a parameter', function () {
            var apiMethod = new ApiMethod('test-method');
            var paramDeclaration = {
                name: 'testParam'
            };
            apiMethod.addParam(paramDeclaration);

            var fn = function () {
                apiMethod.addParam(paramDeclaration);
            };
            fn.should.throw(ApiError);
        });

        it('should run an action with normalized parameters', function () {
            var apiMethod = new ApiMethod('test-method');
            var spy = sinon.spy();
            var params = [
                {name: 'param1', type: 'Number'},
                {name: 'param2', type: 'Boolean'},
                {name: 'param3'}
            ];
            params.forEach(apiMethod.addParam.bind(apiMethod));
            apiMethod.setAction(spy);

            return apiMethod.exec({param1: '123', param2: 'false', param3: 'Bazzinga!'})
                .then(function (response) {
                    spy.alwaysCalledWith({
                        param1: 123,
                        param2: false,
                        param3: 'Bazzinga!'
                    }).should.be.true;
                    spy.calledOnce.should.be.true;
                });
        });

        it('should reject promise with an API error for missing required parameter', function (done) {
            var spy = sinon.spy();
            var apiMethod = new ApiMethod('test-method')
                .addParam({
                    name: 'param1',
                    type: 'Number',
                    required: true
                })
                .setAction(spy);

            apiMethod.exec()
                .fail(function (error) {
                    error.should.be.instanceOf(ApiError);
                    spy.calledOnce.should.be.false;
                    done();
                });
        });

        it('should reject an API error for a invalid parameter', function (done) {
            var spy = sinon.spy();
            var apiMethod = new ApiMethod('test-method')
                .addParam({
                    name: 'param1',
                    type: 'Number'
                })
                .setAction(spy);

            apiMethod.exec({param1: 'nan'})
                .fail(function (error) {
                    error.should.be.instanceOf(ApiError);
                    spy.calledOnce.should.be.false;
                    done();
                });
        });

        it('should set method option', function () {
            var apiMethod = new ApiMethod('test-method');

            apiMethod.setOption('showOnDocPage', true);
            apiMethod.getOption('showOnDocPage').should.be.true;
        });
    });
});
