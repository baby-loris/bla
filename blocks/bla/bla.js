(function (global) {
    /**
     * Returns API class based on dependencies.
     *
     * @param {Object} vow
     * @param {Object} ApiError
     * @returns {Function}
     */
    function createApiClass(vow, ApiError) {

        /**
         * Makes an ajax request.
         *
         * @param {String} url A string containing the URL to which the request is sent.
         * @param {String} data Data to be sent to the server.
         * @returns {vow.Promise}
         */
        function sendAjaxRequest(url, data) {
            var xhr = new XMLHttpRequest();
            var d = vow.defer();

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        d.resolve(JSON.parse(xhr.responseText));
                    } else {
                        d.reject(xhr);
                    }
                }
            };

            xhr.open('POST', url, true);
            xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.send(data);

            return d.promise();
        }

        /*
         * Set of predefined API errors.
         */
        var XHR_ERRORS = {
            404: new ApiError(ApiError.NOT_FOUND, 'API middleware wasn\'t found')
        };

        /**
         * Checks if the passed argument is an Array. This util function uses Array.isArray if present, if not
         * uses a polyfill suggest at the MDN JS API documentation.
         * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
         *
         * @param {*} arg
         * @returns {Boolean}
         */
        function isArray(arg) {
            return arg && (Array.isArray ?
                Array.isArray(arg) :
                Object.prototype.toString.call(arg) === '[object Array]'
            );
        }

        /**
         * Api provider.
         *
         * @param {String} basePath Url path to the middleware root.
         * @param {Object} [options] Extra options.
         * @param {Boolean} [options.enableBatching=true] Enables batching.
         * @param {Boolean|String[]} [options.noBatching=false] @deprecated Turns off batching.
         * Accepts a boolean value, for all methods, or an array with the specific methods that shouldn't be batched.
         */
        function Api(basePath, options) {
            this._basePath = basePath;
            options = options || {};
            this._options = {
                enableBatching: options.enableBatching,
                // if the 'noBatching' option is not an Array is considered Boolean.
                noBatching: !isArray(options.noBatching) && Boolean(options.noBatching)
            };
            // if the 'noBatching' option is an Array set the noBatchingForMethods option
            this._noBatchingForMethods = isArray(options.noBatching) ? options.noBatching : [];
            this._batch = [];
            this._deferreds = {};
        }

        Api.prototype = {
            constructor: Api,

            /**
             * Executes api by path with specified parameters.
             *
             * @param {String} methodName Method name.
             * @param {Object} params Data should be sent to the method.
             * @param {Object} [execOptions] Exec-specific options.
             * @param {Boolean} [execOptions.enableBatching=true] Should the current call of the method be batched.
             * @param {Boolean} [execOptions.noBatching=false] @deprecated Should the current call of the
             * method be batched.
             * @returns {vow.Promise}
             */
            exec: function (methodName, params, execOptions) {
                execOptions = execOptions || {};

                var enableBatching;
                if (execOptions.hasOwnProperty('enableBatching')) {
                    enableBatching = execOptions.enableBatching;
                } else if (this._options.enableBatching !== undefined) {
                    enableBatching = this._options.enableBatching;
                } else {
                    // Check deprecated option.
                    // Defaults to `true` if no batching option specified.
                    enableBatching = !this._options.noBatching &&
                        !execOptions.noBatching &&
                        this._noBatchingForMethods.indexOf(methodName) === -1;
                }

                return enableBatching ?
                    this._execWithBatching(methodName, params) :
                    this._execWithoutBatching(methodName, params);
            },

            /**
             * Executes method immediately.
             *
             * @param {String} methodName Method name.
             * @param {Object} params Data should be sent to the method.
             * @returns {vow.Promise}
             */
            _execWithoutBatching: function (methodName, params) {
                var defer = vow.defer();
                var url = this._basePath + methodName;
                var data = JSON.stringify(params);

                sendAjaxRequest(url, data).then(
                    this._resolvePromise.bind(this, defer),
                    this._rejectPromise.bind(this, defer)
                );

                return defer.promise();
            },

            /**
             * Executes method with a little delay, adding it to batch.
             *
             * @param {String} methodName Method name.
             * @param {Object} params Data should be sent to the method.
             * @returns {vow.Promise}
             */
            _execWithBatching: function (methodName, params) {
                var requestId = this._getRequestId(methodName, params);
                var promise = this._getRequestPromise(requestId);

                if (!promise) {
                    this._addToBatch(methodName, params);
                    promise = this._createPromise(requestId);
                    this._run();
                }

                return promise;
            },

            /**
             * Generates an ID for a method request.
             *
             * @param {String} methodName
             * @param {Object} params
             * @returns {String}
             */
            _getRequestId: function (methodName, params) {
                var stringifiedParams = JSON.stringify(params) || '';
                return methodName + stringifiedParams;
            },

            /**
             * Gets the promise object for given request ID.
             *
             * @param {String} requestId Request ID for which promise is retrieved.
             * @returns {vow.Promise|undefined}
             */
            _getRequestPromise: function (requestId) {
                var defer = this._deferreds[requestId];
                return defer && defer.promise();
            },

            /**
             * Appends data to the batch array.
             *
             * @param {String} methodName
             * @param {Object} params
             */
            _addToBatch: function (methodName, params) {
                this._batch.push({
                    method: methodName,
                    params: params
                });
            },

            /**
             * Creates new deferred promise.
             *
             * @param {String} requestId Request ID for which promise is generated.
             * @returns {vow.Promise}
             */
            _createPromise: function (requestId) {
                var defer = vow.defer();
                this._deferreds[requestId] = defer;
                return defer.promise();
            },

            /**
             * Initializes async batch request.
             */
            _run: function () {
                // The collecting requests for the batch will start when a first request is received.
                // That's why the batch length is checked there.
                if (this._batch.length === 1) {
                    vow.resolve().then(this._sendBatchRequest, this);
                }
            },

            /**
             * Performs batch request.
             */
            _sendBatchRequest: function () {
                var url = this._basePath + 'batch';
                var data = JSON.stringify({methods: this._batch});
                sendAjaxRequest(url, data).then(
                    this._resolvePromises.bind(this, this._batch),
                    this._rejectPromises.bind(this, this._batch)
                );

                this._batch = [];
            },

            /**
             * Resolve deferred promise.
             *
             * @param {vow.Deferred} defer
             * @param {Object} response Server response.
             */
            _resolvePromise: function (defer, response) {
                var error = response.error;
                if (error) {
                    defer.reject(new ApiError(error.type, error.message));
                } else {
                    defer.resolve(response.data);
                }
            },

            /**
             * Resolves deferred promises.
             *
             * @param {Object[]} batch Batch request data.
             * @param {Object} response Server response.
             */
            _resolvePromises: function (batch, response) {
                var data = response.data;
                for (var i = 0, requestId; i < batch.length; i++) {
                    requestId = this._getRequestId(batch[i].method, batch[i].params);
                    this._resolvePromise(this._deferreds[requestId], data[i]);
                    delete this._deferreds[requestId];
                }
            },

            /**
             * Rejects deferred promise.
             *
             * @param {vow.Deferred} defer
             * @param {XMLHttpRequest} xhr
             */
            _rejectPromise: function (defer, xhr) {
                var errorMessage = xhr.message || xhr.statusText || xhr.responseText;
                var error = XHR_ERRORS[xhr.status] || new ApiError(ApiError.INTERNAL_ERROR, errorMessage);
                defer.reject(error);
            },

            /**
             * Rejects deferred promises.
             *
             * @param {Object[]} batch Batch request data.
             * @param {XMLHttpRequest} xhr
             */
            _rejectPromises: function (batch, xhr) {
                for (var i = 0, requestId; i < batch.length; i++) {
                    requestId = this._getRequestId(batch[i].method, batch[i].params);
                    this._rejectPromise(this._deferreds[requestId], xhr);
                    delete this._deferreds[requestId];
                }
            }
        };

        return Api;
    }

    var defineAsGlobal = true;

    /**
     * @see https://github.com/ymaps/modules
     */
    if (typeof global.modules === 'object') {
        global.modules.define('bla', ['vow', 'bla-error'], function (provide, vow, ApiError) {
            var Api = createApiClass(vow, ApiError);
            provide(Api);
        });
        defineAsGlobal = false;
    }

    /**
     * @see requirejs.org
     */
    if (typeof global.define === 'function') {
        global.define('bla', ['bla-error', 'vow'], function (ApiError, vow) {
            return createApiClass(vow, ApiError);
        });
        defineAsGlobal = false;
    }

    if (defineAsGlobal) {
        global.bla = global.bla || {};
        global.bla.Api = createApiClass(global.vow, global.bla.ApiError);
    }

}(this));
