var app = require('express')();
var bodyParser = require('body-parser');
var bla = require('../../lib');
var api = new bla.Api(__dirname + '/../api/**/*.api.js');

/**
 * Build a custom method name.
 *
 * @param {express.Request} req
 * @returns {String}
 */
function buildMethodName(req) {
    return [
        req.params.service,
        req.params.subservice
    ].filter(Boolean).join('-');
}

module.exports =
app
    .use(bodyParser.json())
    .use(
        '/api/:service?/:subservice?',
        bla.apiMiddleware(api, {buildMethodName: buildMethodName})
    )
    .listen(7777);

console.log(
    'The same API method will be executed on %s and %s'
        .replace('%s', 'http://127.0.0.1:7777/api/get/kittens')
        .replace('%s', 'http://127.0.0.1:7777/api/get-kittens')
);
