modules.define('baby-loris-api-error', function (provide) {

    /**
     * API error.
     *
     * @param {String} type Error type.
     * @param {String} message Human-readable description of the error.
     */
    function ApiError(type, message) {
        this.name = 'ApiError';
        this.type = type;
        this.message = message;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    ApiError.prototype = Object.create(Error.prototype, {
        constructor: {
            value: ApiError
        }
    });

    /**
     * Invalid or missed parameter.
     */
    ApiError.BAD_REQUEST = 'BAD_REQUEST';

    /**
     * Unspecified error or server logic error.
     */
    ApiError.INTERNAL_ERROR = 'INTERNAL_ERROR';

    /**
     * API middleware wasn't found.
     */
    ApiError.NOT_FOUND = 'NOT_FOUND';

    provide(ApiError);
});
