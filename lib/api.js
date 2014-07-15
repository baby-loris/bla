var inherit = require('inherit');
var vowFs = require('vow-fs');

var ApiError = require('./api-error');

/**
 * API provider.
 */
var Api = inherit({
    /**
     * @param {String} methodPathPattern Path to api files. Path includes a file mask (supports minimatch).
     */
    __constructor: function (methodPathPattern) {
        this._methodsPromise = this._getMethods(methodPathPattern);
    },

    /**
     * Executes API method.
     *
     * @param {String} methodName Method to be executed.
     * @param {Object} params Params which will be passed to the method.
     * @returns {vow.Promise}
     */
    exec: function (methodName, params) {
        return this.getMethod(methodName).then(function (method) {
            return method.exec(params);
        });
    },

    /**
     * Generates help for all available methods.
     *
     * @param {String} [format=html] Documentation format (now only html format is available).
     * @returns {vow.Promise}
     */
    generateHelp: function (format) {
        format = format || 'html';
        var formatter = require('./help-formatters/' + format);
        return this._methodsPromise.then(function (methods) {
            var preparedMethods = Object.keys(methods).reduce(function (result, methodName) {
                var method = methods[methodName];
                if (!method.isHiddenOnDocPage()) {
                    result[methodName] = method;
                }
                return result;
            }, {});
            return formatter(preparedMethods);
        });
    },

    /**
     * Returns method declaration.
     *
     * @param {String} methodName Method to be executed.
     * @returns {vow.Promise} Promise will be resolved with an instance of the method.
     */
    getMethod: function (methodName) {
        return this._methodsPromise.then(function (methods) {
            if (!methodName) {
                throw new ApiError(ApiError.BAD_REQUEST, 'API method was\'t specified');
            }
            if (!methods[methodName]) {
                throw new ApiError(ApiError.NOT_FOUND, 'API method ' + methodName + ' was\'t found');
            }
            return methods[methodName];
        });
    },

    /**
     * Finds API methods in file system.
     *
     * @param {String} methodPathPattern Path to api files. Path includes a file mask (supports minimatch).
     * @returns {vow.Promise}
     */
    _getMethods: function (methodPathPattern) {
        return vowFs.glob(methodPathPattern)
            .then(function (files) {
                if (!files.length) {
                    throw new ApiError(ApiError.INTERNAL_ERROR, 'Cannot find any api method usind provided file mask');
                }
                return files.reduce(function (result, file) {
                    var method = require(file);
                    result[method.getName()] = method;
                    return result;
                }, {});
            })
            .fail(function (error) {
                // if it is a file system error then wrap it to ApiError
                throw error instanceof ApiError ?
                    error :
                    new ApiError(ApiError.INTERNAL_ERROR, 'Failed to load api methods: ' + error.message);
            });
    }
});

module.exports = Api;
