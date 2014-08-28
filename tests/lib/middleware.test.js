var request = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');
var Api = require('../../lib/api');
var apiMiddleware = require('../../lib/middleware');
var should = require('chai').should();
var sinon = require('sinon');

var API_FILES_PATH = __dirname + '/../../examples/api/**/*.api.js';

describe('middleware', function (done) {
    var app;
    beforeEach(function () {
        app = express()
            .use(bodyParser.json())
            .use('/api/:method?', apiMiddleware(API_FILES_PATH));
    });

    it('should response to a right request', function (done) {
        request(app)
            .get('/api/hello?name=Alexander')
            .expect('Content-Type', /json/)
            .expect('{"data":"Hello, Alexander"}')
            .expect(200)
            .end(done);
    });

    it('should response to a bad request', function (done) {
        request(app)
            .post('/api/hello')
            .expect('Content-Type', /json/)
            .expect('{"error":{"type":"BAD_REQUEST","message":"missing name parameter"}}')
            .expect(200)
            .end(done);
    });

    it('should handle batch requests', function (done) {
        request(app)
            .post('/api/baby-loris-api-batch')
            .send({
                methods: [
                    {method: 'hello', params: {name: 'Stepan'}}
                ]
            })
            .expect('Content-Type', /json/)
            .expect('{"data":[{"data":"Hello, Stepan"}]}')
            .expect(200)
            .end(done);
    });

    it('should handle non-existent api method', function (done) {
        request(app)
            .get('/api/non-existent-method')
            .expect('Content-Type', /json/)
            .expect('{"error":{"type":"NOT_FOUND","message":"API method non-existent-method was\'t found"}}')
            .expect(200)
            .end(done);
    });

    it('shouldn\'t execute methods with executeOnServerOnly option', function (done) {
        request(app)
            .get('/api/the-matrix-source')
            .expect('Content-Type', /json/)
            .expect('{"error":{"type":"BAD_REQUEST","message":"Method can be executed only on server side"}}')
            .expect(200)
            .end(done);
    });

    it('should generate documentation page if method name was missed', function (done) {
        request(app)
            .get('/api/')
            .expect('Content-Type', /text\/html/)
            .expect(200)
            .end(done);
    });

    describe('when buildMethodName option is set', function () {
        var stub = sinon.stub().returns('hello');
        beforeEach(function () {
            app = express()
                .use(bodyParser.json())
                .use('/api/:method?', apiMiddleware(API_FILES_PATH, {buildMethodName: stub}));
        });

        it('should build a custom methodname', function (done) {
            request(app)
                .get('/api/any/method/?name=Stepan')
                .expect('Content-Type', /json/)
                .expect('{"data":"Hello, Stepan"}')
                .expect(200)
                .end(done);
        });
    });

    describe('when generating documentations is turned off', function () {
        beforeEach(function () {
            app = express()
                .use(bodyParser.json())
                .use('/api/:method?', apiMiddleware(API_FILES_PATH, {disableDocPage: true}));
        });

        it('shouldn\'t generate documentation page if method name was missed', function (done) {
            request(app)
                .get('/api/')
                .expect('Content-Type', /json/)
                .expect('{"error":{"type":"BAD_REQUEST","message":"API method was\'t specified"}}')
                .expect(200)
                .end(done);
        });
    });

    describe('when Api instance is passed', function () {
        beforeEach(function () {
            var api = new Api(API_FILES_PATH);
            app = express()
                .use(bodyParser.json())
                .use('/api/:method?', apiMiddleware(api));
        });

        it('should response to a right request', function (done) {
            request(app)
                .get('/api/hello?name=Alexander')
                .expect('Content-Type', /json/)
                .expect('{"data":"Hello, Alexander"}')
                .expect(200)
                .end(done);
        });
    });
});
