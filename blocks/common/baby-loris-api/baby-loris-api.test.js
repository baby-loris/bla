modules.define(
    'test',
    [
        'baby-loris-api',
        'baby-loris-api-error'
    ],
    function (
        provide,
        Api,
        ApiError
    ) {

    describe('baby-loris-api', function () {
        var api;

        beforeEach(function () {
            this.server = sinon.fakeServer.create();
            api = new Api('/api/');
        });

        afterEach(function () {
            this.server.restore();
        });

        describe('when a server works', function () {
            it('should resolve a promise for a good request', function (callback) {
                this.server.respondWith(
                    'POST',
                    '/api/hello-world',
                    [
                        200,
                        {
                            'Content-Type': 'application/json'
                        },
                        '{"data": "Hello, world"}'
                    ]
                );

                var api = new Api('/api/');
                api.exec('hello-world', {})
                    .then(function (response) {
                        response.should.be.equal('Hello, world');
                        callback();
                    });
                this.server.respond();
            });

            it('should reject a promise for a bad request', function (callback) {
                this.server.respondWith(
                    'POST',
                    '/api/hello-world',
                    [
                        200,
                        {
                            'Content-Type': 'application/json'
                        },
                        '{"error": {"type": "BAD_REQUEST", "message": "missing an important parameter"}}'
                    ]
                );

                api.exec('hello-world', {})
                    .fail(function (error) {
                        error.should.be.instanceOf(ApiError);
                        error.type.should.be.equal(ApiError.BAD_REQUEST);
                        callback();
                    });
                this.server.respond();
            });
        });

        describe('when a request was sent to unexist url', function () {
            it('should reject a promise with an API error', function (callback) {
                api.exec('hello-world', {})
                    .fail(function (error) {
                        error.should.be.instanceOf(ApiError);
                        error.type.should.be.equal(ApiError.NOT_FOUND);
                        callback();
                    });
                this.server.respond();
            });
        });

        describe('when a server is unavailable', function () {
            it('should reject a promise with an API error', function (callback) {
                this.server.respondWith(
                    'POST',
                    '/api/hello-world',
                    [500, {}, 'Internal server error']
                );
                api.exec('hello-world', {})
                    .fail(function (error) {
                        error.should.be.instanceOf(ApiError);
                        error.type.should.be.equal(ApiError.INTERNAL_ERROR);
                        callback();
                    });
                this.server.respond();
            });
        });
    });

    provide();
});
