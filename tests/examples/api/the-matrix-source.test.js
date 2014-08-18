var should = require('chai').should();

var TheMatrixSourceApiMethod = require('../../../examples/api/the-matrix-source.api.js');

describe('the-matrix-source.api.js', function () {
    it('should permit Neo to enter', function (done) {
        TheMatrixSourceApiMethod.exec({name: 'Neo'})
            .then(function (response) {
                response.should.be.equal('Welcome to the Source, Neo!');
                done();
            })
            .done();
    });

    it('should deny other users to enter', function (done) {
        TheMatrixSourceApiMethod.exec({name: 'Merovingian'})
            .fail(function (error) {
                error.type.should.be.equal('MATRIX_ERROR');
                done();
            })
            .done();
    });
});
