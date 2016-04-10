(function (global) {

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

    /**
     * Timeout.
     */
    ApiError.TIMEOUT = 'TIMEOUT';

    var defineAsGlobal = true;

    /**
     * @see https://github.com/ymaps/modules
     */
    if (typeof global.modules === 'object') {
        global.modules.define('bla-error', function (provide) {
            provide(ApiError);
        });
        defineAsGlobal = false;
    }

    /**
     * @see requirejs.org
     */
    if (typeof global.define === 'function') {
        global.define('bla-error', function () {
            return ApiError;
        });
        defineAsGlobal = false;
    }

    /**
     * Common JS.
     * @see http://wiki.commonjs.org/wiki/Modules/1.1.1
     */
    if (typeof require === 'function' && typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = ApiError;
        defineAsGlobal = false;
    }

    if (defineAsGlobal) {
        global.bla = global.bla || {};
        global.bla.ApiError = ApiError;
    }

}(window));
