# baby-loris-api [![NPM version](https://badge.fury.io/js/baby-loris-api.png)](http://badge.fury.io/js/baby-loris-api) [![Build Status](https://secure.travis-ci.org/tarmolov/baby-loris-api.png)](http://travis-ci.org/tarmolov/baby-loris-api) [![Coverage Status](https://coveralls.io/repos/tarmolov/baby-loris-api/badge.png?branch=master)](https://coveralls.io/r/tarmolov/baby-loris-api?branch=master)

\[ [Quick start](#quick-start) • [Examples](#examples) • [Built-in API methods](#built-in-api-methods) • [API Reference](#api-reference) • [Contribution guide](CONTRIBUTION.md) • [Heroes](#thanks)\]

Provides helpers for writing your own API methods and using them from server and client sides.

## [View Demo project](https://github.com/tarmolov/weatherpic)

## Features
  * Simple integrating to your project.
  * The same interface of API methods on server and client sides.
  * Normalization request parameters.
  * Generating documentation for all declared API methods.
  * Joining all client requests into one during one tick (see [batch method](#baby-loris-api-batch)).
  * [Enb builder](examples/frontend/enb) support.

## Installation
```
npm install baby-loris-api --save
```

## Quick start
### Declare API Method
Write API method declaration.
```javascript
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

Save it to the file ```hello.api.js``` and move it to ```api``` directory.

### and use it on server side
```javascript
var Api = require('baby-loris-api');
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
var apiMiddleware = require('baby-loris-api/lib/middleware');
app
    .use(bodyParser.json())
    .use('/api/:method?', apiMiddleware(__dirname + '/api/**/*.api.js'));
```

Only then use api module.
```javascript
modules.require('baby-loris-api', function (Api) {
    var api = new Api('/api/');
    api.exec('hello', {name: 'Stepan'}).then(function (response) {
        console.log(response); // 'Hello, Stepan'
    });
});
```
See [Api class](#class-api-baby-loris-api) for more information.

**Note.** ```express 4.x``` is used in all examples. See [package.json](package.json#L31) for more details.

## Examples
  * Server side
    * [Basic usage](examples/backend/basic_usage.js)
  * Middleware
    * [Basic usage](examples/middleware/basic_usage.js)
    * [Separate express.Router for the middleware](examples/middleware/api_router.js)
    * [Without docpage](examples/middleware/without_docpage.js)
    * [Custom API method name builder](examples/middleware/build_method_name.js)
  * Frontend side
    * [Using YM module system](examples/frontend/ym)
    * [Using with enb builder](examples/frontend/enb)

Use makefile to run an example. For instance,
```
make run examples/backend/basic_usage.js
```

## Built-in API methods
### baby-loris-api-batch
This method is used on the client side and makes it possible to joint all requests to the server during one tick. It shortens number of request dramatically.

The client side uses this method by default and can be changed with ```disableBatch``` option.

## API Reference
  * Server side
    * [Class Api](#class-api)
      * [constructor(methodPathPattern)](#constructormethodpathpattern)
      * [exec(methodName, [params])](#execmethodname-params)
    * [Class ApiMethod](#class-apimethod)
      * [constructor(methodName)](#constructormethodname)
      * [setDescription(description)](#setdescriptiondescription)
      * [addParam(param)](#addparamparam)
      * [setAction(action)](#setactionaction)
      * [exec([params])](#execparams)
      * [setOption(name, value)](#setoptionname-value)
    * [Class ApiError](#class-apierror)
      * [Error types](#error-types)
    * [Express middleware](#express-middleware)
  * Frontend side
    * [Class Api (baby-loris-api)](#class-api-baby-loris-api)
      * [constructor(basePath, [options])](#constructorbasepath-options)
      * [exec(methodName, [params], [options])](#execmethodname-params-options)
    * [Class ApiError (baby-loris-api-error)](#class-apierror-baby-loris-api-error)

### Class Api
#### constructor(methodPathPattern)
Creates a new instance of API and collects all your API methods from ```methodPathPattern``` path. Path supports [minimatch](https://github.com/isaacs/minimatch).

Example:
```javascript
var Api = require('baby-loris-api');
var api = new Api(__dirname + '/api/**/*.api.js');
```

#### exec(methodName, [params])
Executes an API method ```methodName``` with provided ```params```.

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
Creates a new instance of API method with provided ```methodName```.

ApiMethod class supports chaining for methods: ```setDescription```, ```addParam```, and ```setAction```.

Example:
```javascript
var ApiMethod = require('baby-loris-api/lib/api-method');
var helloMethod = new ApiMethod('hello');
```
#### setDescription(description)
Change method description to provided ```description```.

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
| [type]        | String  | Parameter type (String, Number, Boolean, and etc) |
| [required]    | Boolean | Parameter should be required                      |

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

Declared parameters will be passed to the ```action``` function.

Example:
```javascript
helloMethod.setAction(function (params) {
    return 'Hello, world';
});
```

#### exec([params])
Executes an API method with provided ```params```.

Returns [vow.Promise](https://github.com/dfilatov/vow).
Promise will be resolved with a method response or rejected with [ApiError](#class-apierror).

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
ApiError is inherited from Javascript Error class. You can specify ```type``` of the error and ```message``` with human-readable desription of the error.

See bellow supported list of errors.

Example:
```javascript
var ApiError = require('baby-loris-api/lib/api-error');
throw new ApiError(ApiError.INTERNAL_ERROR, 'Internal server error');
```

#### Error types
  * ```ApiError.BAD_REQUEST``` — Invalid or missed parameter.
  * ```ApiError.INTERNAL_ERROR``` — Unspecified error or server logic error.
  * ```ApiError.NOT_FOUND``` — API method or middleware wasn't found.

### Express Middleware
```
var apiMiddleware = require('baby-loris-api/lib/middleware')(methodPathPattern, options)
```
The middleware adds support API to your Express application. You need to pass ```methodPathPattern``` as you did for Api class.

#### Options
Using the second paremeter ```options``` you can tune the middleware up.

| Name              | Type     | Description                                                                                         |
| ----------------- | -------- | --------------------------------------------------------------------------------------------------- |
| [disableDocPage]  | Boolean  | Turn off generating page with documentation. See [example](examples/middleware/without_docpage.js). |
| [buildMethodName] | Function | ```express.Request``` is passed to the function. The function should return a method name. By default methodName is grabbed by executing ```req.param('method')```. See [example](examples/middleware/build_method_name.js). |

Method parameters are collected from Express request using [req.param](http://expressjs.com/4x/api.html#req.param) method and req.session.

A parameter ```myparam``` would be search in the next sources:
  1. URL path (```/api/:myparam?```).
  2. Query string (```?myparam=1```).
  3. Request body.
  4. Express session (see [express-session](https://github.com/expressjs/session) for more details).

That means that you can use ```GET``` and ```POST``` methods from the client side as well.

**Note.** Don't forget to add [body-parser](https://github.com/expressjs/body-parser) middleware because the client module uses ```POST``` requests.

Also you must specify ```:method?``` parameter in the route path used by this middleware or ```buildMethodName``` function. Otherwise, the middleware couldn't find any API method at all.

If you don't provide any method name, the middleware will show your the list of all available API methods (special page with documentation). Specified descriptions for methods and params will be used for generating documentation.

Example:
```
var app = require('express')();
var bodyParser = require('body-parser');
var apiMiddleware = require('baby-loris-api/lib/middleware');

app
    .use(bodyParser.json())
    .use('/api/:method?', apiMiddleware(__dirname + '/../api/**/*.api.js'))
```

You can find a working examples in [example/middleware](examples/middleware) directory.

#### Response
The middleware returns JSON from the server with ```200``` status (even if an error occured). You can distinguish an error and successful response cheking ```data``` and ```error``` fields in the root object.

Example of a successful response:
```json
{
    "data": "Hello, Stepan"
}
```

Example of a error response:
```json
{
    "error": {
        "type": "BAD_REQUEST",
        "message": "missing name parameter"
    }
}
```

### Class Api (baby-loris-api)
Requirements:
  * [YM](https://github.com/ymaps/modules) module system.
  * [vow](https://github.com/dfilatov/vow) — DOM Promise and Promises/A+ implementation for Node.js and browsers.

This class is provided by ```baby-loris-api``` module.

#### constructor(basePath, [options])
Creates a new instance of client API. ```basePath``` is used to build path for ajax requests to the server. For example, if you define ```/api``` as a ```basePath``` then all request will be sent at ```https://<your host>/api/<method name>```.

Also you can specify extra options:

| Name             | Type    | Description                                                                               |
| ---------------- | ------- | ----------------------------------------------------------------------------------------- |
| [disableBatch]   | Boolean | Disable using [batch](#baby-loris-api-batch) for client requests (```false``` by default) |

Example:
```javascript
modules.require('baby-loris-api', function (Api) {
    var api = new Api('/api/');
});
```
#### exec(methodName, [params])
Sends a request to the server for executing API method with name ```methodName``` and provided ```params```.

### Class ApiError (baby-loris-api-error)
Requirements:
  * [YM](https://github.com/ymaps/modules) module system.

This class is provided by ```baby-loris-api-error``` module.

It works absolutely the same as [the server version of ApiError](#class-apierror).

## Thanks
  * [@mdevils](https://github.com/mdevils/) — an initial idea of building api methods for the server side using [enb](https://github.com/enb-make/enb).
  * [@dfilatov](https://github.com/dfilatov/) — an idea of using [glob](https://github.com/isaacs/node-glob) to find api methods, advice and recommendations.
  * [@dodev](https://github.com/dodev), [@dmikis](https://github.com/dmikis), [@lemmy-](https://github.com/lemmy-), and [@makishvili](https://github.com/makishvili) for review, advice, and right questions :)
