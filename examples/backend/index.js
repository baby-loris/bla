var API = require('../../lib/api');
var api = new API(__dirname + '/../api/**/*.api.js');

api.exec('hello', {name: 'Stepan'}).then(function (response) {
    console.log(response); // 'Hello, Stepan'
});

api.exec('summ', {a: 1, b: 1}).then(function (response) {
    console.log('1 + 1 = ' + response); // '1 + 1 = 2'
});
