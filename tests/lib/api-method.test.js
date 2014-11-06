var ApiMethod = require('../../lib/api-method');
var ApiError = require('../../lib/api-error');
var sinon = require('sinon');
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

    it('should reject promise with an API error for missing required parameter', function () {
        var spy = sinon.spy();
        var apiMethod = new ApiMethod({
            name: 'test-method',
            params: {
                param1: {type: 'Number', required: true}
            },
            action: spy
        });

        return apiMethod.exec()
            .fail(function (error) {
                error.should.be.instanceOf(ApiError);
                spy.calledOnce.should.be.false;
            });
    });

    it('should reject an API error for a invalid parameter', function () {
        var spy = sinon.spy();
        var apiMethod = new ApiMethod({
            name: 'test-method',
            params: {
                param1: {type: 'Number'}
            },
            action: spy
        });

        return apiMethod.exec({param1: 'nan'})
            .fail(function (error) {
                error.should.be.instanceOf(ApiError);
                spy.calledOnce.should.be.false;
            });
    });

    it('should set method option', function () {
        var apiMethod = new ApiMethod({
            name: 'test-method',
            options: {
                hiddenOnDocPage: true
            },
            action: sinon.spy()
        });

        apiMethod.getOption('hiddenOnDocPage').should.be.true;
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

            apiMethod.getParamsDeclarations().should.be.empty;
            apiMethod.addParam(paramDeclaration);
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

        it('should reject promise with an API error for missing required parameter', function () {
            var spy = sinon.spy();
            var apiMethod = new ApiMethod('test-method')
                .addParam({
                    name: 'param1',
                    type: 'Number',
                    required: true
                })
                .setAction(spy);

            return apiMethod.exec()
                .fail(function (error) {
                    error.should.be.instanceOf(ApiError);
                    spy.calledOnce.should.be.false;
                });
        });

        it('should reject an API error for a invalid parameter', function () {
            var spy = sinon.spy();
            var apiMethod = new ApiMethod('test-method')
                .addParam({
                    name: 'param1',
                    type: 'Number'
                })
                .setAction(spy);

            return apiMethod.exec({param1: 'nan'})
                .fail(function (error) {
                    error.should.be.instanceOf(ApiError);
                    spy.calledOnce.should.be.false;
                });
        });

        it('should set method option', function () {
            var apiMethod = new ApiMethod('test-method');

            apiMethod.setOption('hiddenOnDocPage', true);
            apiMethod.getOption('hiddenOnDocPage').should.be.true;
        });
    });
});
