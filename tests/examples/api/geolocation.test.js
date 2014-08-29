require('chai').should();
var express = require('express');
var bodyParser = require('body-parser');
var nock = require('nock');
var request = require('supertest');
var sinon = require('sinon');

var GeolocationApiMethod = require('../../../examples/api/geolocation.api.js');
var apiMiddleware = require('../../../lib/middleware');
var ApiError = require('../../../lib/api-error');
var API_FILES_PATH = __dirname + '/../../../examples/api/**/*.api.js';

var yandexLocator = nock('http://api.lbs.yandex.net').post('/geolocation');
var successResponse = {
    position: {
        latitude: 55.7340469,
        longitude: 37.5886269,
        altitude: 0,
        precision: 100000,
        altitude_precision: 30,
        type: 'ip'
    }
};
var errorResponse = {
    error: 'Location not found'
};

describe('geolocation.api.js', function () {
    describe('when server works', function () {
        it('should return position', function (done) {
            yandexLocator.reply(200, successResponse);
            GeolocationApiMethod.exec({ip: '77.88.19.18'})
                .then(function () {
                    done();
                })
                .done();
        });

        it('should reject promise for a response with an error', function (done) {
            yandexLocator.reply(200, errorResponse);
            GeolocationApiMethod.exec({ip: '77.88.19.18'})
                .fail(function (error) {
                    error.message.should.equal(errorResponse.error);
                    done();
                })
                .done();
        });

        it('should reject promise for missed ip', function (done) {
            GeolocationApiMethod.exec()
                .fail(function () {
                    done();
                })
                .done();
        });

        it('should reject promise for 404 status', function (done) {
            yandexLocator.reply(404, errorResponse);
            GeolocationApiMethod.exec({ip: '77.88.19.18'})
                .fail(function (error) {
                    error.type.should.equal(ApiError.NOT_FOUND);
                    done();
                })
                .done();
        });

        describe('when the method is executed from the middleware', function () {
            var app;
            beforeEach(function () {
                sinon.spy(GeolocationApiMethod, 'exec');
                app = express()
                    .use(bodyParser.json())
                    .use('/api/:method?', apiMiddleware(API_FILES_PATH));
            });
            afterEach(function () {
                GeolocationApiMethod.exec.restore();
            });

            it('should get ip from express request', function (done) {
                yandexLocator.reply(200, successResponse);
                request(app)
                    .get('/api/geolocation')
                    .expect('Content-Type', /json/)
                    .expect(JSON.stringify({data: successResponse.position}))
                    .expect(200)
                    .end(done);
            });
        });
    });

    describe('when server is unavailable', function () {
        it('should reject promise for 500 status', function (done) {
            yandexLocator.reply(500, errorResponse);
            GeolocationApiMethod.exec({ip: '77.88.19.18'})
                .fail(function (error) {
                    error.type.should.equal(ApiError.INTERNAL_ERROR);
                    done();
                })
                .done();
        });
    });
});
