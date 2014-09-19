require('chai').should();
var sinon = require('sinon');
var request = require('supertest');

sinon.stub(console, 'log');
var app = require('../../../../examples/frontend/requirejs');
app.close();
console.log.restore();

describe('frontend/requirejs/index.js', function () {
    it('should render html page', function (done) {
        request(app)
            .get('/')
            .expect('Content-Type', /text\/html/)
            .expect(200)
            .end(done);
    });

    it('should use bla', function (done) {
        request(app)
            .get('/api/hello/?name=Stepan')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('{"data":"Hello, Stepan"}')
            .end(done);
    });
});
