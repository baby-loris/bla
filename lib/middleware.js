var Api = require('./api');
var ApiError = require('./api-error');

/**
 * @param {Express.Request} req
 * @param {Object} declaredParams
 * @returns {Object}
 */
function getParamsFromRequest(req, declaredParams) {
    return Object.keys(declaredParams).reduce(function (result, key) {
        // Param would be search in the next sources:
        //   * URL path.
        //   * Query.
        //   * Request body.
        result[key] = req.param(key);
        return result;
    }, {});
}

/**
 * API middleware.
 *
 * @param {String|Api} methodPathPattern Path to api files or an instance of Api class.
 *                                       Path includes a file mask (supports minimatch).
 * @param {Object} options Extra options.
 * @param {Boolean} options.disableDocPage Turn off generating page with documentation.
 * @param {Function} options.buildMethodName Function to build a method name.
 *  Should return a string for a provided express.Request.
 */
module.exports = function (methodPathPattern, options) {
    options = options || {};
    var api = methodPathPattern instanceof Api ? methodPathPattern : new Api(methodPathPattern);

    return function (req, res, next) {
        var methodName = options.buildMethodName ? options.buildMethodName(req) : req.param('method');

        /**
         * @param {Error} error
         */
        function showError(error) {
            // Work only with ApiError; otherwise, proxy an error
            if (!(error instanceof ApiError)) {
                next(error);
            }

            res.set('Content-Type', 'application/json;charset=utf-8');
            res.end(JSON.stringify({
                error: {
                    type: error.type || ApiError.INTERNAL_ERROR,
                    message: error.message
                }
            }));
        }

        if (!methodName && !options.disableDocPage) {
            return api.generateHelp('html')
                .then(function (html) {
                    res.set('Content-Type', 'text/html; charset=utf-8');
                    res.end(html);
                })
                .done();
        }

        try {
            var method = api.getMethod(methodName);
            var declaredParams = method.getParamsDeclarations();
            var params = getParamsFromRequest(req, declaredParams);

            if (method.getOption('executeOnServerOnly')) {
                throw new ApiError('BAD_REQUEST', 'Method can be executed only on server side');
            }

            return api.exec(methodName, params, req)
                .then(function (data) {
                    res.set('Content-Type', 'application/json;charset=utf-8');
                    res.end(JSON.stringify({
                        data: data
                    }));
                })
                .fail(showError);
        } catch (error) {
            showError(error);
        }
    };
};
