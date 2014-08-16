require('chai').should();

var HelloApiMethod = require('../../../examples/api/hello.api.js');

describe('hello.api.js', function () {
    it('should say hello', function (done) {
        HelloApiMethod.exec({name: 'Alexander'})
            .then(function (response) {
                response.should.be.equal('Hello, Alexander');
                done();
            })
            .done();
    });
});
