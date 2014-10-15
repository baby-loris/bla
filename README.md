# bla [![NPM version](https://badge.fury.io/js/bla.png)](http://badge.fury.io/js/bla) [![Build Status](https://secure.travis-ci.org/baby-loris/bla.png)](http://travis-ci.org/baby-loris/bla) [![Coverage Status](https://coveralls.io/repos/baby-loris/bla/badge.png?branch=master)](https://coveralls.io/r/baby-loris/bla?branch=master)

\[ [Quick start](#quick-start) • [Examples](#examples) • [Built-in API methods](#built-in-api-methods) • [API Reference](#api-reference) • [Contribution guide](CONTRIBUTION.md) • [Heroes](#thanks)\]

Provides helpers for writing your own API methods and using them from server and client sides. See also [bla-presentation](http://baby-loris.github.io/bla-presentation/) for more details.

The package is versioned according to [SemVer](http://semver.org).

## [View Demo project](https://github.com/baby-loris/weatherpic)

## Features
  * Simple integration.
  * Consistent interface of API methods on the server and client sides.
  * Normalization for request parameters.
  * Automatic documentation generation for all declared API methods.
  * Joining all client requests into one during one tick (see [batch method](#bla-batch)).
  * [Enb builder](examples/frontend/enb) support.

## Installation
```
npm install bla --save
```

## Quick start
### Declare API Method
Write API method declaration.
```javascript
var ApiMethod = require('bla').ApiMethod;

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
First, include [API middleware](#express-middleware) to your express application.
```javascript
var app = require('express')();
var bodyParser = require('body-parser');
var apiMiddleware = require('bla').apiMiddleware;
app
    .use(bodyParser.json())
    .use('/api/:method?', apiMiddleware(__dirname + '/api/**/*.api.js'));
```

Include the client library to .
```html
<script type="text/javascript" src="build/bla.min.js"></script>
```
or specify `bla` as enb dependency in package.json.
```json
"enb": {
    "dependencies": [
        "bla"
    ]
}
```

Then use API module with [YM](https://github.com/ymaps/modules) module system
```javascript
modules.require('bla', function (Api) {
    var api = new Api('/api/');
    api.exec('hello', {name: 'Stepan'}).then(function (response) {
        console.log(response); // 'Hello, Stepan'
    });
});
```
with [require.js](http://requirejs.org/)
```javascript
require(['bla'], function (Api) {
    var api = new Api('/api/');
    api.exec('hello', {name: 'Stepan'}).then(function (response) {
        console.log(response); // 'Hello, Stepan'
    });
});
```
or without module system at all
```javascript
var api = new bla.Api('/api/');
api.exec('hello', {name: 'Stepan'}).then(function (response) {
    console.log(response); // 'Hello, Stepan'
});
```

See [Api class](#class-api-bla) for more information.

**Note.** `express 4.x` is used in all examples. See [package.json](package.json#L31) for more details.

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

## Built-in API methods
### bla-batch
This method is used on the client side and makes it possible to joint all requests to the server during one tick. It shortens number of request dramatically.

The client side uses this method by default and can be changed with `noBatching` option of [Api class constructor](#constructorbasepath-options) or the `noBatching` option of the [Api.exec method](#execmethodname-params-request).

Do you want the proves that batch is effective? See [bla-benchmark](https://github.com/baby-loris/bla-benchmark).

## API Reference
  * Server side
    * [Class Api](#class-api)
      * [constructor(methodPathPattern)](#constructormethodpathpattern)
      * [exec(methodName, [params], [request])](#execmethodname-params-request)
    * [Class ApiMethod](#class-apimethod)
      * [constructor(methodName)](#constructormethodname)
      * [setDescription(description)](#setdescriptiondescription)
      * [addParam(param)](#addparamparam)
      * [setAction(action)](#setactionaction)
      * [exec([params], [request])](#execparams-request)
      * [setOption(name, value)](#setoptionname-value)
    * [Class ApiError](#class-apierror)
      * [Error types](#error-types)
    * [Express middleware](#express-middleware)
  * Frontend side
    * [Class Api (bla)](#class-api-bla)
      * [constructor(basePath, [options])](#constructorbasepath-options)
      * [exec(methodName, [params])](#execmethodname-params)
    * [Class ApiError (bla-error)](#class-apierror-bla-error)

### Class Api
#### constructor(methodPathPattern)
Creates a new instance of API and collects all your API methods from `methodPathPattern` path. Path supports [minimatch](https://github.com/isaacs/minimatch).

Example:
```javascript
var Api = require('bla').Api;
var api = new Api(__dirname + '/api/**/*.api.js');
```

#### exec(methodName, [params], [request])
Executes an API method `methodName` with the provided `params`.

An express request can also be passed using `request` parameter. [The middleware](#express-middleware) proxies it for you.

Returns [vow.Promise](https://github.com/dfilatov/vow).
Promise will be resolved with a method response or rejected with [ApiError](#class-apierror).

Example:
```javascript
api.exec('hello', {name: 'Stepan'})
    .then(function (response) {
        console.log(response);
    })
    .fail(function (error) {
        console.log(error.message);
    });
```

### Class ApiMethod
#### constructor(methodName)
Creates a new instance of ApiMethod with provided `methodName`.

ApiMethod class supports chaining for it's methods: `setDescription`, `addParam`, and `setAction`.

Example:
```javascript
var ApiMethod = require('bla').ApiMethod;
var helloMethod = new ApiMethod('hello');
```
#### setDescription(description)
Change method description to provided `description`.

Example:
```javascript
helloMethod.setDescription('This is a hello method');
```

#### addParam(param)
Add a new param declaration.

API method param is an object with the follow fields:

| Name          | Type    | Description                                       |
| ------------- | ------- | ------------------------------------------------- |
| name          | String  | Parameter name                                    |
| description   | String  | Parameter description                             |
| \[type\]      | String  | Parameter type (String, Number, Boolean, etc.)    |
| \[required\]  | Boolean | Should the parameter be made obligatory           |

Example:
```javascript
helloMethod.addParam({
    name: 'name',
    description: 'User name',
    required: true
});
```

#### setAction(action)
Sets a function which should be executed when method runs.

Declared parameters will be passed to the `action` function as a first parameter. If the method is executed via the middleware, expresses request will be passed as a second parameter (`undefined` for server side execution).

Example:
```javascript
helloMethod.setAction(function (params, request) {
    return 'Hello, world';
});
```

A third parameter is an [Api](#class-api) instance. It's very useful in cases when the api method executes other api methods.

Example:
```javascript
method.setAction(function (params, request, api) {
    return api.exec('method1');
});
```

#### exec([params], [request])
Executes an API method with provided `params`.

An express request can also be passed using `request` parameter. [The middleware](#express-middleware) proxies it for you.

Returns [vow.Promise](https://github.com/dfilatov/vow).
The promise will be resolved with a method response or rejected with [ApiError](#class-apierror).

Example:
```javascript
helloMethod.exec({name: 'Stepan'})
    .then(function (response) {
        console.log(response);
    })
    .fail(function (error) {
        console.log(error.message);
    });
```

#### setOption(name, value)
Sets an extra option for the method.

List of available options:

| Name                | Type     | Description                                    |
| ------------------- | -------- | ---------------------------------------------- |
| hiddenOnDocPage     | Boolean  | Hides the API method in built documentation.   |
| executeOnServerOnly | Boolean  | Permit to execute method only on server side . |

### Class ApiError
#### constructor(type, message)
ApiError is inherited from JavaScript Error class. You can specify `type` of the error and `message` with human-readable description of the error.

See bellow supported list of errors.

Example:
```javascript
var ApiError = require('bla').ApiError;
throw new ApiError(ApiError.INTERNAL_ERROR, 'Internal server error');
```

#### Error types
  * `ApiError.BAD_REQUEST` — Invalid or missed parameter.
  * `ApiError.INTERNAL_ERROR` — Unspecified error or error in server logic.
  * `ApiError.NOT_FOUND` — API method or middleware wasn't found.

### Express Middleware
```
var apiMiddleware = require('bla').apiMiddleware(methodPathPattern, options)
```
The middleware adds a route path for API to your Express application. You need to pass `methodPathPattern` as you did for Api class or an Api instance itself.

**Note.** The middleware always proxies an express request to an executed method.

#### Options
Using the second paremeter `options` you can tune the middleware up.

| Name              | Type     | Description                                                                                         |
| ----------------- | -------- | --------------------------------------------------------------------------------------------------- |
| \[disableDocPage\]  | Boolean  | Turn off generating page with documentation. See [example](examples/middleware/without_docpage.js). |
| \[buildMethodName\] | Function | `express.Request` is passed to the function. The function should return a method name. By default methodName is grabbed by executing `req.param('method')`. See [example](examples/middleware/build_method_name.js). |

Method parameters are collected from Express request using [req.param](http://expressjs.com/4x/api.html#req.param) method.

For example, the apiMiddleware will look for a parameter named `myparam` in the following order:
  1. In the URL path (`/api/:myparam?`).
  2. In the request's query string (`?myparam=1`).
  3. In the request's body.

The middleware accepts `GET` and `POST` requests from the client.

**Note.** Don't forget to add [body-parser](https://github.com/expressjs/body-parser) middleware, because the provided client module uses `POST` requests.

Also you must specify `:method?` parameter in the route path used by this middleware or `buildMethodName` function. Otherwise, the middleware won't find the API method name.

If you don't provide any method name, the middleware will show your the list of all available API methods (special page with documentation). Specified descriptions for methods and params will be used for generating documentation.

Example:
```
var app = require('express')();
var bodyParser = require('body-parser');
var apiMiddleware = require('bla').apiMiddleware;

app
    .use(bodyParser.json())
    .use('/api/:method?', apiMiddleware(__dirname + '/../api/**/*.api.js'))
```

You can find a working examples in [example/middleware](examples/middleware) directory.

#### Response
The middleware returns a response with a JSON string and a `200` status code (even if an error occured). You can distinguish an error and successful response by checking the `data` and `error` fields in the root of the response object.

Example of a successful response:
```json
{
    "data": "Hello, Stepan"
}
```

Example of a response with an error:
```json
{
    "error": {
        "type": "BAD_REQUEST",
        "message": "missing name parameter"
    }
}
```

### Class Api (bla)
Requirements:
  * [vow](https://github.com/dfilatov/vow) — DOM Promise and Promises/A+ implementation for Node.js and browsers.

#### constructor(basePath, [options])
Creates a new instance of client API. `basePath` is used to build the path for AJAX requests to the server. For example, if you define `/api` as a `basePath` then all request will be sent to `https://<your host>/api/<method name>`.

Also you can specify an extra options:

| Name           | Type               | Description                                                                                                                                                               |
| -------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \[noBatching\] | Boolean|String\[\] | Disable using [batch](#bla-batch) for all client requests (`false` by default), or if an array of strings is passed, disable batching only for specific methods. |

You can use the client-side bundle of bla with different module system. For example:
```javascript
// ym
modules.require('bla', function (Api) {
    var api = new Api('/api/');
});

// require.js
require(['bla'], function (Api) {
    var api = new Api('/api/');
});

// without module system
var api = new bla.Api('/api/');
```
There are two ways for using the `noBatching` parameter.
Disable batching globally:
```javascript
// all api.exec() calls will NOT be batched
var api = new Api('/api/', {noBatching: true});
```
Disable batching per method:
```javascript
// api.exec() calls with method name argument 'slow-poke' will not be batched
var api = new Api('/api/', {noBatching: ['slow-poke']});
```
#### exec(methodName, [params], [execOptions])
Sends a request to the server for executing API method with name `methodName` and provided `params`. The options argument is used for changing the method behavior.
The method returns a [vow.Promise](http://dfilatov.github.io/vow/).

| Name           | Type    | Description                                                                |
| -------------- | ------- | -------------------------------------------------------------------------- |
| \[noBatching\] | Boolean | Disable using [batch](#bla-batch) for current request (`false` by default) |

For example:
```javascript
api.exec('hello')
    .then(function (response) {
        // Be polite! Handle the 'response' properly.
        // ...
    })
    .fail(function (reason) {
        // Even when rejected, a gentleman shouldn't lose his temper. Do something with the 'reason'.
        // ...
    });
```
### Class ApiError (bla-error)

It works absolutely the same as [the server version of ApiError](#class-apierror).

## Thanks
  * [@mdevils](https://github.com/mdevils/) — an initial idea of building api methods for the server side using [enb](https://github.com/enb-make/enb).
  * [@dfilatov](https://github.com/dfilatov/) — an idea of using [glob](https://github.com/isaacs/node-glob) to find api methods, advice and recommendations.
  * [@dodev](https://github.com/dodev), [@dmikis](https://github.com/dmikis), [@lemmy-](https://github.com/lemmy-), and [@makishvili](https://github.com/makishvili) for review, advice, and right questions :)
