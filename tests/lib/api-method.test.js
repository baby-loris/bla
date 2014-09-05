var ApiMethod = require('../../lib/api-method');
var ApiError = require('../../lib/api-error');
var sinon = require('sinon');
var should = require('chai').should();

describe('api-method', function () {

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
