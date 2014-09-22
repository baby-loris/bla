require('chai').should();
var sinon = require('sinon');
var request = require('supertest');

sinon.stub(console, 'log');
var app = require('../../../examples/middleware/without_docpage');
app.close();
console.log.restore();

describe('middleware/without_docpage.js', function () {
    it('shouldn\'t render documentation page', function (done) {
        request(app)
            .get('/api')
            .expect(404)
            .end(done);
    });
});
