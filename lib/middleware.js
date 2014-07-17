var Api = require('./api');

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
        //   * Session.
        result[key] = req.param(key) || req.session && req.session[key];
        return result;
    }, {});
}

/**
 * API middleware.
 *
 * @param {String} methodPathPattern Path to api files. Path includes a file mask (supports minimatch).
 * @param {Object} options Extra options.
 * @param {Boolean} options.disableDocPage Turn off generating page with documentation.
 * @param {Function} options.buildMethodName Function to build a method name.
 *  Should return a string for a provided express.Request.
 */
module.exports = function (methodPathPattern, options) {
    options = options || {};
    var api = new Api(methodPathPattern);

    return function (req, res) {
        var methodName = options.buildMethodName ? options.buildMethodName(req) : req.param('method');

        if (!methodName && !options.disableDocPage) {
            return api.generateHelp('html')
                .then(function (html) {
                    res.set('Content-Type', 'text/html; charset=utf-8');
                    res.end(html);
                })
                .done();
        }

        api.getMethod(methodName)
            .then(function (method) {
                var declaredParams = method.getParamsDeclarations();
                var params = getParamsFromRequest(req, declaredParams);

                return api.exec(methodName, params);
            })
            .then(function (data) {
                res.set('Content-Type', 'application/json;charset=utf-8');
                res.end(JSON.stringify({
                    data: data
                }));
            })
            .fail(function (error) {
                res.set('Content-Type', 'application/json;charset=utf-8');
                res.end(JSON.stringify({
                    error: {
                        type: error.type,
                        message: error.message
                    }
                }));
            });
    };
};
