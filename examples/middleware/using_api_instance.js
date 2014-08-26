var app = require('express')();
var bodyParser = require('body-parser');
var api = require('../backend/export');
var apiMiddleware = require('../../lib/index').apiMiddleware;

app
    .use(bodyParser.json())
    .use('/api/:method?', apiMiddleware(api))
    .listen(8080);

console.log('Go to http://127.0.0.1:8080/api/ and choose any available API method.');
