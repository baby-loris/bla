# baby-loris-api

Provides helpers to support API in your baby-loris project.

## Installation
```
npm install baby-loris-api --save
```

## Quick start
### Declaring API method
Create file for your API method:
```
touch api/hello.api.js
```

Add API method declaration.
```
var ApiMethod = require('baby-loris-api/lib/api-method');

module.exports = new ApiMethod('hello')
    .setDescription('Hello API method')
    .addParam({
        name: 'name',
        description: 'User name',
        required: true
    })
    .setAction(function (params) {
        return 'Hello, ' + params.name;
    });
```
### Using on server side
```
var Api = require('baby-loris-api');
var api = new Api(__dirname + '/api/**/*.api.js');
api.exec('hello', {name: 'Stepan'}).then(function (response) {
    console.log(response); // 'Hello, Stepan'
});
```

### Using on frontend side
First, include middleware to your express application.
```
var app = express();
var apiMiddleware = require('baby-loris-api/lib/middleware');
app
    .use('/api/:method?', apiMiddleware(__dirname + '/api/**/*.api.js'));
```

Only then use api module.
```
modules.require('api', function (Api) {
    var api = new Api('/api/');
    api.exec('hello', {name: 'Stepan'}).then(function (response) {
        console.log(response); // 'Hello, Stepan'
    });
});
```
**Note.** You need to use [YM](https://github.com/ymaps/modules) in your project.

## Examples
You can find examples in examples folder.

Use makefile to run an example. For instance,
```
make example examples/frontend
```
