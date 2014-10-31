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

        if (!req.body) {
            console.warn(
                '[BLA] body-parser middleware should be executed before BLA middleware.\n',
                '[BLA] The BLA middleware will be skipped.'
            );
            next();
            return;
        }

        if (!methodName && !options.disableDocPage) {
            return api.generateHelp('html')
                .then(function (html) {
                    res.send(html);
                })
                .done();
        }

        var method;
        try {
            method = api.getMethod(methodName);

            if (method.getOption('executeOnServerOnly')) {
                throw new ApiError('BAD_REQUEST', 'Method can be executed only on server side');
            }
        } catch (e) {
            return next();
        }

        var declaredParams = method.getParamsDeclarations();
        var params = getParamsFromRequest(req, declaredParams);

        return api.exec(methodName, params, req)
            .then(function (data) {
                res.json({
                    data: data
                });
            })
            .fail(function (error) {
                res.json({
                    error: {
                        type: error.type || ApiError.INTERNAL_ERROR,
                        message: error.message
                    }
                });
            });
    };
};
