var Api = require('./api');
var ApiError = require('./api-error');
var extend = require('extend');
var deprecate = require('depd')('BLA');

/**
 * Defines if the documentation page should be shown.
 *
 * @param {Object} options
 * @param {Boolean} [options.enableDocPage]
 * @param {Boolean} [options.disableDocPage]
 * @returns {Boolean} `true`, if should be shown.
 */
function isDocPageEnabled(options) {
    if (options.hasOwnProperty('disableDocPage')) {
        deprecate.property(options, 'disableDocPage', '`disableDocPage`. Use `enableDocPage` option instead.');
    }
    if (options.disableDocPage === true) {
        return false;
    }
    return options.enableDocPage === undefined || options.enableDocPage;
}

/**
 * API middleware.
 *
 * @param {String|Api} methodPathPattern Path to api files or an instance of Api class.
 *                                       Path includes a file mask (supports minimatch).
 * @param {Object} [options] Extra options.
 * @param {Boolean} [options.enableDocPage=true] Turn on generating page with documentation.
 * @param {Boolean} [options.disableDocPage=false] @deprecated Turn off generating page with documentation.
 * @param {Function} [options.buildMethodName] Function to build a method name.
 *  Should return a string for a provided express.Request.
 */
module.exports = function (methodPathPattern, options) {
    options = options || {};
    var api = methodPathPattern instanceof Api ? methodPathPattern : new Api(methodPathPattern);

    return function (req, res, next) {
        var methodName = options.buildMethodName ? options.buildMethodName(req) : req.params.method;

        if (req.method === 'POST' && !req.body) {
            throw new ApiError(
                ApiError.INTERNAL_ERROR,
                'body-parser middleware should be executed before BLA middleware.'
            );
        }

        if (isDocPageEnabled(options) && !methodName) {
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
                throw new ApiError(ApiError.BAD_REQUEST, 'Method can be executed only on server side');
            }
        } catch (e) {
            return next();
        }

        var params = extend(true, req.query, req.body);
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
