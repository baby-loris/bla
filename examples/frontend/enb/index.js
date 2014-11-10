var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var apiMiddleware = require('../../../lib').apiMiddleware;

app
    .use(bodyParser.json())
    .use('/api/:method?', apiMiddleware(__dirname + '/../../api/**/*.api.js'))
    .use('/pages', express.static(__dirname + '/pages'))
    .get('/', function (req, res) {
        res.sendFile(__dirname + '/pages/index/index.html');
    })
    .listen(8080);

console.log('Go to http://127.0.0.1:8080/ and have fun.');
