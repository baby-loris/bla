modules.define(
    'test',
    [
        'bla',
        'bla-error'
    ],
    function (
        provide,
        Api,
        ApiError
    ) {

    describe('bla', function () {
        var api;
        var server;

        beforeEach(function () {
            server = sinon.fakeServer.create();
            api = new Api('/api/');
        });

        afterEach(function () {
            server.restore();
        });

        describe('when batching mode is enabled', function () {
            var TIMEOUT = window.TIMEOUT || 1;
            describe('when the server is working', function () {
                it('should resolve a promise for a good request', function (callback) {
                    server.respondWith(
                        'POST',
                        '/api/batch',
                        [
                            200,
                            {
                                'Content-Type': 'application/json'
                            },
                            '{"data": [{"data": "Hello, world"}]}'
                        ]
                    );

                    api.exec('hello')
                        .then(function (response) {
                            response.should.be.equal('Hello, world');
                            callback();
                        });

                    // API request is executed in the next tick, so we should wait until it is queued.
                    setTimeout(server.respond.bind(server), TIMEOUT);
                });

                it('should reject a promise for a bad request', function (callback) {
                    server.respondWith(
                        'POST',
                        '/api/batch',
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
                    setTimeout(server.respond.bind(server), TIMEOUT);
                });
            });

            describe('when nonexistent method is executed', function () {
                it('should reject a promise with an API error', function (callback) {
                    server.respondWith(
                        'POST',
                        '/api/batch',
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
                    setTimeout(server.respond.bind(server), TIMEOUT);
                });
            });

            describe('when the server is unavailable', function () {
                it('should reject a promise with an API error', function (callback) {
                    server.respondWith([500, {}, 'Internal server error']);
                    api.exec('hello')
                        .fail(function (error) {
                            error.should.be.instanceOf(ApiError);
                            error.type.should.be.equal(500);
                            callback();
                        });
                    setTimeout(server.respond.bind(server), TIMEOUT);
                });
            });

            describe('when a global timeout is specified', function () {
                beforeEach(function () {
                    api = new Api('/api/', {timeout: 1});
                });

                it('should reject a promise in case of timeout', function (callback) {
                    api.exec('hello', {})
                        .fail(function (error) {
                            error.should.be.instanceOf(ApiError);
                            callback();
                        });
                });
            });

            describe('when timeout option is passed', function () {
                it('should reject a promise in case of timeout', function (callback) {
                    api.exec('hello', {}, {timeout: 1})
                        .fail(function (error) {
                            error.should.be.instanceOf(ApiError);
                            callback();
                        });
                });
            });
        });

        describe('when batching mode is disabled globally with `enableBatching` option', function () {
            beforeEach(function () {
                api = new Api('/api/', {enableBatching: false});
            });

            describe('when the server is working', function () {
                it('should resolve a promise for a good request', function (callback) {
                    server.respondWith(
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
                    server.respond();
                });

                it('should reject a promise for a bad request', function (callback) {
                    server.respondWith(
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
                    server.respond();
                });
            });

            describe('when a request was sent to nonexistent url', function () {
                it('should reject a promise with an API error', function (callback) {
                    api.exec('hello-world', {})
                        .fail(function (error) {
                            error.should.be.instanceOf(ApiError);
                            error.type.should.be.equal(404);
                            callback();
                        });
                    server.respond();
                });
            });

            describe('when the server is unavailable', function () {
                it('should reject a promise with an API error', function (callback) {
                    server.respondWith([500, {}, 'Internal server error']);
                    api.exec('hello-world', {})
                        .fail(function (error) {
                            error.should.be.instanceOf(ApiError);
                            error.type.should.be.equal(500);
                            callback();
                        });
                    server.respond();
                });
            });

            describe('when timeout option is passed', function () {
                it('should reject a promise in case of timeout', function (callback) {
                    api.exec('hello', {}, {timeout: 1})
                        .fail(function (error) {
                            error.should.be.instanceOf(ApiError);
                            callback();
                        });
                });
            });
        });

        describe('when batching mode is disabled per-method or per-exec', function () {
            beforeEach(function () {
                server.respondWith(
                    'POST',
                    '/api/batch',
                    [
                        200,
                        {
                            'Content-Type': 'application/json'
                        },
                        '{"data": [{"data": "Hello, world"}]}'
                    ]
                );

                server.respondWith(
                    'POST',
                    '/api/slow-method',
                    [
                        200,
                        {
                            'Content-Type': 'application/json'
                        },
                        '{"data": "Long text"}'
                    ]
                );
            });

            it('should batch every method, except those with execOptions.enableBatching=false', function (callback) {
                api.exec('slow-method', {}, {enableBatching: false})
                    .then(function (response) {
                        response.should.eq('Long text');
                        callback();
                    })
                    .fail(callback);

                api.exec('any-other-method')
                    .then(function (response) {
                        response.should.eq('Hello, world');
                        callback();
                    })
                    .fail(callback);

                server.respond();
            });
        });
    });

    provide();
});
