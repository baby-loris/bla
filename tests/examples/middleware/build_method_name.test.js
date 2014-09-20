require('chai').should();
var sinon = require('sinon');
var request = require('supertest');
var nock = require('nock');

sinon.stub(console, 'log');
var app = require('../../../examples/middleware/build_method_name');
app.close();
console.log.restore();

var flickr = nock('https://api.flickr.com')
    .filteringPath(function () {
        return '/services/rest/';
    })
    .get('/services/rest/');
var flickrResponse = {
    photos: {
        photo: []
    }
};

describe('middleware/build_method_name.js', function () {
    it('should return data by api/get/kittens', function (done) {
        flickr.reply(200, flickrResponse);
        request(app)
            .get('/api/get/kittens')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(done);
    });

    it('should return data by api/get-kittens', function (done) {
        flickr.reply(200, flickrResponse);
        request(app)
            .get('/api/get-kittens')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(done);
    });
});
