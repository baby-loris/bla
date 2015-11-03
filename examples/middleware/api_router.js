var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bla = require('../../lib');
var api = new bla.Api(__dirname + '/../api/**/*.api.js');

var apiRouter = express.Router()
    .use(bodyParser.json())
    .use('/:method?', bla.apiMiddleware(api));

module.exports =
app
    .use('/api/', apiRouter)
    .listen(7777);

console.log('Go to http://127.0.0.1:7777/api/ and choose any available API method.');
