var API = require('../../lib/api');
var api = new API(__dirname + '/../api/**/*.api.js');

api.exec('hello', {name: 'Stepan'}).then(function (response) {
    console.log(response); // 'Hello, Stepan'
});
