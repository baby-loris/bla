var Api = require('../../lib').Api;
var api = new Api(__dirname + '/../api/**/*.api.js');

// it's very useful to create an Api instance in one file
// and use it everywhere in your project (server side and middleware)
module.exports = api;
