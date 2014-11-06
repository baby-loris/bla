var asker = require('vow-asker');
var vow = require('vow');
var bla = require('../../lib');

var LOCATOR_URL = 'http://api.lbs.yandex.net/geolocation';
var LOCATOR_KEY = 'AHpZ_1MBAAAAuWpgBgIARHivoVz39Dac5Bcq_Y0HxT67ikIAAAAAAAAAAABNozWrB1baxG9qshaJBEVaDUsCEw==';

/**
 * Returns location based on IP address
 *
 * @see ../../tests/examples/api/geolocation.test.js Tests for the API method.
 */
module.exports = new bla.ApiMethod({
    name: 'geolocation',
    description: 'Returns geolocation by IP address',
    params: {
        ip: {
            type: 'String',
            description: 'IP address'
        }
    },
    action: function (params, request) {
        var ip = params.ip || request && request.ip;

        if (!ip) {
            return vow.reject(new bla.ApiError('BAD_REQUEST', 'IP address is not specified'));
        }

        return asker({
            url: LOCATOR_URL,
            method: 'POST',
            bodyEncoding: 'multipart',
            allowGzip: true,
            body: {
                json: {
                    common: {
                        version: '1.0',
                        api_key: LOCATOR_KEY
                    },
                    ip: {
                        address_v4: ip
                    }
                }
            },
            timeout: 5000
        })
            .then(function (response) {
                var data = JSON.parse(response.data);

                if (data.error) {
                    throw new bla.ApiError('GEOLOCATION_ERROR', data.error);
                }

                return data.position;
            })
            .fail(function (error) {
                if (error.data && error.data.statusCode === 404) {
                    throw new bla.ApiError(bla.ApiError.NOT_FOUND, 'Cannot detect your location');
                } else {
                    throw new bla.ApiError(bla.ApiError.INTERNAL_ERROR, error.message);
                }
            });
    }
});
