var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var apiMiddleware = require('../../../lib/middleware');
var enbServerMiddleware = require('enb/lib/server/server-middleware');
var dropRequireCache = require('enb/lib/fs/drop-require-cache');
var enbBuilder = enbServerMiddleware.createBuilder();

app
    .use(enbServerMiddleware.createMiddleware())
    .use(bodyParser.json())
    .use('/api/:method?', apiMiddleware(__dirname + '/../../api/**/*.api.js'))
    .get('/', function (req, res) {
        enbBuilder('/build/example/example.bt.js').then(function (fileName) {
            dropRequireCache(require, fileName);
            var bt = require(fileName);
            res.end(bt.apply({block: 'example-page'}));
        });
    })
    .listen(8080);

console.log('Go to http://127.0.0.1:8080/ and get fun.');
