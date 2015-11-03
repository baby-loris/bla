var app = require('express')();
var bodyParser = require('body-parser');
var api = require('../backend/export');
var apiMiddleware = require('../../lib').apiMiddleware;

module.exports =
app
    .use(bodyParser.json())
    .use('/api/:method?', apiMiddleware(api))
    .listen(7777);

console.log('Go to http://127.0.0.1:7777/api/ and choose any available API method.');
