var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var apiMiddleware = require('../../lib/middleware');

var apiRouter = express.Router()
    .use(bodyParser.json())
    .use('/:method?', apiMiddleware(__dirname + '/../api/**/*.api.js', {disableDocPage: true}));

app
    .use('/api/', apiRouter)
    .listen(8080);

console.log('Go to http://127.0.0.1:8080/api/ and make sure that there is no docpage.');
