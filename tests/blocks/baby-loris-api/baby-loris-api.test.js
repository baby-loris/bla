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
            this.clock = sinon.useFakeTimers();
            api = new Api('/api/');
        });

        afterEach(function () {
            this.clock.restore();
            this.server.restore();
        });

        describe('when batching mode is enabled', function () {
            describe('when the server is working', function () {
                it('should resolve a promise for a good request', function (callback) {
                    this.server.respondWith(
                        'POST',
                        '/api/baby-loris-api-batch',
                        [
                            200,
                            {
                                'Content-Type': 'application/json'
                            },
                            '{"data": [{"data": "Hello, world"}]}'
                        ]
                    );

                    var api = new Api('/api/');
                    api.exec('hello')
                        .then(function (response) {
                            response.should.be.equal('Hello, world');
                            callback();
                        });
                    this.clock.tick(1);
                    this.server.respond();
                });

                it('should reject a promise for a bad request', function (callback) {
                    this.server.respondWith(
                        'POST',
                        '/api/baby-loris-api-batch',
                        [
                            200,
                            {
                                'Content-Type': 'application/json'
                            },
                            '{"data": [{"error": {"type": "BAD_REQUEST", "message": "missing parameter"}}]}'
                        ]
                    );

                    api.exec('hello')
                        .fail(function (error) {
                            error.should.be.instanceOf(ApiError);
                            error.type.should.be.equal(ApiError.BAD_REQUEST);
                            callback();
                        });
                    this.clock.tick(1);
                    this.server.respond();
                });
            });

            describe('when nonexistent method is executed', function () {
                it('should reject a promise with an API error', function (callback) {
                    this.server.respondWith(
                        'POST',
                        '/api/baby-loris-api-batch',
                        [
                            200,
                            {
                                'Content-Type': 'application/json'
                            },
                            '{"data":[{"error":{"type":"NOT_FOUND","message":"API method was\'t found"}}]}'
                        ]
                    );
                    api.exec('nonexistent-method')
                        .fail(function (error) {
                            error.should.be.instanceOf(ApiError);
                            error.type.should.be.equal(ApiError.NOT_FOUND);
                            callback();
                        });
                    this.clock.tick(1);
                    this.server.respond();
                });
            });

            describe('when the server is unavailable', function () {
                it('should reject a promise with an API error', function (callback) {
                    this.server.respondWith([500, {}, 'Internal server error']);
                    api.exec('hello')
                        .fail(function (error) {
                            error.should.be.instanceOf(ApiError);
                            error.type.should.be.equal(ApiError.INTERNAL_ERROR);
                            callback();
                        });
                    this.clock.tick(1);
                    this.server.respond();
                });
            });
        });

        describe('when batching mode is disabled', function () {
            beforeEach(function () {
                this.server = sinon.fakeServer.create();
                this.clock = sinon.useFakeTimers();
                api = new Api('/api/', {disableBatch: true});
            });

            describe('when the server is working', function () {
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

            describe('when a request was sent to nonexistent url', function () {
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

            describe('when the server is unavailable', function () {
                it('should reject a promise with an API error', function (callback) {
                    this.server.respondWith([500, {}, 'Internal server error']);
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
    });

    provide();
});
