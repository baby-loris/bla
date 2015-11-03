var express = require('express');
var app = express();
var jade = require('jade');
var bodyParser = require('body-parser');
var bla = require('../../../lib');
var api = new bla.Api(__dirname + '/../../api/**/*.api.js');

module.exports =
app
    .set('views', __dirname)
    .set('view engine', 'jade')
    .use(bodyParser.json())
    .use('/blocks', express.static(__dirname + '/../../../blocks'))
    .use('/examples', express.static(__dirname + '/../../../examples'))
    .use('/node_modules', express.static(__dirname + '/../../../node_modules'))
    .use('/api/:method?', bla.apiMiddleware(api))
    .get('/', function (req, res) {
        res.render('page');
    })
    .listen(7777);

console.log('Go to http://127.0.0.1:7777/ and have fun.');
