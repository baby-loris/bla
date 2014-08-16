var express = require('express');
var app = express();
var apiMiddleware = require('../../../lib/middleware');
var jade = require('jade');
var vowFs = require('vow-fs');
var bodyParser = require('body-parser');

app
    .use(bodyParser.json())
    .use('/blocks', express.static(__dirname + '/../../../blocks'))
    .use('/examples', express.static(__dirname + '/../../../examples'))
    .use('/node_modules', express.static(__dirname + '/../../../node_modules'))
    .use('/api/:method?', apiMiddleware(__dirname + '/../../api/**/*.api.js'))
    .get('/', function (req, res) {
        var path = __dirname + '/page.jade';
        vowFs.read(path)
            .then(function (file) {
                var html = jade.compile(file.toString())();
                res.end(html);
            })
            .done();
    })
    .listen(8080);

console.log('Go to http://127.0.0.1:8080/ and get fun.');
