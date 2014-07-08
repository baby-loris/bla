var Api = require('./api');
var path = require('path');

/**
 * API middleware.
 *
 * @param {String} methodPathPattern Path to api files. Path includes a file mask (supports minimatch).
 */
module.exports = function (methodPathPattern) {
    var api = new Api(methodPathPattern);

    return function (req, res, next) {
        var methodName = req.param('method');

        if (!methodName) {
            return api.generateHelp('html')
                .then(function (html) {
                    res.end(html);
                })
                .done();
        }

        // Depends on request method (get, post, and etc.) params could be in several places.
        // isExpressRequest means that all needed params will be copied from Express request using req.param.
        api.exec(methodName, req, {isExpressRequest: true})
            .then(function (data) {
                res.set('Content-Type', 'application/json;charset=utf-8');
                res.end(JSON.stringify({
                    data: data
                }));
            })
            .fail(function (error) {
                res.end(JSON.stringify({
                    error: {
                        status: error.status || 500,
                        message: error.message
                    }
                }));
            });
    };
};
