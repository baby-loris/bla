var express = require('express');
var app = express();
var apiMiddleware = require('../../../lib').apiMiddleware;
var jade = require('jade');
var bodyParser = require('body-parser');

app
    .set('views', __dirname)
    .set('view engine', 'jade')
    .use(bodyParser.json())
    .use('/blocks', express.static(__dirname + '/../../../blocks'))
    .use('/examples', express.static(__dirname + '/../../../examples'))
    .use('/node_modules', express.static(__dirname + '/../../../node_modules'))
    .use('/api/:method?', apiMiddleware(__dirname + '/../../api/**/*.api.js'))
    .get('/', function (req, res) {
        res.render('page');
    })
    .listen(8080);

console.log('Go to http://127.0.0.1:8080/ and get fun.');
