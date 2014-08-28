require('chai').should();
var nock = require('nock');

var GetKittensApiMethod = require('../../../examples/api/get-kittens.api.js');

var flickr = nock('https://api.flickr.com')
    .filteringPath(function () {
        return '/services/rest/';
    })
    .get('/services/rest/');
var flickrMockResponse = {
    photos: {
        page: 1,
        pages: 127973,
        perpage: 3,
        total: '383919',
        photo: [
            {
                id: '14633759942',
                owner: '93524227@N04',
                secret: '3ca537bac3',
                server: '2904',
                farm: 3,
                title: 'Demain, il sera encore plus fort.',
                ispublic: 1,
                isfriend: 0,
                isfamily: 0
            }
        ]
    },
    stat: 'ok'
};

describe('get-kittens.api.js', function () {
    describe('when server works', function () {
        it('should return kittens', function (done) {
            flickr.reply(200, flickrMockResponse);
            GetKittensApiMethod.exec()
                .then(function () {
                    done();
                })
                .done();
        });
    });

    describe('when server is unavailable', function () {
        it('should reject promise when timeout is reached', function (done) {
            flickr.reply(500, 'Internal server error');
            GetKittensApiMethod.exec()
                .fail(function () {
                    done();
                })
                .done();
        });
    });
});
