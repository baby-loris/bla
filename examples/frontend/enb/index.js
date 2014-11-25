var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bla = require('../../../lib');
var api = new bla.Api(__dirname + '/../../api/**/*.api.js');

app
    .use(bodyParser.json())
    .use('/api/:method?', bla.apiMiddleware(api))
    .use('/pages', express.static(__dirname + '/pages'))
    .get('/', function (req, res) {
        res.sendFile(__dirname + '/pages/index/index.html');
    })
    .listen(8080);

console.log('Go to http://127.0.0.1:8080/ and have fun.');
