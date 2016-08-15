var inherit = require('inherit');
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
     * @param {Object} [options] Api options.
     * @param {String} [options.paramsValidation=normalize] Preprocessing method parameters.
     * @param {Boolean} [options.allowUndeclaredParams=false] Tolerate passing undeclared parameters.
     * @param {Boolean} [options.preventThrowingErrors=false] Wrap ApiMethod call in promise to prevent throwing errors.
     * @param {Boolean} [options.debug=false] Debug mode.
     */
    __constructor: function (methodPathPattern, options) {
        this._options = options || {};

        var builtinMethods = this._getMethods(BUILTIN_METHODS_PATH_PATTERN);
        this._methods = this._getMethods(methodPathPattern, builtinMethods);
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

    isDebug: function () {
        return Boolean(this._options.debug);
    },

    /**
     * Finds API methods in file system.
     *
     * @param {String} methodPathPattern Path to api files. Path includes a file mask (supports minimatch).
     * @param {Object} [methods={}] Initial set of methods.
     * @returns {Object}
     * @throws {ApiError} Will throw an error if api methods aren't found.
     */
    _getMethods: function (methodPathPattern, methods) {
        var files = glob.sync(methodPathPattern);

        if (!files.length) {
            throw new ApiError(ApiError.INTERNAL_ERROR, 'Cannot find any api method using provided file mask');
        }

        return files.reduce(function (result, file) {
            var method = require(file);
            var methodName = method.getName();

            if (result[methodName]) {
                throw new ApiError(ApiError.INTERNAL_ERROR, 'Cannot redeclare method with name ' + methodName);
            }

            this._applyOptionsToMethod(method);

            result[methodName] = method;
            return result;
        }.bind(this), methods || {});
    },

    /**
     * Sets API method options declared for API.
     *
     * @param {ApiMethod} method
     */
    _applyOptionsToMethod: function (method) {
        var options = this._options;
        Object.keys(options).forEach(function (key) {
            var value = options[key];
            // ApiMethod option has a higher priority
            if (value && method.getOption(key) === undefined) {
                method.setOption(key, value);
            }
        });
    }
});

module.exports = Api;
