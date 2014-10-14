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
            describe('when the server is working', function () {
                it('should resolve a promise for a good request', function (callback) {
                    server.respondWith(
                        'POST',
                        '/api/bla-batch',
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
                    setTimeout(server.respond.bind(server), 1);
                });

                it('should reject a promise for a bad request', function (callback) {
                    server.respondWith(
                        'POST',
                        '/api/bla-batch',
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
                    setTimeout(server.respond.bind(server), 1);
                });
            });

            describe('when nonexistent method is executed', function () {
                it('should reject a promise with an API error', function (callback) {
                    server.respondWith(
                        'POST',
                        '/api/bla-batch',
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
                    setTimeout(server.respond.bind(server), 1);
                });
            });

            describe('when the server is unavailable', function () {
                it('should reject a promise with an API error', function (callback) {
                    server.respondWith([500, {}, 'Internal server error']);
                    api.exec('hello')
                        .fail(function (error) {
                            error.should.be.instanceOf(ApiError);
                            error.type.should.be.equal(ApiError.INTERNAL_ERROR);
                            callback();
                        });
                    setTimeout(server.respond.bind(server), 1);
                });
            });
        });

        describe('when batching mode is disabled globally', function () {
            beforeEach(function () {
                server = sinon.fakeServer.create();
                this.clock = sinon.useFakeTimers();
                api = new Api('/api/', {noBatching: true});
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
                            error.type.should.be.equal(ApiError.NOT_FOUND);
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
                            error.type.should.be.equal(ApiError.INTERNAL_ERROR);
                            callback();
                        });
                    server.respond();
                });
            });
        });

        describe('when batching mode is disabled per method', function () {
            it('should batch every other method except "slow-method"', function (callback) {
                server = sinon.fakeServer.create();
                this.clock = sinon.useFakeTimers();
                api = new Api('/api/', {noBatching: ['slow-method']});
                server.respondWith(
                    'POST',
                    '/api/bla-batch',
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

                api.exec('any-other-method', {})
                    .then(function (response) {
                        response.should.eq('Hello, world');
                        callback();
                    })
                    .fail(function (reason) {
                        callback(reason);
                    });

                api.exec('slow-method')
                    .then(function (response) {
                        response.should.eq('Long text');
                        callback();
                    })
                    .fail(function (reason) {
                        callback(reason);
                    });

                server.respond();
            });
        });

        describe('when batching mode is disabled per exec', function () {
            it('should batch every method, except those with execOptions.noBatching=true', function (callback) {
                server = sinon.fakeServer.create();
                this.clock = sinon.useFakeTimers();
                api = new Api('/api/');
                server.respondWith(
                    'POST',
                    '/api/bla-batch',
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

                api.exec('any-other-method')
                    .then(function (response) {
                        response.should.eq('Hello, world');
                        callback();
                    })
                    .fail(function (reason) {
                        callback(reason);
                    });

                api.exec('slow-method', {}, {noBatching: true})
                    .then(function (response) {
                        response.should.eq('Long text');
                        callback();
                    })
                    .fail(function (reason) {
                        callback(reason);
                    });

                server.respond();
            });
        });
    });

    provide();
});
