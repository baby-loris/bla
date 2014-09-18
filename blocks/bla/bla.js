(function (global) {
    /**
     * Borrowed from `next-tick` by Dmitry Filatov.
     * @see https://github.com/bem/bem-core/blob/v2/common.blocks/next-tick/next-tick.vanilla.js
     *
     * Calls a callback function in the next tick.
     *
     * @param {Function} callback
     */
    var nextTick = (function () {
        var fns = [];
        var enqueueFn = function (fn) {
            return fns.push(fn) === 1;
        };
        var callFns = function () {
            var fnsToCall = fns;
            var i = 0;
            var len = fns.length;
            fns = [];
            while (i < len) {
                fnsToCall[i++]();
            }
        };

        if (typeof global.setImmediate === 'function') { // ie10
            return function (fn) {
                enqueueFn(fn) && global.setImmediate(callFns);
            };
        }

        if (global.postMessage && !global.attachEvent) { // modern browsers
            var msg = '__nextTick' + Date.now();
            var onMessage = function (e) {
                if (e.data === msg) {
                    e.stopPropagation && e.stopPropagation();
                    callFns();
                }
            };
            global.addEventListener('message', onMessage, true);
            return function (fn) {
                enqueueFn(fn) && global.postMessage(msg, '*');
            };
        }

        return function (fn) { // old browsers
            enqueueFn(fn) && setTimeout(callFns, 0);
        };
    })();

    /**
     * Returns API class based on dependecies.
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
         * Api provider.
         *
         * @param {String} basePath Url path to the middleware root.
         * @param {Object} [options] Extra options.
         * @param {Boolean} [options.disableBatch=false] Disable using batch mode.
         */
        function Api(basePath, options) {
            this._basePath = basePath;
            this._options = {
                disableBatch: options && options.disableBatch
            };
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
             * @returns {vow.Promise}
             */
            exec: function (methodName, params) {
                return this._options.disableBatch ?
                    this._execWithoutBatching(methodName, params) :
                    this._execWithBatching(methodName, params);
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
                    nextTick(this._sendBatchRequest.bind(this));
                }
            },

            /**
             * Performs batch request.
             */
            _sendBatchRequest: function () {
                var url = this._basePath + 'bla-batch';
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
