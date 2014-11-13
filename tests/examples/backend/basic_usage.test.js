require('chai').should();
var sinon = require('sinon');

describe('backend/basic_usage.js', function () {
    var example;
    beforeEach(function () {
        sinon.stub(console, 'log');
        example = require('../../../examples/backend/basic_usage');
    });

    afterEach(function () {
        console.log.restore();
    });

    it('should say hello', function (done) {
        setTimeout(function () {
            console.log.calledOnce.should.be.true;
            done();
        }, 5); // because of promise
    });
});
