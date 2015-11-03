var app = require('express')();
var bodyParser = require('body-parser');
var bla = require('../../lib');
var api = new bla.Api(__dirname + '/../api/**/*.api.js');

module.exports =
app
    .use(bodyParser.json())
    .use('/api/:method?', bla.apiMiddleware(api))
    .listen(7777);

console.log('Go to http://127.0.0.1:7777/api/ and choose any available API method.');
