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
         */
        __constructor: function (basePath) {
            this._basePath = basePath;
        },

        /**
         * Executes api by path with specified parameters.
         *
         * @param {String} methodName Method name.
         * @param {Object} params Data should be sent to the method.
         * @param {Object} options Extra options.
         * @param {Object} options.ajaxSettings jQuery settings for ajax request.
         * @returns {vow.promise}
         */
        exec: function (methodName, params, options) {
            var d = new vow.Deferred();
            options = options || {};

            var ajaxSettings = $.extend(
                {
                    method: 'post',
                    dataType: 'json',
                    contentType: 'application/json',
                    cache: false,
                    traditional: true
                },
                options.ajaxSettings,
                {
                    url: this._basePath + methodName,
                    data: JSON.stringify(params)
                }
            );

            $.ajax(ajaxSettings).then(
                function (data) {
                    var error = data.error;
                    if (error) {
                        d.reject(new ApiError(error.type, error.message));
                    } else {
                        d.resolve(data.data);
                    }
                },
                function (xhr) {
                    var error = XHR_ERRORS[xhr.status] || new ApiError(ApiError.INTERNAL_ERROR, xhr.message);
                    d.reject(error);
                }
            );

            return d.promise();
        }
    });

    provide(Api);
});
