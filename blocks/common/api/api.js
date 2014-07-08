modules.define(
    'api',
    [
        'inherit',
        'jquery',
        'vow'
    ],
    function (
        provide,
        inherit,
        $,
        vow
    ) {

    /**
     * HTTP error.
     *
     * @param {Number} status HTTP status.
     * @param {String} message
     */
    function HttpError(status, message) {
        this.name = 'HttpError';
        this.message = message;
        this.status = status;
    }
    HttpError.prototype = Error.prototype;

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
         * @param {String} path
         * @param {Object} params
         * @returns {vow.promise}
         */
        exec: function (path, params) {
            var d = new vow.Deferred();

            $.ajax({
                method: 'post',
                dataType: 'json',
                url: this._basePath + path,
                data: params,
                cache: false
            }).then(
                function (data) {
                    var error = data.error;
                    if (error) {
                        d.reject(new HttpError(error.status, error.message));
                    } else {
                        d.resolve(data.data);
                    }
                },
                function (xhr, status, message) {
                    d.reject(new HttpError(xhr.status, xhr.message));
                }
            );

            return d.promise();
        }
    });

    provide(Api);
});
