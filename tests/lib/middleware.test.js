var request = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');
var apiMiddleware = require('../../lib/middleware');
var should = require('chai').should();
var sinon = require('sinon');

var API_FILES_PATH = __dirname + '/../../examples/api/**/*.api.js';

describe('middleware', function (done) {
    var app;
    beforeEach(function () {
        app = express()
            .use(bodyParser.urlencoded({extended: false}))
            .use('/api/:method?', apiMiddleware(API_FILES_PATH));
    });

    it('should response to a right request', function () {
        request(app)
            .get('/api/hello?name=Alexander')
            .expect('Content-Type', /json/)
            .expect('{"data":"Hello, Alexander"}')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
            })
    });

    it('should response to a bad request', function () {
        request(app)
            .post('/api/hello')
            .expect('Content-Type', /json/)
            .expect('{"error":{"type":"BAD_REQUEST","message":"missing name parameter"}}')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
            })
    });

    it('should handle non-existent api method', function () {
        request(app)
            .get('/api/non-existent-method')
            .expect('Content-Type', /json/)
            .expect('{"error":{"type":"NOT_FOUND","message":"API method non-existent-method was\'t found"}}')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
            })
    });

    it('shouldn\'t execute methods with executeOnServerOnly option', function () {
        request(app)
            .get('/api/the-matrix-source')
            .expect('Content-Type', /json/)
            .expect('{"error":{"type":"BAD_REQUEST","message":"Method can be executed only on server side"}}')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
            })
    });

    it('should generate documentation page if method name was missed', function () {
        request(app)
            .get('/api/')
            .expect('Content-Type', /text\/html/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
            })
    });

    describe('when buildMethodName option is set', function () {
        var stub = sinon.stub().returns('hello');
        beforeEach(function () {
            app = express()
                .use(bodyParser.urlencoded({extended: false}))
                .use('/api/:method?', apiMiddleware(API_FILES_PATH, {buildMethodName: stub}));
        });

        it('should build a custom methodname', function () {
            request(app)
                .get('/api/any/method/?name=Stepan')
                .expect('Content-Type', /json/)
                .expect('{"data":"Hello, Stepan"}')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    stub.callCount.should.be.equal(1);
                })
        });
    });

    describe('when generating documentations is turned off', function () {
        beforeEach(function () {
            app = express()
                .use(bodyParser.urlencoded({extended: false}))
                .use('/api/:method?', apiMiddleware(API_FILES_PATH, {disableDocPage: true}));
        });

        it('shouldn\'t generate documentation page if method name was missed', function () {
            request(app)
                .get('/api/')
                .expect('Content-Type', /json/)
                .expect('{"error":{"type":"BAD_REQUEST","message":"API method was\'t specified"}}')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                })
        });
    });
});
