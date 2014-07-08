var inherit = require('inherit');
var vowFs = require('vow-fs');
var vow = require('vow');

var ApiMethod = require('./api-method');
var HttpError = require('./utils/http-error');

/**
 * @param {Express.Request} req
 * @param {Object} params
 * @returns {Object}
 */
function getParamsFromRequest(req, params) {
    return Object.keys(params).reduce(function (result, key) {
        result[key] = req.param(key);
        return result;
    }, {});
}

/**
 * API provider.
 */
module.exports = inherit({
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
     * @param {Object} [options] An extra options.
     *        {Boolean} options.isExpressRequest Params is express request object.
     *        In this case all supported params will be copied from express request to a new object.
     *        This new object will be passed to API method.
     * @returns {vow.Promise}
     */
    exec: function (methodName, params, options) {
        options = options || {};
        return this._methodsPromise.then(function (methods) {
            var method = methods[methodName];
            if (!method) {
                throw new HttpError(404, 'API method ' + methodName + ' was\'t found');
            }

            var finalParams = options.isExpressRequest ?
                getParamsFromRequest(params, method.getParams()) :
                params;

            return method.exec(finalParams);
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
            return formatter(methods);
        });
    },

    /**
     * Finds API methods in file system.
     *
     * @param {String} methodPathPattern Path to api files. Path includes a file mask (supports minimatch).
     * @returns {vow.Promise}
     */
    _getMethods: function (methodPathPattern) {
        return vowFs.glob(methodPathPattern).then(function (files) {
            return files.reduce(function (result, file) {
                var method = require(file);
                result[method.getName()] = method;
                return result;
            }, {});
        });
    }
});
