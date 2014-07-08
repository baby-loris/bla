var express = require('express');
var app = express();
var apiMiddleware = require('../../lib/middleware');
var jade = require('jade');
var vowFs = require('vow-fs');
var path = require('path');
var bodyParser = require('body-parser');

function serveJsFilesFrom(dirName) {
    return express.Router()
        .use('/' + dirName, function (req, res, next) {
            res.set('Content-Type', 'text/javascript');
            next();
        })
        .use('/' + dirName, express.static(__dirname + '/../../' + dirName))
}

app
    .use(bodyParser.urlencoded({extended: false}))
    .use(serveJsFilesFrom('blocks'))
    .use(serveJsFilesFrom('examples'))
    .use(serveJsFilesFrom('node_modules'))
    .use('/api/:method?', apiMiddleware(__dirname + '/../api/**/*.api.js'))
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
