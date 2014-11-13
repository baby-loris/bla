var inherit = require('inherit');
var extend = require('node.extend');
var glob = require('glob');

var ApiError = require('./api-error');

/**
 * Path to built in API methods.
 */
var BUILTIN_METHODS_PATH_PATTERN = __dirname + '/../api/**/*.api.js';

/**
 * API provider.
 */
var Api = inherit({
    /**
     * @param {String} methodPathPattern Path to api files. Path includes a file mask (supports minimatch).
     */
    __constructor: function (methodPathPattern) {
        this._methods = extend(
            this._getMethods(BUILTIN_METHODS_PATH_PATTERN),
            this._getMethods(methodPathPattern)
        );
    },

    /**
     * Executes API method.
     *
     * @param {String} methodName Method to be executed.
     * @param {Object} params Params which will be passed to the method.
     * @param {Object} request Express request.
     * @returns {vow.Promise}
     */
    exec: function (methodName, params, request) {
        return this.getMethod(methodName).exec(params, request, this);
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
        var methods = this._methods;
        var preparedMethods = Object.keys(methods).reduce(function (result, methodName) {
            var method = methods[methodName];
            if (method.getOption('showOnDocPage') !== false) {
                result[methodName] = method;
            }
            return result;
        }, {});

        return formatter(preparedMethods);
    },

    /**
     * Returns method declaration.
     *
     * @param {String} methodName Method to be executed.
     * @returns {ApiMethod}
     * @throws {ApiError} Will throw an error if api method isn't specified or not found.
     */
    getMethod: function (methodName) {
        if (!methodName) {
            throw new ApiError(ApiError.BAD_REQUEST, 'API method wasn\'t specified');
        }
        if (!this._methods[methodName]) {
            throw new ApiError(ApiError.NOT_FOUND, 'API method ' + methodName + ' wasn\'t found');
        }

        return this._methods[methodName];
    },

    /**
     * Finds API methods in file system.
     *
     * @param {String} methodPathPattern Path to api files. Path includes a file mask (supports minimatch).
     * @returns {Object}
     * @throws {ApiError} Will throw an error if api methods aren't found.
     */
    _getMethods: function (methodPathPattern) {
        var files = glob.sync(methodPathPattern);

        if (!files.length) {
            throw new ApiError(ApiError.INTERNAL_ERROR, 'Cannot find any api method using provided file mask');
        }

        return files.reduce(function (result, file) {
            var method = require(file);
            result[method.getName()] = method;
            return result;
        }, {});
    }
});

module.exports = Api;
