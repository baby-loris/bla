# bla [![NPM version](https://badge.fury.io/js/bla.png)](http://badge.fury.io/js/bla) [![Build Status](https://secure.travis-ci.org/baby-loris/bla.png)](http://travis-ci.org/baby-loris/bla) [![Coverage Status](https://coveralls.io/repos/baby-loris/bla/badge.png?branch=master)](https://coveralls.io/r/baby-loris/bla?branch=master)

\[ [Quick start](#quick-start) • [Examples](#examples) • [Built-in API methods](#built-in-api-methods) • [API Reference](REFERENCE.md) • [Contribution guide](CONTRIBUTION.md) • [Heroes](#thanks)\]

Provides helpers for writing your own API methods and using them from server and client sides. See also [bla-presentation](http://baby-loris.github.io/bla-presentation/) for more details.

The package is versioned according to [SemVer](http://semver.org).

## [View Demo project](https://github.com/baby-loris/weatherpic)

## Features
  * Simple integration.
  * Consistent interface of API methods on the server and client sides.
  * Normalization for request parameters.
  * Automatic documentation generation for all declared API methods.
  * Joining all client requests into one during one tick (see [batch method](#batch)).
  * Works with the most popular module systems.

## Browser support
[![Sauce Test Status](https://saucelabs.com/browser-matrix/baby-loris.svg)](https://saucelabs.com/u/baby-loris)

## Installation
```
npm install bla --save
```

## Quick start
### Declare API Method
Write API method declaration.
```javascript
var ApiMethod = require('bla').ApiMethod;

module.exports = new ApiMethod({
    name: 'hello',
    description: 'Returns greeting from server',
    params: {
        name: {
            description: 'User name',
            required: true
        }
    },
    action: function (params) {
        return 'Hello, ' + params.name;
    }
});
```

And save it to `api/hello.api.js`.

### and use it on server side
```javascript
var Api = require('bla').Api;
var api = new Api(__dirname + '/api/**/*.api.js');
api.exec('hello', {name: 'Stepan'}).then(function (response) {
    console.log(response); // 'Hello, Stepan'
});
```

### or on frontend side
First, include [API middleware](REFERENCE.md#express-middleware) to your express application.
```javascript
var app = require('express')();
var bodyParser = require('body-parser');
var bla = require('bla');
var api = new bla.Api(__dirname + '/../api/**/*.api.js');

app
    .use(bodyParser.json())
    .use('/api/:method?', bla.apiMiddleware(api));
```
Include the client library to your page.
```html
<script type="text/javascript" src="build/bla.min.js"></script>
```
Then execute any declared ApiMethod.
```javascript
var api = new bla.Api('/api/');
api.exec('hello', {name: 'Stepan'}).then(function (response) {
    console.log(response); // 'Hello, Stepan'
});
```
BLA works with the most popular module systems. See [Examples of frontend side](#examples).

See [Api class](REFERENCE.md#class-api-bla) for more information.

## [Full API Reference](REFERENCE.md)

## Examples
  * Api methods
    * [Simple hello method](examples/api/hello.api.js)
    * [Throwing ApiError](examples/api/the-matrix-source.api.js)
    * [Getting data by http](examples/api/get-kittens.api.js)
    * [Using express request](examples/api/geolocation.api.js)
  * Server side
    * [Basic usage](examples/backend/basic_usage.js)
    * [Export Api as a module](examples/backend/export.js)
  * Middleware
    * [Basic usage](examples/middleware/basic_usage.js)
    * [Using exesting Api instance](examples/middleware/using_api_instance.js)
    * [Separate express.Router for the middleware](examples/middleware/api_router.js)
    * [Without docpage](examples/middleware/without_docpage.js)
    * [Custom API method name builder](examples/middleware/build_method_name.js)
  * Frontend side
    * [Using YM module system](examples/frontend/ym)
    * [Using with require.js](examples/frontend/requirejs)
    * [Using with enb builder](examples/frontend/enb)
    * [Without module system (using ```bla``` namespace)](examples/frontend/bla)

Use makefile to run an example. For instance,
```
make run examples/backend/basic_usage.js
```

**Note.** `express 4.x` is used in all examples. See [package.json](package.json#L31) for more details.

## Built-in API methods
### batch
This method is used on the client side and makes it possible to joint all requests to the server during one tick. It shortens number of request dramatically.

The client side uses this method by default and can be changed with `enableBatching` option of [Api class constructor](REFERENCE.md#constructorbasepath-options) or the `enableBatching` option of the [Api.exec method](REFERENCE.md#execmethodname-params-request).

Do you want the proves that batch is effective? See [bla-benchmark](https://github.com/baby-loris/bla-benchmark).

Also don't forget to install [a special chrome extension](https://github.com/baby-loris/bla-batch-chrome-extension) ;)

## Thanks
  * [@mdevils](https://github.com/mdevils/) — an initial idea of building api methods for the server side using [enb](https://github.com/enb-make/enb).
  * [@dfilatov](https://github.com/dfilatov/) — an idea of using [glob](https://github.com/isaacs/node-glob) to find api methods, advice and recommendations.
  * [@dodev](https://github.com/dodev), [@dmikis](https://github.com/dmikis), [@lemmy-](https://github.com/lemmy-), and [@makishvili](https://github.com/makishvili) for review, advice, and right questions :)
