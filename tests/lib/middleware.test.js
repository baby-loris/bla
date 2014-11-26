var request = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');
var Api = require('../../lib/api');
var HelloMethod = require('../../examples/api/hello.api.js');
var apiMiddleware = require('../../lib/middleware');
var should = require('chai').should();
var sinon = require('sinon');

var API_FILES_PATH = __dirname + '/../../examples/api/**/*.api.js';
var API_TEST_FILES_PATH = __dirname + '/../_data/api/**/*.api.js';

describe('middleware', function (done) {
    var app;
    var api;
    beforeEach(function () {
        api = new Api(API_FILES_PATH);
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
            .post('/api/batch')
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
            .expect(404)
            .end(done);
    });

    it('shouldn\'t execute methods with executeOnServerOnly option', function (done) {
        request(app)
            .get('/api/the-matrix-source')
            .expect(404)
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
                .use('/api/:method?', apiMiddleware(api, {buildMethodName: stub}));
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

    describe('when middleware is executed', function () {
        beforeEach(function () {
            sinon.spy(HelloMethod, 'exec');
        });

        afterEach(function () {
            HelloMethod.exec.restore();
        });

        it('should proxy express request to a method', function (done) {
            request(app)
                .get('/api/hello?name=Alexander')
                .expect('Content-Type', /json/)
                .expect('{"data":"Hello, Alexander"}')
                .expect(200)
                .end(function (err, res) {
                    HelloMethod.exec.calledOnce.should.be.true;
                    HelloMethod.exec.calledWith({name: 'Alexander'}).should.be.true;
                    HelloMethod.exec.firstCall.args[1].should.be.instanceof(require('http').IncomingMessage)
                    done(err);
                });
        });
    });

    describe('when a generic error is occured', function () {
        it('should proxy an error to the next middleware', function (done) {
            var api = new Api(API_TEST_FILES_PATH);
            app = express()
                .use(bodyParser.json())
                .use('/api/:method?', apiMiddleware(api))
                .use(function (err, req, res, next) {
                    done();
                });

            request(app)
                .post('/api/bad-method')
                .end();
        });
    });

    describe('when a body-parser is missed', function () {
        it('should throw an error for POST requests', function (done) {
            app = express()
                .use('/api/:method?', apiMiddleware(api))
                .use(function (err, req, res, next) {
                    done();
                });

            request(app)
                .post('/api/')
                .end();
        });

        it('shouldn\'t throw an error for GET requests', function (done) {
            app = express()
                .use('/api/:method?', apiMiddleware(api));

            request(app)
                .get('/api/')
                .end(done);
        });
    });

    describe('documentation page options', function () {
        it('should generate documentation with `disableDocPage` option set to `false`', function (done) {
            app = express()
                .use('/api/:method?', apiMiddleware(api, {disableDocPage: false}));
            request(app)
                .get('/api')
                .expect(200)
                .end(function (err) {
                    done(err);
                });
        });

        it('should generate documentation with `enableDocPage` option set to `true`', function (done) {
            app = express()
                .use('/api/:method?', apiMiddleware(api, {enableDocPage: true}));
            request(app)
                .get('/api')
                .expect(200)
                .end(done);
        });

        it('should generate documentation without options', function (done) {
            app = express()
                .use('/api/:method?', apiMiddleware(api));
            request(app)
                .get('/api')
                .expect(200)
                .end(done);
        });

        it('should not generate documentation with `disableDocPage` option set to `true`', function (done) {
            app = express()
                .use('/api/:method?', apiMiddleware(api, {disableDocPage: true}));
            request(app)
                .get('/api')
                .expect(404)
                .end(function (err) {
                    done(err);
                });
        });

        it('should not generate documentation page with `enableDocPage` option set to `false`', function (done) {
            app = express()
                .use('/api/:method?', apiMiddleware(api, {enableDocPage: false}));
            request(app)
                .get('/api')
                .expect(404)
                .end(done);
        });
    });

    describe('when bodyParser.urlencoded is used', function () {
        it('should accept urlencoded request', function (done) {
            app = express()
                .use(bodyParser.urlencoded({extended: true}))
                .use('/api/:method?', apiMiddleware(api));

            request(app)
                .post('/api/batch')
                .type('form')
                .send({
                    methods: JSON.stringify([{method: 'hello', params: {name: 'Stepan'}}])
                })
                .expect('Content-Type', /json/)
                .expect('{"data":[{"data":"Hello, Stepan"}]}')
                .expect(200)
                .end(done);
        });
    });
});
