var request = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');
var apiMiddleware = require('../../lib/middleware');
var should = require('chai').should();

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
            .expect('{"error":{"type":"BAD_REQUEST","message":"mising name parameter"}}')
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
