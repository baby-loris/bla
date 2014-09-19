var Api = require('../../lib').Api;
var api = new Api(__dirname + '/../api/**/*.api.js');

api.exec('hello', {name: 'Stepan'}).then(function (response) {
    console.log(response); // 'Hello, Stepan'
});
