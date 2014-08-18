modules.define(
    'baby-loris-api',
    [
        'inherit',
        'jquery',
        'vow',
        'baby-loris-api-error'
    ],
    function (
        provide,
        inherit,
        $,
        vow,
        ApiError
    ) {

    /*
     * Set of predefined API errors.
     */
    var XHR_ERRORS = {
        404: new ApiError(ApiError.NOT_FOUND, 'API middleware wasn\'t found')
    };

    /**
     * Api provider.
     */
    var Api = inherit({
        /**
         * @param {String} basePath
         * @param {Object} [options] Extra options.
         * @param {Boolean} [options.disableBatch=false] Disable using batch mode.
         * @param {Object} [options.ajaxSettings] jQuery settings for ajax request.
         */
        __constructor: function (basePath, options) {
            this._basePath = basePath;
            this._options = $.extend(true, {
                ajaxSettings: {
                    method: 'post',
                    dataType: 'json',
                    contentType: 'application/json',
                    cache: false,
                    traditional: true
                },
                disableBatch: false
            }, options);
            this._batch = [];
            this._deferreds = {};
        },

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
         */
        _execWithoutBatching: function (methodName, params) {
            var defer = vow.defer();
            var options = $.extend(true, {},
                this._options.ajaxSettings,
                {
                    data: JSON.stringify(params),
                    url: this._basePath + methodName
                }
            );

            $.ajax(options).then(
                this._resolvePromise.bind(this, defer),
                this._rejectPromise.bind(this, defer)
            );

            return defer.promise();
        },

        /**
         * Executes method with a little delay, adding it to batch.
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
            if (this._batch.length === 1) {
                setTimeout(this._sendBatchRequest.bind(this), 0);
            }
        },

        /**
         * Performs batch request.
         */
        _sendBatchRequest: function () {
            var options = $.extend(true, {}, this._options.ajaxSettings, {
                url: this._basePath + 'baby-loris-api-batch',
                data: JSON.stringify({methods: this._batch})
            });
            $.ajax(options).then(
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
    });

    provide(Api);
});
