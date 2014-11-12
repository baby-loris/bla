require('chai').should();
var sinon = require('sinon');
var expressRequest = {};

var Api = require('../../lib').Api;
var ApiError = require('../../lib').ApiError;
var HelloMethod = require('../../examples/api/hello.api.js');
var api = new Api(__dirname + '/../../examples/api/**/*.api.js');

var methods = [
    {
        method: 'hello',
        params: {name: 'Sam'}
    },
    {
        method: 'hello',
        params: {name: 'Dean'}
    }
];

describe('batch.api.js', function () {
    beforeEach(function () {
        sinon.spy(HelloMethod, 'exec');
    });

    afterEach(function () {
        HelloMethod.exec.restore();
    });

    it('should execute api methods', function () {
        return api.exec('bla-batch', {methods: methods})
            .then(function (response) {
                HelloMethod.exec.calledTwice.should.be.true;

                HelloMethod.exec.firstCall.calledWithExactly(methods[0].params, undefined, api).should.be.true;
                HelloMethod.exec.secondCall.calledWithExactly(methods[1].params, undefined, api).should.be.true;

                response[0].data.should.be.equal('Hello, Sam');
                response[1].data.should.be.equal('Hello, Dean');
            });
    });

    it('should execute api methods passed as a string', function () {
        return api.exec('bla-batch', {methods: '[{"method": "hello", "params": {"name": "Sam"}}]'})
            .then(function (response) {
                HelloMethod.exec.calledOnce.should.be.true;

                response[0].data.should.be.equal('Hello, Sam');
            });
    });

    it('should return error for api method', function () {
        return api.exec('bla-batch', {methods: [{method: 'hello'}]})
            .then(function (response) {
                HelloMethod.exec.calledOnce.should.be.true;
                response[0].error.should.be.deep.equal({
                    type: 'BAD_REQUEST',
                    message: 'missing name parameter'
                });
            });
    });

    it('should proxy express request', function () {
        return api.exec('bla-batch', {methods: [methods[0]]}, expressRequest)
            .then(function () {
                HelloMethod.exec.calledOnce.should.be.true;
                HelloMethod.exec.firstCall.calledWithExactly({name: 'Sam'}, expressRequest, api).should.be.true;
            });
    });

    it('should set INTERNAL_TYPE be default', function () {
        var api = new Api(__dirname + '/../_data/api/**/*.api.js');
        return api.exec('bla-batch', {methods: [{method: 'api-error'}]})
            .then(function (res) {
                res[0].error.type.should.be.equal(ApiError.INTERNAL_ERROR);
            });
    });

    describe('when an error is occured', function () {
        it('should throw an error', function () {
            var api = new Api(__dirname + '/../_data/api/**/*.api.js');
            var fn = function () {
                api.exec('bla-batch', {methods: [{method: 'bad-method'}]});
            };

            fn.should.throw(Error);
        });
    });
});
