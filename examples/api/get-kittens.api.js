var asker = require('vow-asker');
var bla = require('../../lib/index');

var FLICKR_API_KEY = '5e4b13a46ba7145a3c3af689ed9c3ac6';
var FLICK_PHOTO_URL_TEMPLATE = 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_{size}.jpg';

/**
 * Build url for a photo.
 *
 * @see ../../tests/examples/api/get-kittens.test.js Tests for the API method.
 * @param {Object} data Data for the flickr photo.
 * @return {String}
 */
function getPhotoUrl(data) {
    return FLICK_PHOTO_URL_TEMPLATE
        .replace('{farm-id}', data.farm)
        .replace('{server-id}', data.server)
        .replace('{id}', data.id)
        .replace('{secret}', data.secret)
        .replace('{size}', 'm');
}

/**
 * Returns photos of kittens using Flickr API.
 */
module.exports = new bla.ApiMethod('get-kittens')
    .setDescription('Returns photos of kittens using Flickr API')
    .setOption('hiddenOnDocPage', true)
    .setAction(function () {
        return asker({
            host: 'api.flickr.com',
            protocol: 'https:',
            path: '/services/rest/',
            query: {
                method: 'flickr.photos.search',
                tags: 'kittens',
                api_key: FLICKR_API_KEY,
                format: 'json',
                nojsoncallback: 1,
                per_page: 3
            },
            timeout: 5000
        })
            .then(function (response) {
                var data = JSON.parse(response.data);
                return data.photos.photo.map(function (photo) {
                    return {
                        title: photo.title,
                        url: getPhotoUrl(photo)
                    };
                });
            })
            .fail(function (error) {
                throw new bla.ApiError(bla.ApiError.INTERNAL_ERROR, error.message);
            });
    });
