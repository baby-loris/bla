require('chai').should();
var sinon = require('sinon');

var Api = require('../../lib/index').Api;
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
    var helloSpy;

    beforeEach(function () {
        helloSpy = sinon.spy(HelloMethod, 'exec');
    });

    afterEach(function () {
        HelloMethod.exec.restore();
    });

    it('should execute api methods', function () {
        return api.exec('baby-loris-api-batch', {methods: methods})
            .then(function (response) {
                helloSpy.calledTwice.should.be.true;

                helloSpy.firstCall.calledWithExactly(methods[0].params, undefined, api).should.be.true;
                helloSpy.secondCall.calledWithExactly(methods[1].params, undefined, api).should.be.true;

                response[0].data.should.be.equal('Hello, Sam');
                response[1].data.should.be.equal('Hello, Dean');
            });
    });

    it('should return error for api method', function () {
        return api.exec('baby-loris-api-batch', {methods: [{method: 'hello'}]})
            .then(function (response) {
                helloSpy.calledOnce.should.be.true;
                response[0].error.should.be.deep.equal({
                    type: 'BAD_REQUEST',
                    message: 'missing name parameter'
                });
            });
    });
});
