require('chai').should();
var sinon = require('sinon');
var request = require('supertest');

sinon.stub(console, 'log');
var app = require('../../../examples/middleware/using_api_instance');
app.close();
console.log.restore();

describe('middleware/using_api_instance.js', function () {
    it('should render documentation page', function (done) {
        request(app)
            .get('/api')
            .expect('Content-Type', /text\/html/)
            .expect(200)
            .end(done);
    });

    it('should return a data from api', function (done) {
        request(app)
            .get('/api/hello/?name=Stepan')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('{"data":"Hello, Stepan"}')
            .end(done);
    });
});
